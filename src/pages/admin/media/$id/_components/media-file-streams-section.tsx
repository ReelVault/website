import type { MediaFileWithRelation } from "@reelvault/sdk";
import { AudioLines, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatNumber } from "@/utils/format-utils";

interface MediaFileStreamsSectionProps {
	videoStreams?: MediaFileWithRelation["videoStreams"];
	audioStreams?: MediaFileWithRelation["audioStreams"];
}

export function MediaFileStreamsSection({ videoStreams, audioStreams }: MediaFileStreamsSectionProps) {
	return (
		<>
			{/* Video Streams */}
			<AdminSection title={m.admin_media_video_streams_section()} description={m.admin_media_image_tracks_detected()}>
				{videoStreams && videoStreams.length > 0 ? (
					<div className="flex flex-col gap-2.5">
						{videoStreams.map((stream) => (
							<div key={stream.index} className="border-border/80 bg-muted/20 flex flex-col gap-2 rounded-xl border p-3.5 text-xs">
								<div className="flex items-center justify-between">
									<div className="flex flex-wrap items-center gap-2">
										<Video className="text-primary size-3.5" />
										<span className="text-foreground font-semibold">{stream.codecName.toUpperCase()}</span>
										{stream.profile && (
											<span className="text-muted-foreground">{m.admin_media_codec_profile({ profile: stream.profile })}</span>
										)}
										{stream.isDefault && (
											<Badge variant="secondary" size="sm">
												{m.admin_users_default()}
											</Badge>
										)}
										{stream.isForced && (
											<Badge variant="warning-outline" size="sm">
												{m.admin_media_forced_badge()}
											</Badge>
										)}
									</div>
									<Badge variant="secondary" size="sm" font="mono">
										{m.common_rank_number({ index: stream.index })}
									</Badge>
								</div>

								{stream.codecLongName && stream.codecLongName !== stream.codecName && (
									<p className="text-muted-foreground line-clamp-1 text-xs">{stream.codecLongName}</p>
								)}

								<div className="text-muted-foreground flex flex-wrap items-center gap-2 font-mono text-xs">
									<span className="text-foreground font-medium">
										{m.admin_media_resolution({ width: stream.width, height: stream.height })}
									</span>
									{stream.pixelFormat && <span>{m.common_dot_pixel_format({ format: stream.pixelFormat })}</span>}
									{stream.frameRate && <span>{m.common_dot_frame_rate({ rate: stream.frameRate })}</span>}
									{stream.bitRate && <span>{m.admin_media_bit_rate({ value: Math.round(stream.bitRate / 1000) })}</span>}
									{stream.colorTransfer && <span>{m.common_dot_value({ value: stream.colorTransfer })}</span>}
									{stream.colorPrimaries && <span>{m.common_dot_value({ value: stream.colorPrimaries })}</span>}
									{stream.colorSpace && <span>{m.admin_media_color_space({ value: stream.colorSpace })}</span>}
									{stream.doviProfile != null && (
										<Badge variant="outline" size="sm">
											{m.admin_media_dolby_vision_profile({ profile: stream.doviProfile })}
										</Badge>
									)}
									{stream.language && (
										<Badge variant="outline" size="sm">
											{stream.language}
										</Badge>
									)}
								</div>

								{stream.title && (
									<p className="text-foreground text-xs font-medium italic">{m.admin_media_stream_title_quoted({ title: stream.title })}</p>
								)}
							</div>
						))}
					</div>
				) : (
					<p className="text-muted-foreground text-xs">{m.admin_media_no_video_streams()}</p>
				)}
			</AdminSection>

			{/* Audio Streams */}
			<AdminSection title={m.admin_media_audio_streams_section()} description={m.admin_media_audio_tracks_detected()}>
				{audioStreams && audioStreams.length > 0 ? (
					<div className="flex flex-col gap-2.5">
						{audioStreams.map((stream) => (
							<div key={stream.index} className="border-border/80 bg-muted/20 flex flex-col gap-2 rounded-xl border p-3.5 text-xs">
								<div className="flex items-center justify-between">
									<div className="flex flex-wrap items-center gap-2">
										<AudioLines className="text-primary size-3.5" />
										<span className="text-foreground font-semibold">{stream.codecName.toUpperCase()}</span>
										{stream.language && (
											<Badge weight="bold" variant="outline" size="sm">
												{stream.language}
											</Badge>
										)}
										{stream.isDefault && (
											<Badge variant="secondary" size="sm">
												{m.admin_users_default()}
											</Badge>
										)}
										{stream.isForced && (
											<Badge variant="warning-outline" size="sm">
												{m.admin_media_forced_badge()}
											</Badge>
										)}
									</div>
									<Badge variant="secondary" size="sm" font="mono">
										{m.common_rank_number({ index: stream.index })}
									</Badge>
								</div>

								{stream.codecLongName && stream.codecLongName !== stream.codecName && (
									<p className="text-muted-foreground line-clamp-1 text-xs">{stream.codecLongName}</p>
								)}

								<div className="text-muted-foreground flex flex-wrap items-center gap-2 font-mono text-xs">
									<span className="text-foreground font-medium">
										{m.admin_media_channels_layout({
											channels: stream.channels,
											layout: stream.channelLayout ? `(${stream.channelLayout})` : "",
										})}
									</span>
									{stream.sampleRate && <span>{m.admin_media_sample_rate({ rate: formatNumber(stream.sampleRate) })}</span>}
									{stream.bitRate && <span>{m.admin_media_bit_rate({ value: Math.round(stream.bitRate / 1000) })}</span>}
								</div>

								{stream.title && (
									<p className="text-foreground text-xs font-medium italic">{m.admin_media_stream_title_quoted({ title: stream.title })}</p>
								)}
							</div>
						))}
					</div>
				) : (
					<p className="text-muted-foreground text-xs">{m.admin_media_no_audio_streams()}</p>
				)}
			</AdminSection>
		</>
	);
}
