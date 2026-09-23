import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Clock, Copy, Edit3, Play, Trash2 } from "lucide-react";
import type { MediaMarker } from "@reelvault/sdk";
import { ConfirmAction } from "@/components/confirm-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { m } from "@/paraglide/messages";
import { formatDateTime, formatTimestamp } from "@/utils/format-utils";
import { TYPE_CONFIG } from "./marker-types";

interface MarkerTableRowProps {
	marker: MediaMarker;
	onOpenEdit: (marker: MediaMarker) => void;
	onDelete: (marker: MediaMarker) => void;
	onCopy: (text: string, label: string) => void;
}

export function MarkerTableRow({ marker, onOpenEdit, onDelete, onCopy }: MarkerTableRowProps) {
	const config = TYPE_CONFIG[marker.type];
	const isPoint = marker.type === "highlight" || marker.startSeconds === marker.endSeconds;

	return (
		<ContextMenu key={marker.id}>
			<ContextMenuTrigger render={<TableRow />}>
				<TableCell>
					<div className="flex items-center gap-2">
						<Badge variant="outline" className={cn("font-semibold text-[10px]", config.badgeClass)}>
							{config.label}
						</Badge>
						{marker.label && (
							<span className="font-medium text-foreground text-sm">{m.components_media_quoted_label({ label: marker.label })}</span>
						)}
					</div>
				</TableCell>
				<TableCell>
					<div className="flex items-center gap-1.5 font-mono text-sm">
						<Clock className="size-3.5 text-muted-foreground" />
						{isPoint ? (
							<span className="font-semibold text-destructive">{formatTimestamp(marker.startSeconds)}</span>
						) : (
							<>
								<span>{formatTimestamp(marker.startSeconds)}</span>
								<span className="text-muted-foreground">{m.admin_markers_range_arrow()}</span>
								<span>{formatTimestamp(marker.endSeconds)}</span>
								<span className="text-muted-foreground text-xs">
									{m.admin_markers_segment_duration({
										duration: formatTimestamp(marker.endSeconds - marker.startSeconds),
									})}
								</span>
							</>
						)}
					</div>
				</TableCell>
				<TableCell>
					<div className="flex items-center gap-2">
						<Link
							to="/admin/media/$id"
							params={{ id: marker.mediaFileId }}
							className="font-mono text-primary text-xs hover:underline"
							title={m.admin_markers_open_in_media_panel()}
						>
							{m.admin_markers_truncated_file_id({ id: marker.mediaFileId.slice(0, 12) })}
						</Link>
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={() => onCopy(marker.mediaFileId, m.admin_media_video_id())}
							title={m.admin_markers_copy_file_id()}
						>
							<Copy className="size-3 text-muted-foreground" />
						</Button>
					</div>
				</TableCell>
				<TableCell>
					<div className="flex flex-col gap-0.5">
						<Badge variant="secondary" className="w-fit font-mono text-[10px]">
							{marker.source}
						</Badge>
						{marker.pluginId && (
							<Link
								to="/admin/plugins/$id"
								params={{ id: marker.pluginId }}
								className="truncate font-mono text-[10px] text-muted-foreground hover:text-primary hover:underline"
								title={m.admin_markers_view_plugin_config()}
							>
								{marker.pluginId}
							</Link>
						)}
					</div>
				</TableCell>
				<TableCell>
					<span className="whitespace-nowrap text-muted-foreground text-xs">{formatDateTime(marker.createdAt)}</span>
				</TableCell>
				<TableCell className="text-right">
					<div className="flex items-center justify-end gap-1.5">
						<Button
							size="sm"
							variant="ghost"
							nativeButton={false}
							render={<Link to="/player/$id" params={{ id: marker.mediaFileId }} target="_blank" />}
							title={m.admin_markers_open_player()}
							className="h-8 gap-1.5 text-xs hover:text-primary"
						>
							<Play className="size-3.5" />
							{m.common_player_word()}
						</Button>

						<Button size="sm" variant="ghost" onClick={() => onOpenEdit(marker)} className="h-8 w-8 p-0" title={m.admin_markers_edit()}>
							<Edit3 className="size-3.5 text-muted-foreground hover:text-foreground" />
						</Button>

						<ConfirmAction
							trigger={
								<Button
									size="sm"
									variant="ghost"
									className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
									title={m.admin_markers_delete_marker()}
								>
									<Trash2 className="size-3.5" />
								</Button>
							}
							title={m.admin_markers_delete_marker()}
							description={m.admin_markers_removal_notice()}
							confirmLabel={m.common_delete()}
							onConfirm={() => {
								onDelete(marker);
							}}
						/>
					</div>
				</TableCell>
			</ContextMenuTrigger>

			<ContextMenuContent className="w-56 border-border bg-popover shadow-xl">
				<ContextMenuGroup>
					<ContextMenuLabel className="truncate font-bold text-foreground text-xs uppercase tracking-wider">
						{config.label}
					</ContextMenuLabel>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuGroup>
					<ContextMenuItem onClick={() => onOpenEdit(marker)} className="cursor-pointer gap-2.5">
						<Edit3 className="size-4 text-primary" />
						<span>{m.admin_markers_edit()}</span>
					</ContextMenuItem>
					<ContextMenuItem onClick={() => onCopy(marker.mediaFileId, m.admin_media_video_id())} className="cursor-pointer gap-2.5">
						<Copy className="size-4 text-muted-foreground" />
						<span>{m.admin_markers_copy_file_id()}</span>
					</ContextMenuItem>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuGroup>
					<ContextMenuItem
						onClick={() => onDelete(marker)}
						className="cursor-pointer gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
					>
						<Trash2 className="size-4" />
						<span>{m.admin_markers_delete_marker()}</span>
					</ContextMenuItem>
				</ContextMenuGroup>
			</ContextMenuContent>
		</ContextMenu>
	);
}
