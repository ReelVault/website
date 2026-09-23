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
}

export function SubtitleItemRow({ subtitle, onView, onEdit, onDelete }: SubtitleItemRowProps) {
	return (
		<div className="flex items-center gap-4 rounded-lg border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/40">
			<div className="flex min-w-0 flex-1 items-center gap-3">
				<div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40">
					<FileText className="size-4 text-muted-foreground" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<p className="font-medium text-foreground text-sm">{subtitle.label ?? subtitle.language}</p>
						<Badge variant="outline" size="sm" className="text-[10px]">
							{subtitle.format}
						</Badge>
						<Badge variant={subtitle.type === "embedded" ? "secondary" : "default"} size="sm" className="text-[10px]">
							{subtitle.type === "embedded" ? m.admin_subtitles_embedded() : m.admin_subtitles_external()}
						</Badge>
						{subtitle.isDefault && (
							<Badge variant="outline" size="sm" className="border-primary/40 text-[10px] text-primary">
								{m.admin_subtitles_default()}
							</Badge>
						)}
						{subtitle.isForced && (
							<Badge variant="outline" size="sm" className="border-warning/40 text-[10px] text-warning">
								{m.player_forced_word()}
							</Badge>
						)}
					</div>
					<p className="mt-1 font-mono text-muted-foreground text-xs">{subtitle.mediaFileId}</p>
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-1">
				<Button variant="ghost" size="icon" className="size-8" aria-label={m.admin_subtitles_preview()} onClick={() => onView(subtitle.id)}>
					<Eye className="size-4 text-muted-foreground" />
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="ghost" size="icon" className="size-8" aria-label={m.plugins_bugs_more_options()}>
								<MoreVertical className="size-4 text-muted-foreground" />
							</Button>
						}
					/>
					<DropdownMenuContent align="end" className="w-44">
						<DropdownMenuItem onClick={() => onEdit(subtitle.id)} className="gap-2.5">
							<Pencil className="size-3.5 text-muted-foreground" />
							<span>{m.common_edit()}</span>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => onDelete(subtitle.id)}
							className="gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
						>
							<Trash2 className="size-3.5" />
							<span>{m.common_delete()}</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
