import { Film, Search, Tv } from "lucide-react";
import { type ReactNode, useState } from "react";
import { flattenProviderSearchResults } from "@/client/hooks/use-providers";
import { useRematchMetadata } from "@/client/hooks/use-rematch-metadata";
import { AppEmptyState } from "@/components/app-states";
import { CandidateSkeletonList } from "@/components/candidate-skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { m } from "@/paraglide/messages";
import { IdentifyCandidateCard } from "./identify/identify-candidate-card";
import { IdentifySearchForm } from "./identify/identify-search-form";

export function IdentifyDialog({
	metadataId,
	mediaType,
	initialTitle,
	initialYear,
	open,
	onOpenChange,
}: {
	metadataId: string;
	mediaType: "movie" | "tv_show";
	initialTitle: string;
	initialYear?: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [actionMode, setActionMode] = useState<"replace" | "supplement">("replace");
	const [selectedCandidate, setSelectedCandidate] = useState<{ providerId: string; externalId: string } | null>(null);

	const { searchResults, isSearching, triggerSearch, triggerExternalIdSearch, rematch, isRematching, linkProvider, isLinking } =
		useRematchMetadata({
			metadataId,
			mediaType,
			initialTitle,
			initialYear,
			onSuccess: () => onOpenChange(false),
		});

	const isApplying = isRematching || isLinking;

	const handleApply = (providerId: string, externalId: string) => {
		setSelectedCandidate({ providerId, externalId });
		if (actionMode === "supplement") {
			linkProvider({ providerId, externalId });

			return;
		}

		rematch({ providerId, externalId });
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl">
						{mediaType === "movie" ? <Film className="size-5 text-primary" /> : <Tv className="size-5 text-primary" />}
						{m.identify_dialog_change_match()}
					</DialogTitle>
					<DialogDescription>
						{actionMode === "supplement" ? m.components_identify_fill_from_provider() : m.components_identify_replace_match_hint()}
					</DialogDescription>
				</DialogHeader>

				<ToggleGroup
					variant="outline"
					size="sm"
					value={[actionMode]}
					onValueChange={(next) => {
						const mode = next[next.length - 1];
						if (mode === "replace" || mode === "supplement") setActionMode(mode);
					}}
					className="w-fit"
				>
					<ToggleGroupItem value="replace" className="px-3">
						{m.common_replace_match()}
					</ToggleGroupItem>
					<ToggleGroupItem value="supplement" className="px-3">
						{m.components_identify_fill_gaps()}
					</ToggleGroupItem>
				</ToggleGroup>

				<IdentifySearchForm
					initialTitle={initialTitle}
					initialYear={initialYear}
					isSearching={isSearching}
					onSearchByTitle={(title, year) => triggerSearch(title, year)}
					onSearchById={(providerId, externalId) => triggerExternalIdSearch(providerId, externalId)}
				/>

				<div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">{resultsContent}</div>
			</DialogContent>
		</Dialog>
	);
}
