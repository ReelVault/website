import type { MediaMarker } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { Clock, Play, Trash2 } from "lucide-react";
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
		<Card key={marker.id}>
			<div className="flex flex-col gap-3">
				<div className="flex items-start justify-between gap-2">
					<div className="flex flex-col gap-1">
						<Badge variant={config.badgeVariant}>{config.label}</Badge>
						{marker.label && (
							<p className="font-medium text-foreground text-sm">{m.components_media_quoted_label({ label: marker.label })}</p>
						)}
					</div>
					<Badge variant="secondary" font="mono">
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
						render={<Link to="/player/$id" params={{ id: marker.mediaFileId }} target="_blank" rel="noopener noreferrer" />}
					>
						<Play className="size-3.5" />
						{m.common_player_word()}
					</Button>

					<div className="flex items-center gap-1.5">
						<Button size="sm" variant="outline" onClick={() => onOpenEdit(marker)}>
							{m.common_edit()}
						</Button>
						<ConfirmAction
							trigger={
								<Button tone="muted" size="sm" variant="ghost" className="w-10 sm:w-8">
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
