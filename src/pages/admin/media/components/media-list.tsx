import type { MediaFileWithRelation } from "@reelvault/sdk";
import { FileVideo } from "lucide-react";
import { AppEmptyState } from "@/components/app-states";
import { LazyRender } from "@/components/lazy-render";
import { Button } from "@/components/ui/button";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";
import { MediaFileListCard } from "./media-file-list-card";

export function MediaList({
	mediaFiles,
	isLoading,
	deletingIds,
	onDelete,
	onResetSearch,
}: {
	mediaFiles: MediaFileWithRelation[];
	isLoading: boolean;
	deletingIds: Set<string>;
	onDelete: (id: string, fileName: string) => Promise<unknown>;
	onResetSearch?: () => void;
}) {
	if (isLoading) {
		return (
			<SkeletonGrid
				count={6}
				className="grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
				itemClassName="h-40 rounded-xl"
				aria-busy="true"
			/>
		);
	}

	if (mediaFiles.length === 0) {
		return (
			<AppEmptyState
				icon={FileVideo}
				title={m.admin_media_no_files()}
				description={m.admin_media_no_files_match()}
				action={
					onResetSearch ? (
						<Button variant="outline" size="sm" onClick={onResetSearch}>
							{m.components_search_clear()}
						</Button>
					) : undefined
				}
			/>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{mediaFiles.map((file) => (
				<LazyRender key={file.id} minHeight={160}>
					{() => <MediaFileListCard file={file} isDeleting={deletingIds.has(file.id)} onDelete={onDelete} />}
				</LazyRender>
			))}
		</div>
	);
}
