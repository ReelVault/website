import { Link } from "@tanstack/react-router";
import { Check, Copy, Layers, LucideLink } from "lucide-react";
import type { MediaFileWithRelation } from "@reelvault/sdk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";

interface MediaFileRelationsSectionProps {
	file: MediaFileWithRelation;
	onOpenReassign: () => void;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between gap-2 border-border/40 border-b pb-2 last:border-b-0 last:pb-0">
			<span className="text-muted-foreground text-xs">{label}</span>
			{children}
		</div>
	);
}

export function MediaFileRelationsSection({ file, onOpenReassign }: MediaFileRelationsSectionProps) {
	const isMovie = file.library.type === "movies";
	const { hasCopied, copy } = useCopyToClipboard();

	return (
		<AdminSection title={m.admin_media_system_links()} description={m.admin_media_library_relations()}>
			<div className="flex flex-col gap-3 text-sm">
				<InfoRow label={m.admin_media_library()}>
					<div className="flex items-center gap-2">
						<Badge variant="secondary">{file.library.name}</Badge>
						<Badge variant={isMovie ? "default" : "secondary"} size="sm" className="text-[10px]">
							{isMovie ? m.admin_libraries_type_movies() : m.admin_libraries_type_series()}
						</Badge>
					</div>
				</InfoRow>

				<InfoRow label={m.admin_media_video_id()}>
					<div className="flex items-center gap-1.5 font-mono text-foreground text-xs">
						<span>{m.common_truncated_id({ id: file.id.slice(0, 16) })}</span>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="size-8 text-muted-foreground hover:text-foreground"
							onClick={() => detach(copy(file.id, m.admin_media_video_id()))}
							title={m.admin_markers_copy_file_id()}
							aria-label={m.admin_markers_copy_file_id()}
						>
							{hasCopied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
						</Button>
					</div>
				</InfoRow>

				<InfoRow label={m.components_copy_metadata_id()}>
					<div className="flex items-center gap-2">
						<Link
							to="/admin/metadata/$id"
							params={{ id: file.metadataId }}
							className="flex flex-row items-center gap-1 font-mono text-muted-foreground text-xs hover:text-foreground"
						>
							<LucideLink className="size-3.5" />
							{m.common_truncated_id({ id: file.metadataId.slice(0, 16) })}
						</Link>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 px-1.5 text-primary text-xs"
							onClick={onOpenReassign}
							title={m.admin_media_change_file_metadata_assignment()}
						>
							<Layers className="size-3.5" />
							<span className="text-[11px]">{m.admin_media_change()}</span>
						</Button>
					</div>
				</InfoRow>

				{file.movieId && (
					<InfoRow label={m.admin_media_movie_id()}>
						<span className="font-mono text-muted-foreground text-xs">{m.common_truncated_id({ id: file.movieId.slice(0, 16) })}</span>
					</InfoRow>
				)}

				{file.episodeId && (
					<InfoRow label={m.admin_media_episode_id_label()}>
						<span className="font-mono text-muted-foreground text-xs">{m.common_truncated_id({ id: file.episodeId.slice(0, 16) })}</span>
					</InfoRow>
				)}
			</div>
		</AdminSection>
	);
}
