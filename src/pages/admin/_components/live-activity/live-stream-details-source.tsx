import { Film } from "lucide-react";
import type { AdminLiveStreamItem } from "@reelvault/sdk";
import { m } from "@/paraglide/messages";

interface LiveStreamDetailsSourceProps {
	stream: AdminLiveStreamItem;
	formattedDuration: string;
}

export function LiveStreamDetailsSource({ stream, formattedDuration }: LiveStreamDetailsSourceProps) {
	let audioLayoutSuffix = "";
	if (stream.audioChannelLayout) {
		audioLayoutSuffix = ` · ${stream.audioChannelLayout}`;
	} else if (stream.audioChannels) {
		audioLayoutSuffix = ` · ${stream.audioChannels} ch`;
	}

	return (
		<div className="flex flex-col gap-1.5 rounded-lg border border-border/50 bg-background/60 p-3">
			<div className="flex items-center gap-1.5 font-sans font-semibold text-foreground text-xs">
				<Film className="size-3.5 text-primary" />
				<span>{m.admin_source_file_library_data()}</span>
			</div>
			<div className="grid gap-1 text-[11px]">
				<div className="flex justify-between gap-2">
					<span>{m.admin_source_video()}</span>
					<span className="font-medium text-foreground">
						{stream.videoCodec?.toUpperCase() ?? m.common_not_available()}
						{m.admin_live_video_profile_resolution({
							profile: stream.videoProfile ? ` (${stream.videoProfile})` : "",
							resolution: stream.width && stream.height ? `${stream.width}×${stream.height}` : m.common_not_available(),
						})}{" "}
						{stream.frameRate ? m.admin_live_frame_rate({ rate: stream.frameRate }) : ""}{" "}
						{stream.pixelFormat ? m.admin_live_pixel_format({ format: stream.pixelFormat }) : ""}
					</span>
				</div>
				<div className="flex justify-between gap-2">
					<span>{m.admin_source_audio()}</span>
					<span className="truncate font-medium text-foreground">
						{stream.audioStreamIndex !== null ? m.admin_live_audio_stream_index({ index: stream.audioStreamIndex }) : ""}
						{stream.audioCodec?.toUpperCase() ?? m.common_not_available()}
						{audioLayoutSuffix} {stream.audioLanguage ? m.admin_live_audio_language({ language: stream.audioLanguage.toUpperCase() }) : ""}
						{stream.audioTitle ? m.admin_live_audio_title({ title: stream.audioTitle }) : ""}
					</span>
				</div>
				<div className="flex justify-between gap-2">
					<span>{m.admin_live_bitrate_duration()}</span>
					<span className="font-medium text-foreground">
						{m.admin_live_bitrate_and_duration({
							bitrate: stream.bitrateKbps ? `${stream.bitrateKbps.toLocaleString()} kbps` : m.player_no_data(),
							duration: formattedDuration,
						})}
					</span>
				</div>
			</div>
		</div>
	);
}
