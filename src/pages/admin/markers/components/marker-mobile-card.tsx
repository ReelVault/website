import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Clock, Play, Trash2 } from "lucide-react";
import type { MediaMarker } from "@reelvault/sdk";
import { ConfirmAction } from "@/components/confirm-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { m } from "@/paraglide/messages";
import { formatDateTime, formatTimestamp } from "@/utils/format-utils";
import { TYPE_CONFIG } from "./marker-types";

interface MarkerMobileCardProps {
	marker: MediaMarker;
	onOpenEdit: (marker: MediaMarker) => void;
	onDelete: (marker: MediaMarker) => void;
}

export function MarkerMobileCard({ marker, onOpenEdit, onDelete }: MarkerMobileCardProps) {
	const config = TYPE_CONFIG[marker.type];
	const isPoint = marker.type === "highlight" || marker.startSeconds === marker.endSeconds;

	return (
		<Card key={marker.id} className="border-border/80 bg-card p-4">
			<div className="flex flex-col gap-3">
				<div className="flex items-start justify-between gap-2">
					<div className="flex flex-col gap-1">
						<Badge variant="outline" className={cn("font-semibold text-[10px]", config.badgeClass)}>
							{config.label}
						</Badge>
						{marker.label && (
							<p className="font-medium text-foreground text-sm">{m.components_media_quoted_label({ label: marker.label })}</p>
						)}
					</div>
					<Badge variant="secondary" className="font-mono text-[10px]">
						{marker.source}
					</Badge>
				</div>

				<div className="flex items-center gap-2 font-mono text-muted-foreground text-xs">
					<Clock className="size-3.5" />
					{isPoint ? (
						<span className="font-semibold text-destructive">{formatTimestamp(marker.startSeconds)}</span>
					) : (
						<span>
							{m.admin_markers_time_range_with_duration({
								start: formatTimestamp(marker.startSeconds),
								end: formatTimestamp(marker.endSeconds),
								duration: formatTimestamp(marker.endSeconds - marker.startSeconds),
							})}
						</span>
					)}
				</div>

				<div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground text-xs">
					<div className="flex items-center gap-1.5 font-mono">
						<span>{m.admin_markers_file_label()}</span>
						<Link to="/admin/media/$id" params={{ id: marker.mediaFileId }} className="text-primary hover:underline">
							{m.common_truncated_id({ id: marker.mediaFileId.slice(0, 10) })}
						</Link>
					</div>
					<span>{formatDateTime(marker.createdAt)}</span>
				</div>

				<div className="flex items-center justify-between border-border/80 border-t pt-3">
					<Button
						size="sm"
						variant="ghost"
						nativeButton={false}
						render={<Link to="/player/$id" params={{ id: marker.mediaFileId }} target="_blank" />}
						className="h-8 gap-1.5 text-xs hover:text-primary"
					>
						<Play className="size-3.5" />
						{m.common_player_word()}
					</Button>

					<div className="flex items-center gap-1.5">
						<Button size="sm" variant="outline" onClick={() => onOpenEdit(marker)} className="h-8 text-xs">
							{m.common_edit()}
						</Button>
						<ConfirmAction
							trigger={
								<Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
									<Trash2 className="size-3.5" />
								</Button>
							}
							title={m.admin_markers_delete_marker()}
							description={m.admin_markers_removal_notice_short()}
							confirmLabel={m.common_delete()}
							onConfirm={() => {
								onDelete(marker);
							}}
						/>
					</div>
				</div>
			</div>
		</Card>
	);
}
