import type { MediaMarker } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { Clock, Copy, Edit3, Play, Trash2 } from "lucide-react";
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
						<Badge variant={config.badgeVariant}>{config.label}</Badge>
						{marker.label && (
							<span className="text-foreground text-sm font-medium">{m.components_media_quoted_label({ label: marker.label })}</span>
						)}
					</div>
				</TableCell>
				<TableCell>
					<div className="flex items-center gap-1.5 font-mono text-sm">
						<Clock className="text-muted-foreground size-3.5" />
						{isPoint ? (
							<span className="text-destructive font-semibold">{formatTimestamp(marker.startSeconds)}</span>
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
							className="text-primary font-mono text-xs hover:underline"
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
							<Copy className="text-muted-foreground size-3" />
						</Button>
					</div>
				</TableCell>
				<TableCell>
					<div className="flex flex-col gap-0.5">
						<Badge variant="secondary" font="mono" className="w-fit">
							{marker.source}
						</Badge>
						{marker.pluginId && (
							<Link
								to="/admin/plugins/$id"
								params={{ id: marker.pluginId }}
								className="text-muted-foreground hover:text-primary truncate font-mono text-xs hover:underline"
								title={m.admin_markers_view_plugin_config()}
							>
								{marker.pluginId}
							</Link>
						)}
					</div>
				</TableCell>
				<TableCell>
					<span className="text-muted-foreground text-xs whitespace-nowrap">{formatDateTime(marker.createdAt)}</span>
				</TableCell>
				<TableCell className="text-right">
					<div className="flex items-center justify-end gap-1.5">
						<Button
							size="sm"
							variant="ghost"
							nativeButton={false}
							render={<Link to="/player/$id" params={{ id: marker.mediaFileId }} target="_blank" rel="noopener noreferrer" />}
							title={m.admin_markers_open_player()}
						>
							<Play className="size-3.5" />
							{m.common_player_word()}
						</Button>

						<Button size="sm" variant="ghost" onClick={() => onOpenEdit(marker)} className="w-10 sm:w-8" title={m.admin_markers_edit()}>
							<Edit3 className="text-muted-foreground hover:text-foreground size-3.5" />
						</Button>

						<ConfirmAction
							trigger={
								<Button tone="muted" size="sm" variant="ghost" className="w-10 sm:w-8" title={m.admin_markers_delete_marker()}>
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

			<ContextMenuContent className="w-56">
				<ContextMenuGroup>
					<ContextMenuLabel className="truncate">{config.label}</ContextMenuLabel>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuGroup>
					<ContextMenuItem onClick={() => onOpenEdit(marker)} className="cursor-pointer">
						<Edit3 className="text-primary size-4" />
						<span>{m.admin_markers_edit()}</span>
					</ContextMenuItem>
					<ContextMenuItem onClick={() => onCopy(marker.mediaFileId, m.admin_media_video_id())} className="cursor-pointer">
						<Copy className="text-muted-foreground size-4" />
						<span>{m.admin_markers_copy_file_id()}</span>
					</ContextMenuItem>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuGroup>
					<ContextMenuItem onClick={() => onDelete(marker)} variant="destructive" className="cursor-pointer">
						<Trash2 className="size-4" />
						<span>{m.admin_markers_delete_marker()}</span>
					</ContextMenuItem>
				</ContextMenuGroup>
			</ContextMenuContent>
		</ContextMenu>
	);
}
