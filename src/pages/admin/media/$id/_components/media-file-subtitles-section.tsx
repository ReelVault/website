import type { MediaFileWithRelation } from "@reelvault/sdk";
import { FileText, Subtitles, Upload } from "lucide-react";
import { useState } from "react";
import { CopyIcon } from "@/components/copy-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { AdminSection } from "@/pages/admin/admin-ui";
import { isBitmapSubtitle } from "@/pages/player/utils/player.types";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { MediaFileSubtitleUploadForm } from "./media-file-subtitle-upload-form";

const EMPTY_SUBTITLES: MediaFileWithRelation["subtitles"] = [];

export function MediaFileSubtitlesSection({
	mediaFileId,
	subtitles,
}: {
	mediaFileId: string;
	subtitles?: MediaFileWithRelation["subtitles"];
}) {
	const subtitleList = subtitles ?? EMPTY_SUBTITLES;
	const [uploadOpen, setUploadOpen] = useState(false);

	return (
		<AdminSection
			title={m.admin_media_subtitles_section({ count: subtitleList.length })}
			description={m.admin_media_subtitle_tracks_description()}
			actions={
				<Button variant="outline" size="sm" onClick={() => setUploadOpen((open) => !open)}>
					<Upload className="size-3.5" />
					{m.admin_media_upload_subtitle()}
				</Button>
			}
		>
			{subtitleList.length > 0 ? (
				<div className="flex flex-col gap-2.5">
					{subtitleList.map((sub) => (
						<SubtitleRow key={sub.id || `${sub.type}-${sub.streamIndex ?? 0}-${sub.language}`} subtitle={sub} />
					))}
				</div>
			) : (
				<div className="border-border/80 bg-muted/20 text-muted-foreground flex items-center gap-3 rounded-xl border border-dashed p-4 text-xs">
					<Subtitles className="text-muted-foreground/60 size-4 shrink-0" />
					<span>{m.admin_media_no_subtitle_tracks()}</span>
				</div>
			)}
			{uploadOpen && <MediaFileSubtitleUploadForm mediaFileId={mediaFileId} onUploaded={() => setUploadOpen(false)} />}
		</AdminSection>
	);
}

function SubtitleRow({ subtitle }: { subtitle: NonNullable<MediaFileWithRelation["subtitles"]>[number] }) {
	const { hasCopied, copy } = useCopyToClipboard();
	const isEmbedded = subtitle.type === "embedded";

	return (
		<div className="border-border/80 bg-muted/20 flex flex-col gap-2 rounded-xl border p-3 text-xs">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<Badge weight="bold" variant="outline" size="sm" font="mono">
						{subtitle.language || "UND"}
					</Badge>

					<span className="text-foreground font-semibold">
						{subtitle.label ?? (isEmbedded ? m.admin_media_subtitle_label_embedded() : m.admin_media_subtitle_label_external())}
					</span>

					{subtitle.format && (
						<span className="border-border/60 bg-background/60 text-muted-foreground rounded-md border px-1.5 py-0.5 font-mono text-xs">
							{subtitle.format}
						</span>
					)}
				</div>

				<div className="flex flex-wrap items-center gap-1.5">
					{isEmbedded ? (
						<Badge variant="secondary" size="sm" font="mono">
							{m.admin_media_subtitle_embedded_index({ index: subtitle.streamIndex ?? 0 })}
						</Badge>
					) : (
						<Badge variant="default" size="sm">
							{m.admin_media_external_file()}
						</Badge>
					)}

					{isBitmapSubtitle(subtitle.format) && (
						<Badge variant="warning-outline" size="sm">
							{m.admin_media_subtitle_image_based()}
						</Badge>
					)}

					{subtitle.isDefault && (
						<Badge variant="primary" size="sm">
							{m.admin_subtitles_default()}
						</Badge>
					)}

					{subtitle.isForced && (
						<Badge variant="warning-outline" size="sm">
							{m.player_forced_word()}
						</Badge>
					)}
				</div>
			</div>

			{subtitle.filePath && (
				<div className="border-border/50 bg-background/50 mt-0.5 flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5">
					<div className="text-muted-foreground flex min-w-0 items-center gap-1.5 font-mono text-xs">
						<FileText className="text-primary size-3 shrink-0" />
						<span className="truncate" title={subtitle.filePath}>
							{subtitle.filePath}
						</span>
					</div>

					<Button
						tone="muted"
						type="button"
						variant="ghost"
						size="icon"
						className="shrink-0"
						onClick={() => detach(copy(subtitle.filePath ?? "", m.admin_media_subtitle_path_word()))}
						title={m.admin_media_copy_file_path()}
						aria-label={m.admin_media_copy_file_path()}
					>
						<CopyIcon copied={hasCopied} className="size-3" />
					</Button>
				</div>
			)}
		</div>
	);
}
