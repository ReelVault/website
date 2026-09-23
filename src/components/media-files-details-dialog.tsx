import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import type { ChangeEvent } from "react";
import { startTransition, useState } from "react";
import type { MediaFileWithRelation } from "@reelvault/sdk";
import { reelvault } from "@/client/client";
import { useRefreshMetadata, useRefreshMetadataImages } from "@/client/hooks/use-admin-metadata";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { useRefreshEpisode, useRefreshEpisodeImage } from "@/client/hooks/use-episodes";
import { mediaKeys } from "@/client/utils/query-keys";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { LazyRender } from "@/components/lazy-render";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { m } from "@/paraglide/messages";
import { MediaFileCard } from "./media-files/media-file-card";
import { MediaFilesDialogHeader } from "./media-files/media-files-dialog-header";

interface MediaFilesDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	metadataId?: string;
	episodeId?: string;
	title?: string;
}

export function MediaFilesDetailsDialog({ open, onOpenChange, metadataId, episodeId, title }: MediaFilesDetailsDialogProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const query = useQuery<MediaFileWithRelation[]>({
		queryKey: mediaKeys.detailsModal({ metadataId, episodeId }),
		queryFn: async () => {
			const filter: Record<string, unknown> = { limit: 100 };
			if (metadataId) filter.metadataId = metadataId;

			if (episodeId) filter.episodeId = episodeId;

			const res = await reelvault.media.getAll(filter);

			return res.data;
		},
		enabled: open && (Boolean(metadataId) || Boolean(episodeId)),
		staleTime: 300_000,
	});

	const files = query.data ?? [];
	const { user } = useCurrentUser();

	const refreshMetadataMutation = useRefreshMetadata();
	const refreshImagesMutation = useRefreshMetadataImages();
	const refreshEpisodeMutation = useRefreshEpisode(metadataId);
	const refreshEpisodeImageMutation = useRefreshEpisodeImage(metadataId);

	const handleRefreshEpisode = () => {
		if (episodeId) refreshEpisodeMutation.mutate(episodeId);
	};

	const handleRefreshEpisodeImage = () => {
		if (episodeId) refreshEpisodeImageMutation.mutate(episodeId);
	};

	const handleRefreshMetadata = () => {
		if (metadataId) refreshMetadataMutation.mutate(metadataId);
	};

	const handleRefreshImages = () => {
		if (metadataId) refreshImagesMutation.mutate(metadataId);
	};

	const handleRetry = (): void => {
		startTransition(async () => {
			await query.refetch();
		});
	};

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(event.target.value);
	};

	const filteredFiles = (() => {
		if (!searchQuery.trim()) return files;

		const queryLower = searchQuery.toLowerCase();

		return files.filter(
			(file) =>
				file.fileName.toLowerCase().includes(queryLower) ||
				file.filePath.toLowerCase().includes(queryLower) ||
				Boolean(file.edition?.toLowerCase().includes(queryLower)) ||
				Boolean(file.qualityTag?.toLowerCase().includes(queryLower)) ||
				Boolean(file.source?.toLowerCase().includes(queryLower)),
		);
	})();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90vh] w-full max-w-[calc(100%-2rem)] flex-col overflow-hidden border-border bg-popover p-0 shadow-2xl sm:max-w-4xl sm:rounded-2xl">
				{/* HEADER */}
				<MediaFilesDialogHeader
					filesCount={files.length}
					title={title}
					isAdmin={user?.role === "admin"}
					episodeId={episodeId}
					metadataId={metadataId}
					isRefreshingEpisode={refreshEpisodeMutation.isPending}
					isRefreshingEpisodeImage={refreshEpisodeImageMutation.isPending}
					isRefreshingMetadata={refreshMetadataMutation.isPending}
					isRefreshingImages={refreshImagesMutation.isPending}
					onRefreshEpisode={handleRefreshEpisode}
					onRefreshEpisodeImage={handleRefreshEpisodeImage}
					onRefreshMetadata={handleRefreshMetadata}
					onRefreshImages={handleRefreshImages}
				/>

				{/* SEARCH BAR (when there are many files, e.g. in a series) */}
				{files.length > 2 && (
					<div className="shrink-0 border-border/60 border-b bg-background/50 px-6 py-3">
						<div className="relative">
							<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								type="text"
								placeholder={m.components_media_files_search_placeholder()}
								value={searchQuery}
								onChange={handleSearchChange}
								className="h-9 bg-background pl-9 text-xs"
							/>
						</div>
					</div>
				)}

				{/* SCROLLABLE CONTENT */}
				<div className="min-h-0 flex-1 overflow-hidden p-6 pt-4">
					{query.isPending && (
						<AppLoadingState
							label={m.components_media_files_loading()}
							className="min-h-48 rounded-xl border border-border border-dashed"
						/>
					)}

					{query.isError && (
						<AppErrorState
							title={m.components_media_files_fetch_failed()}
							description={m.components_media_files_server_error()}
							error={query.error}
							onRetry={handleRetry}
						/>
					)}

					{!(query.isPending || query.isError) && files.length === 0 && <AppEmptyState title={m.components_media_files_none_assigned()} />}

					{!(query.isPending || query.isError) && filteredFiles.length === 0 && files.length > 0 && (
						<AppEmptyState title={m.components_media_files_no_matches()} />
					)}

					{!(query.isPending || query.isError) && filteredFiles.length > 0 && (
						<ScrollArea className="h-[60vh] w-full pr-3">
							<div className="flex flex-col gap-4 pb-4">
								{filteredFiles.map((file) => (
									<LazyRender key={file.id} minHeight={80}>
										{() => <MediaFileCard file={file} metadataId={metadataId} />}
									</LazyRender>
								))}
							</div>
						</ScrollArea>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
