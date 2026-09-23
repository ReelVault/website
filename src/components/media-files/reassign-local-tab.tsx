import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Check, FolderSearch } from "lucide-react";
import { type ReactNode, startTransition, useState } from "react";
import { reelvault } from "@/client/client";
import { useAdminReassignMediaFile } from "@/client/hooks/use-admin-media";
import { metadataKeys } from "@/client/utils/query-keys";
import { AppEmptyState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { CandidateSkeletonList } from "@/components/candidate-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { m } from "@/paraglide/messages";
import { ReassignLocalCard } from "./reassign-local-card";
import { ReassignTvSelectors } from "./reassign-tv-selectors";

interface ReassignLocalTabProps {
	mediaFileId: string;
	mediaType: "movie" | "tv_show";
	onSuccess: () => void;
}

export function ReassignLocalTab({ mediaFileId, mediaType, onSuccess }: ReassignLocalTabProps) {
	const [localSearch, setLocalSearch] = useState("");
	const debouncedLocalSearch = useDebounce({ value: localSearch, delay: 300 });
	const [selectedLocalMetadataId, setSelectedLocalMetadataId] = useState<string | null>(null);
	const [selectedLocalSeasonId, setSelectedLocalSeasonId] = useState<string | null>(null);
	const [selectedLocalEpisodeId, setSelectedLocalEpisodeId] = useState<string | null>(null);

	const { reassignMediaFile, isReassigning } = useAdminReassignMediaFile();

	const localQuery = useQuery({
		queryKey: metadataKeys.reassignSearch(mediaType, debouncedLocalSearch),
		placeholderData: keepPreviousData,
		queryFn: () =>
			reelvault.metadata.getAll({
				page: 1,
				limit: 15,
				title: debouncedLocalSearch.trim() || undefined,
				type: mediaType,
				sortBy: "updatedAt",
				sortOrder: "desc",
			}),
		staleTime: 1000 * 60,
	});

	const handleApplyLocal = (): void => {
		if (!selectedLocalMetadataId) return;

		let episodeId: string | undefined;
		if (mediaType === "tv_show" && selectedLocalEpisodeId) {
			episodeId = selectedLocalEpisodeId;
		}

		startTransition(async () => {
			try {
				await reassignMediaFile({
					mediaFileId,
					body: {
						targetMetadataId: selectedLocalMetadataId,
						episodeId,
					},
				});
				onSuccess();
			} catch {
				// handled in hook
			}
		});
	};

	const localItems = localQuery.data?.data ?? [];

	const handleLocalMetadataSelect = (metadataId: string) => {
		setSelectedLocalMetadataId(metadataId);
		setSelectedLocalSeasonId(null);
		setSelectedLocalEpisodeId(null);
	};

	let localContent: ReactNode;
	if (localQuery.isPending) {
		localContent = (
			<div className="grid gap-2.5 sm:grid-cols-2">
				<CandidateSkeletonList variant="compact" keyPrefix="local-skel" />
			</div>
		);
	} else if (localQuery.isError) {
		localContent = (
			<AppEmptyState
				icon={FolderSearch}
				title={m.components_reassign_local_error()}
				description={m.components_reassign_local_fetch_failed()}
				className="min-h-36"
				action={
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							startTransition(async () => {
								await localQuery.refetch();
							})
						}
					>
						{m.common_try_again()}
					</Button>
				}
			/>
		);
	} else if (localItems.length === 0) {
		localContent = (
			<AppEmptyState
				icon={FolderSearch}
				title={m.components_reassign_local_no_matches()}
				description={m.components_reassign_local_hint()}
				className="min-h-36"
			/>
		);
	} else {
		localContent = (
			<div className="grid gap-2.5 sm:grid-cols-2">
				{localItems.map((item) => (
					<ReassignLocalCard
						key={item.id}
						item={item}
						isSelected={selectedLocalMetadataId === item.id}
						onSelect={handleLocalMetadataSelect}
					/>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4 pt-3">
			<div className="space-y-1.5">
				<Label htmlFor="local-search">{m.components_search_local_library()}</Label>
				<Input
					id="local-search"
					value={localSearch}
					onChange={(e) => setLocalSearch(e.target.value)}
					placeholder={m.components_filter_by_title()}
				/>
			</div>

			<div className="max-h-[38vh] overflow-y-auto pr-1">{localContent}</div>

			{/* For TV Show: Season and Episode Selectors */}
			{mediaType === "tv_show" && selectedLocalMetadataId && (
				<ReassignTvSelectors
					metadataId={selectedLocalMetadataId}
					selectedSeasonId={selectedLocalSeasonId}
					onSeasonChange={(id) => {
						setSelectedLocalSeasonId(id);
						setSelectedLocalEpisodeId(null);
					}}
					selectedEpisodeId={selectedLocalEpisodeId}
					onEpisodeChange={setSelectedLocalEpisodeId}
				/>
			)}

			<div className="flex justify-end pt-2">
				<AsyncButton
					type="button"
					isPending={isReassigning}
					pendingLabel={m.components_assigning()}
					disabled={!selectedLocalMetadataId || (mediaType === "tv_show" && !selectedLocalEpisodeId)}
					onClick={handleApplyLocal}
					className="gap-2"
				>
					<Check className="size-4" />
					{m.components_assign_to_selected()}
				</AsyncButton>
			</div>
		</div>
	);
}
