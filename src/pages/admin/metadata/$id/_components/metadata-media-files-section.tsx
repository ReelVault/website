import type { MediaFileWithRelation } from "@reelvault/sdk";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { ExternalLink, FileVideo, Pencil, Play, Star } from "lucide-react";
import type { ReactNode } from "react";
import { reelvault } from "@/client/client";
import { useAdminUpdateMediaFile } from "@/client/hooks/use-admin-media";
import { mediaKeys } from "@/client/utils/query-keys";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonList } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatDuration } from "@/utils/duration-utils";
import { formatFileSize } from "@/utils/file-utils";

const PAGE_LIMIT = 100;

export function MetadataMediaFilesSection({ metadataId }: { metadataId: string }) {
	const filesQuery = useQuery({
		queryKey: mediaKeys.adminByMetadata(metadataId),
		enabled: Boolean(metadataId),
		queryFn: () =>
			reelvault.media.getAll({
				metadataId,
				limit: PAGE_LIMIT,
				sortBy: "fileName",
				sortOrder: "asc",
			}),
		staleTime: 120_000,
	});

	const files = filesQuery.data?.data ?? [];
	const total = filesQuery.data?.total ?? files.length;
	const hasMore = total > PAGE_LIMIT;

	let sectionBody: ReactNode;
	if (filesQuery.isLoading) {
		sectionBody = <SkeletonList count={3} itemClassName="h-16 rounded-lg" aria-busy="true" />;
	} else if (filesQuery.isError) {
		sectionBody = (
			<AppErrorState
				title={m.admin_metadata_failed_to_fetch_files()}
				error={filesQuery.error}
				onRetry={() => detach(filesQuery.refetch())}
			/>
		);
	} else if (files.length > 0) {
		sectionBody = (
			<AppEmptyState
				icon={FileVideo}
				title={m.admin_metadata_no_linked_files()}
				description={m.admin_metadata_no_assigned_files_notice()}
				action={
					<Button variant="outline" size="sm" nativeButton={false} render={<Link to="/admin/media" />}>
						<ExternalLink className="size-3.5" />
						<span>{m.admin_metadata_go_to_media_files()}</span>
					</Button>
				}
			/>
		);
	} else {
		sectionBody = (
			<div className="flex flex-col gap-3">
				<div className="divide-border/60 border-border/60 flex flex-col divide-y overflow-hidden rounded-xl border">
					{files.map((file) => (
						<MediaFileRow key={file.id} file={file} />
					))}
				</div>

				{hasMore && (
					<p className="text-muted-foreground text-center text-xs">{m.admin_metadata_showing_files({ shown: PAGE_LIMIT, total })}</p>
				)}
			</div>
		);
	}

	return (
		<AdminSection
			title={m.admin_metadata_linked_files_section({ total })}
			description={m.admin_metadata_linked_files_desc()}
			actions={
				<Button variant="outline" size="sm" nativeButton={false} render={<Link to="/admin/media" />}>
					<ExternalLink className="size-3.5" />
					<span>{m.admin_metadata_manage_files()}</span>
				</Button>
			}
		>
			{sectionBody}
		</AdminSection>
	);
}

function MediaFileRow({ file }: { file: MediaFileWithRelation }) {
	const { updateMediaFile, isUpdating } = useAdminUpdateMediaFile();
	const meta = [
		file.formatName,
		file.qualityTag,
		formatDuration(file.duration),
		file.size !== null && file.size > 0 ? formatFileSize(file.size) : null,
	].filter(Boolean);

	const handleSetDefault = () => {
		if (file.isDefault || isUpdating) return;

		detach(
			updateMediaFile({
				mediaFileId: file.id,
				body: { isDefault: true },
			}),
		);
	};

	return (
		<div className="group bg-background hover:bg-muted/40 flex items-center gap-3 px-4 py-3 transition-colors">
			<div className="bg-muted/50 text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
				<FileVideo className="text-primary size-4" />
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<p className="text-foreground truncate text-sm font-medium">{file.fileName}</p>
					{file.isDefault && (
						<Badge variant="secondary" size="sm" className="shrink-0">
							{m.common_default_badge()}
						</Badge>
					)}
					{file.source && <span className="text-muted-foreground shrink-0 text-xs">{file.source}</span>}
				</div>
				<p className="text-muted-foreground truncate text-xs">{meta.length > 0 ? meta.join(" · ") : file.filePath}</p>
			</div>

			<div className="flex shrink-0 items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
				<Button
					variant="ghost"
					size="icon"
					disabled={file.isDefault || isUpdating}
					onClick={handleSetDefault}
					title={file.isDefault ? m.admin_metadata_default_video_file() : m.admin_metadata_set_default_file()}
					aria-label={
						file.isDefault ? m.admin_metadata_default_video_file() : m.admin_metadata_set_named_default_file({ fileName: file.fileName })
					}
				>
					<Star className={cn("size-3.5", file.isDefault ? "fill-warning text-warning" : "text-muted-foreground")} />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					nativeButton={false}
					render={<Link to="/player/$id" params={{ id: file.id }} target="_blank" rel="noopener noreferrer" />}
					title={m.admin_metadata_open_in_player()}
					aria-label={m.admin_metadata_play_file({ fileName: file.fileName })}
				>
					<Play className="size-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					nativeButton={false}
					render={<Link to="/admin/media/$id" params={{ id: file.id }} />}
					title={m.admin_media_edit_file()}
					aria-label={m.admin_media_edit_file_named({ fileName: file.fileName })}
				>
					<Pencil className="size-3.5" />
				</Button>
			</div>
		</div>
	);
}
