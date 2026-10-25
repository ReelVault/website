import { Check, FileText, Globe, Info } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminSubtitle } from "@/client/hooks/use-admin-subtitles";
import { AppLoadingState } from "@/components/app-states";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { m } from "@/paraglide/messages";
import { formatFullDateTime } from "@/utils/format-utils";

export function SubtitleDetailDialog({
	subtitleId,
	isOpen,
	onOpenChange,
}: {
	subtitleId: string | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { data: subtitle, isLoading } = useAdminSubtitle(subtitleId ?? "", isOpen && subtitleId !== null);

	let dialogBody: ReactNode = null;
	if (isLoading) {
		dialogBody = <AppLoadingState />;
	} else if (subtitle) {
		dialogBody = (
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-3">
					<div className="border-border/60 bg-muted/40 flex size-10 items-center justify-center rounded-xl border">
						<FileText className="text-muted-foreground size-5" />
					</div>
					<div>
						<p className="text-foreground text-sm font-semibold">{subtitle.label ?? subtitle.language}</p>
						<p className="text-muted-foreground flex items-center gap-1.5 text-xs">
							<Globe className="size-3" />
							{subtitle.language}
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="border-border/60 bg-muted/20 rounded-lg border p-3">
						<p className="text-muted-foreground text-xs">{m.media_format()}</p>
						<p className="text-foreground mt-0.5 text-sm font-medium">{subtitle.format}</p>
					</div>
					<div className="border-border/60 bg-muted/20 rounded-lg border p-3">
						<p className="text-muted-foreground text-xs">{m.admin_subtitles_type()}</p>
						<p className="text-foreground mt-0.5 text-sm font-medium">
							{subtitle.type === "embedded" ? m.admin_subtitles_embedded() : m.admin_subtitles_external()}
						</p>
					</div>
					<div className="border-border/60 bg-muted/20 rounded-lg border p-3">
						<p className="text-muted-foreground text-xs">{m.admin_subtitles_default()}</p>
						<p className="text-foreground mt-0.5 flex items-center gap-1.5 text-sm font-medium">
							{subtitle.isDefault ? (
								<>
									<Check className="text-success size-3.5" />
									<span>{m.common_yes()}</span>
								</>
							) : (
								<span>{m.common_no()}</span>
							)}
						</p>
					</div>
					<div className="border-border/60 bg-muted/20 rounded-lg border p-3">
						<p className="text-muted-foreground text-xs">{m.admin_media_forced_badge()}</p>
						<p className="text-foreground mt-0.5 text-sm font-medium">{subtitle.isForced ? m.common_yes() : m.common_no()}</p>
					</div>
				</div>

				{subtitle.streamIndex !== null && (
					<div className="border-border/60 bg-muted/20 rounded-lg border p-3">
						<p className="text-muted-foreground text-xs">{m.admin_subtitles_stream_index()}</p>
						<p className="text-foreground mt-0.5 font-mono text-sm font-medium">{subtitle.streamIndex}</p>
					</div>
				)}

				<div className="border-border/60 bg-muted/20 rounded-lg border p-3">
					<p className="text-muted-foreground text-xs">{m.admin_subtitles_media_file_id()}</p>
					<p className="text-foreground mt-0.5 font-mono text-xs font-medium">{subtitle.mediaFileId}</p>
				</div>

				<div className="text-muted-foreground flex gap-4 text-xs">
					<span>{m.common_created_at_value({ date: formatFullDateTime(subtitle.createdAt) })}</span>
					<span>{m.admin_subtitles_modified_at({ date: formatFullDateTime(subtitle.updatedAt) })}</span>
				</div>
			</div>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent size="md">
				<DialogHeader>
					<DialogTitle>
						<Info className="text-muted-foreground size-5" />
						{m.admin_subtitles_details()}
					</DialogTitle>
					<DialogDescription>{m.admin_subtitles_info_dialog_desc()}</DialogDescription>
				</DialogHeader>
				{dialogBody}
			</DialogContent>
		</Dialog>
	);
}
