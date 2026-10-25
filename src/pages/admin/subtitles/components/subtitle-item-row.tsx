import { Link } from "@tanstack/react-router";
import { Eye, FileText, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { useAdminSubtitles } from "@/client/hooks/use-admin-subtitles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { m } from "@/paraglide/messages";

type SubtitleItem = NonNullable<ReturnType<typeof useAdminSubtitles>["data"]>["data"][number];

interface SubtitleItemRowProps {
	subtitle: SubtitleItem;
	onView: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	selected: boolean;
	onToggleSelect: (id: string) => void;
}

export function SubtitleItemRow({ subtitle, onView, onEdit, onDelete, selected, onToggleSelect }: SubtitleItemRowProps) {
	return (
		<div className="border-border/60 bg-muted/20 hover:bg-muted/40 flex items-center gap-4 rounded-lg border p-3 transition-colors">
			<input
				type="checkbox"
				className="accent-primary size-4 shrink-0"
				checked={selected}
				onChange={() => onToggleSelect(subtitle.id)}
				aria-label={m.admin_subtitles_select_one()}
			/>
			<div className="flex min-w-0 flex-1 items-center gap-3">
				<div className="border-border/60 bg-muted/40 flex size-9 shrink-0 items-center justify-center rounded-lg border">
					<FileText className="text-muted-foreground size-4" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<p className="text-foreground text-sm font-medium">{subtitle.label ?? subtitle.language}</p>
						<Badge variant="outline" size="sm">
							{subtitle.format}
						</Badge>
						<Badge variant={subtitle.type === "embedded" ? "secondary" : "default"} size="sm">
							{subtitle.type === "embedded" ? m.admin_subtitles_embedded() : m.admin_subtitles_external()}
						</Badge>
						{subtitle.isDefault && (
							<Badge variant="primary-outline" size="sm">
								{m.admin_subtitles_default()}
							</Badge>
						)}
						{subtitle.isForced && (
							<Badge variant="warning-outline" size="sm">
								{m.player_forced_word()}
							</Badge>
						)}
					</div>
					<div className="flex items-center gap-1.5">
						{/* The API exposes only the media-file id here — link to it instead of
						    printing an unreadable hash; short form keeps the row scannable. */}
						<Link
							to="/admin/media/$id"
							params={{ id: subtitle.mediaFileId }}
							className="text-muted-foreground hover:text-primary font-mono text-xs hover:underline"
							title={m.admin_subtitles_open_media_file()}
						>
							{subtitle.mediaFileId.slice(0, 8)}
						</Link>
					</div>
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-1">
				<Button variant="ghost" size="icon" aria-label={m.admin_subtitles_preview()} onClick={() => onView(subtitle.id)}>
					<Eye className="text-muted-foreground size-4" />
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="ghost" size="icon" aria-label={m.plugins_bugs_more_options()}>
								<MoreVertical className="text-muted-foreground size-4" />
							</Button>
						}
					/>
					<DropdownMenuContent align="end" className="w-44">
						<DropdownMenuItem onClick={() => onEdit(subtitle.id)}>
							<Pencil className="text-muted-foreground size-3.5" />
							<span>{m.common_edit()}</span>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => onDelete(subtitle.id)} variant="destructive">
							<Trash2 className="size-3.5" />
							<span>{m.common_delete()}</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
