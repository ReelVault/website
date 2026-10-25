import type { AdminLiveStreamItem } from "@reelvault/sdk";
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
		<div className="bg-muted relative aspect-video w-full overflow-hidden">
			<ApiImage
				fileId={extractFileIdFromUrl(stream.posterUrl)}
				cacheKey={stream.posterUpdatedAt}
				alt={stream.title}
				fill
				sizes="(max-width: 1024px) 100vw, 50vw"
				zoom
				className="object-cover"
			/>
			<div className="from-background via-background/70 absolute inset-0 bg-linear-to-t to-black/60" />

			{/* Top Client Header */}
			<div className="absolute top-3 right-3 left-3 flex items-center justify-between text-white shadow-md">
				<div className="flex items-center gap-2">
					<DeviceIcon name={stream.clientName ?? stream.browser ?? ""} />
					<div className="min-w-0">
						<p className="truncate text-xs font-bold">{browserLabel(stream.browser)}</p>
						<p className="truncate text-xs text-white/90">{clientLabel(stream.clientName)}</p>
					</div>
				</div>

				<Badge variant={isDirect ? "success" : "warning"}>{isDirect ? m.common_direct_stream() : m.common_transcoding()}</Badge>
			</div>

			{/* Title Overlay Info */}
			<div className="absolute right-3 bottom-3 left-3 flex flex-col gap-1">
				<h4 className="text-foreground truncate text-base font-black" title={stream.title}>
					{stream.title}
				</h4>

				<div className="text-muted-foreground flex items-center gap-2 font-mono text-xs">
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
