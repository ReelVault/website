import { cn } from "cn";
import type { AdminLiveStreamItem } from "reelvault-sdk";
import { ApiImage } from "@/components/ui/api-image";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";
import { extractFileIdFromUrl } from "@/utils/metadata-utils";
import { DeviceIcon } from "./device-icon";
import { browserLabel, clientLabel } from "./live-activity-utils";

interface LiveStreamCardMediaProps {
	stream: AdminLiveStreamItem;
}

export function LiveStreamCardMedia({ stream }: LiveStreamCardMediaProps) {
	const isDirect = stream.mode === "direct-stream";

	return (
		<div className="relative aspect-video w-full overflow-hidden bg-muted">
			<ApiImage
				fileId={extractFileIdFromUrl(stream.posterUrl)}
				cacheKey={stream.posterUpdatedAt}
				alt={stream.title}
				fill
				sizes="(max-width: 1024px) 100vw, 50vw"
				className="object-cover transition-transform duration-300 group-hover:scale-105"
			/>
			<div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-black/60" />

			{/* Top Client Header */}
			<div className="absolute top-3 right-3 left-3 flex items-center justify-between text-white shadow-md">
				<div className="flex items-center gap-2">
					<DeviceIcon name={stream.clientName ?? stream.browser ?? ""} />
					<div className="min-w-0">
						<p className="truncate font-bold text-xs">{browserLabel(stream.browser)}</p>
						<p className="truncate text-[10px] text-white/90">{clientLabel(stream.clientName)}</p>
					</div>
				</div>

				<Badge
					className={cn("font-bold text-[10px] uppercase tracking-wider", {
						"border-success/40 bg-success/30 text-success": isDirect,
						"border-warning/40 bg-warning/30 text-warning": !isDirect,
					})}
				>
					{isDirect ? m.common_direct_stream() : m.common_transcoding()}
				</Badge>
			</div>

			{/* Title Overlay Info */}
			<div className="absolute right-3 bottom-3 left-3 flex flex-col gap-1">
				<h4 className="truncate font-black text-base text-foreground" title={stream.title}>
					{stream.title}
				</h4>

				<div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
					{stream.releaseYear && <span>{stream.releaseYear}</span>}
					{stream.type === "tv_show" && stream.seasonNumber !== null && (
						<span>
							{m.admin_live_episode_label({
								season: stream.seasonNumber,
								episode: stream.episodeNumber ?? "?",
								title: stream.episodeTitle ? `(${stream.episodeTitle})` : "",
							})}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
