import { Search } from "lucide-react";
import { type ReactNode, startTransition, useState } from "react";
import { useAdminReassignMediaFile } from "@/client/hooks/use-admin-media";
import { flattenProviderSearchResults, useProviderSearch } from "@/client/hooks/use-providers";
import { AppEmptyState } from "@/components/app-states";
import { CandidateSkeletonList } from "@/components/candidate-skeleton";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { ReassignTmdbCandidateCard } from "./reassign-tmdb-candidate-card";
import { ReassignTmdbSearchForm, type TmdbSearchParams } from "./reassign-tmdb-search-form";

interface ReassignTmdbTabProps {
	mediaFileId: string;
	mediaType: "movie" | "tv_show";
	initialTitle: string;
	initialYear?: number;
	onSuccess: () => void;
}

export function ReassignTmdbTab({ mediaFileId, mediaType, initialTitle, initialYear, onSuccess }: ReassignTmdbTabProps) {
	const [searchParams, setSearchParams] = useState<TmdbSearchParams>({
		title: initialTitle,
		year: initialYear,
		seasonNumber: 1,
		episodeNumber: 1,
	});

	const { reassignMediaFile, isReassigning } = useAdminReassignMediaFile();

	const tmdbQuery = useProviderSearch({
		mediaType,
		title: searchParams.title,
		year: searchParams.year,
	});

	const handleApplyTmdb = (providerId: string, externalId: string): void => {
		startTransition(async () => {
			try {
				await reassignMediaFile({
					mediaFileId,
					body: {
						providerId,
						externalId,
						seasonNumber: mediaType === "tv_show" ? (searchParams.seasonNumber ?? 1) : undefined,
						episodeNumber: mediaType === "tv_show" ? (searchParams.episodeNumber ?? 1) : undefined,
					},
				});
				onSuccess();
			} catch {
				// handled in hook
			}
		});
	};

	const tmdbCandidates = flattenProviderSearchResults(tmdbQuery.data);

	let tmdbContent: ReactNode;
	if (tmdbQuery.isFetching) {
		tmdbContent = (
			<div className="grid gap-3 sm:grid-cols-2">
				<CandidateSkeletonList variant="default" keyPrefix="tmdb-skel" />
			</div>
		);
	} else if (tmdbQuery.isError) {
		tmdbContent = (
			<AppEmptyState
				icon={Search}
				title={m.components_reassign_tmdb_error()}
				description={m.components_reassign_tmdb_provider_error()}
				className="min-h-40"
				action={
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							startTransition(async () => {
								await tmdbQuery.refetch();
							})
						}
					>
						{m.common_try_again()}
					</Button>
				}
			/>
		);
	} else if (tmdbCandidates.length === 0) {
		tmdbContent = (
			<AppEmptyState
				icon={Search}
				title={m.components_reassign_tmdb_no_results()}
				description={m.components_reassign_tmdb_hint()}
				className="min-h-40"
			/>
		);
	} else {
		tmdbContent = (
			<div className="grid gap-3 sm:grid-cols-2">
				{tmdbCandidates.map((candidate) => (
					<ReassignTmdbCandidateCard
						key={`${candidate.providerId}-${candidate.externalId}`}
						candidate={candidate}
						isReassigning={isReassigning}
						onApply={handleApplyTmdb}
					/>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4 pt-3">
			<ReassignTmdbSearchForm
				initialTitle={initialTitle}
				initialYear={initialYear}
				mediaType={mediaType}
				isSearching={tmdbQuery.isFetching}
				onSearch={setSearchParams}
			/>

			<div className="max-h-[50vh] overflow-y-auto pr-1">{tmdbContent}</div>
		</div>
	);
}
