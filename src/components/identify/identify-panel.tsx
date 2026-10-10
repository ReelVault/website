import { Search } from "lucide-react";
import { type ReactNode, useState } from "react";
import { flattenProviderSearchResults } from "@/client/hooks/use-providers";
import { useRematchMetadata } from "@/client/hooks/use-rematch-metadata";
import { AppEmptyState } from "@/components/app-states";
import { CandidateSkeletonList } from "@/components/candidate-skeleton";
import { PreferenceToggle } from "@/components/preference-controls";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { m } from "@/paraglide/messages";
import { IdentifyCandidateCard } from "./identify-candidate-card";
import { IdentifySearchForm } from "./identify-search-form";

interface IdentifyPanelProps {
	metadataId: string;
	mediaType: "movie" | "tv_show";
	initialTitle: string;
	initialYear?: number;
	/** The dialog keeps its results in a scrollable box; the page scrolls with the whole page. */
	variant: "dialog" | "page";
	onApplied: () => void;
}

/**
 * The matching flow shared by the identify dialog and the identify page: choose replace or fill gaps, search by
 * title or by provider id, then apply one of the candidates to the title.
 */
export function IdentifyPanel({ metadataId, mediaType, initialTitle, initialYear, variant, onApplied }: IdentifyPanelProps) {
	const [actionMode, setActionMode] = useState<"replace" | "supplement">("replace");
	const [selectedCandidate, setSelectedCandidate] = useState<{ providerId: string; externalId: string } | null>(null);
	const [overwriteLocked, setOverwriteLocked] = useState(false);

	const { searchResults, isSearching, triggerSearch, triggerExternalIdSearch, rematch, isRematching, linkProvider, isLinking } =
		useRematchMetadata({
			metadataId,
			mediaType,
			initialTitle,
			initialYear,
			onSuccess: onApplied,
		});

	const isApplying = isRematching || isLinking;

	const handleApply = (providerId: string, externalId: string) => {
		setSelectedCandidate({ providerId, externalId });
		if (actionMode === "supplement") {
			linkProvider({ providerId, externalId });

			return;
		}

		rematch({ providerId, externalId, overwriteLocked });
	};

	const allCandidates = flattenProviderSearchResults(searchResults);

	let resultsContent: ReactNode;
	if (isSearching) {
		resultsContent = (
			<div className="grid gap-3 sm:grid-cols-2">
				<CandidateSkeletonList variant="default" keyPrefix="skeleton" />
			</div>
		);
	} else if (allCandidates.length === 0) {
		resultsContent = (
			<AppEmptyState
				icon={Search}
				title={m.components_search_no_results()}
				description={m.components_identify_no_matches()}
				className="min-h-48"
			/>
		);
	} else {
		resultsContent = (
			<div className="grid gap-3 sm:grid-cols-2">
				{allCandidates.map((candidate) => {
					const isCurrentSelecting =
						isApplying && selectedCandidate?.providerId === candidate.providerId && selectedCandidate.externalId === candidate.externalId;

					return (
						<IdentifyCandidateCard
							key={`${candidate.providerId}-${candidate.externalId}`}
							candidate={candidate}
							isCurrentSelecting={isCurrentSelecting}
							isApplying={isApplying}
							actionMode={actionMode}
							onApply={handleApply}
						/>
					);
				})}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col gap-2">
				<p className="text-muted-foreground text-sm">
					{actionMode === "supplement" ? m.components_identify_fill_from_provider() : m.components_identify_replace_match_hint()}
				</p>
				<ToggleGroup
					variant="outline"
					size="sm"
					value={[actionMode]}
					onValueChange={(next) => {
						const mode = next[next.length - 1];
						if (mode === "replace" || mode === "supplement") setActionMode(mode);
					}}
					className="w-fit max-w-full"
				>
					<ToggleGroupItem value="replace" className="px-3">
						{m.common_replace_match()}
					</ToggleGroupItem>
					<ToggleGroupItem value="supplement" className="px-3">
						{m.components_identify_fill_gaps()}
					</ToggleGroupItem>
				</ToggleGroup>
			</div>

			{actionMode === "replace" && (
				<PreferenceToggle
					label={m.identify_overwrite_locked_label()}
					description={m.identify_overwrite_locked_desc()}
					checked={overwriteLocked}
					onChange={setOverwriteLocked}
				/>
			)}

			<IdentifySearchForm
				initialTitle={initialTitle}
				initialYear={initialYear}
				isSearching={isSearching}
				onSearchByTitle={(title, year) => triggerSearch(title, year)}
				onSearchById={(providerId, externalId) => triggerExternalIdSearch(providerId, externalId)}
			/>

			<div className={variant === "dialog" ? "max-h-[60vh] overflow-y-auto pr-1" : undefined}>{resultsContent}</div>
		</div>
	);
}
