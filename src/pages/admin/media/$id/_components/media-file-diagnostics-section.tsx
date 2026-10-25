import type { MediaFileWithRelation } from "@reelvault/sdk";
import { Calendar, Clock, HardDrive, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatDuration } from "@/utils/duration-utils";
import { formatFileSize } from "@/utils/file-utils";
import { formatBitrate, formatDateTime, formatNumber, formatTimeAgo } from "@/utils/format-utils";

interface MediaFileDiagnosticsSectionProps {
	duration: string;
	size: string;
	bitRate: string;
	file?: MediaFileWithRelation;
}

export function MediaFileDiagnosticsSection({ duration, size, bitRate, file }: MediaFileDiagnosticsSectionProps) {
	const numericDuration = Number(duration) || (file?.duration ?? 0);
	const numericSize = Number(size) || (file?.size ?? 0);
	const numericBitrate = Number(bitRate) || (file?.bitRate ?? 0);

	return (
		<AdminSection title={m.admin_media_technical_values()} description={m.admin_media_container_metrics()}>
			{/* Visual Metrics Cards */}
			<div className="mb-4 grid gap-3 sm:grid-cols-3">
				<div className="border-border/80 bg-background flex flex-col gap-1 rounded-xl border p-3.5 shadow-2xs">
					<div className="text-muted-foreground flex items-center gap-1.5 text-xs">
						<Clock className="text-primary size-3.5" />
						<span>{m.components_duration_label()}</span>
					</div>
					<p className="text-foreground text-base font-bold tabular-nums">{numericDuration ? formatDuration(numericDuration) : "—"}</p>
					<p className="text-muted-foreground font-mono text-xs">
						{m.admin_media_duration_seconds({ value: formatNumber(numericDuration) })}
					</p>
				</div>

				<div className="border-border/80 bg-background flex flex-col gap-1 rounded-xl border p-3.5 shadow-2xs">
					<div className="text-muted-foreground flex items-center gap-1.5 text-xs">
						<HardDrive className="text-primary size-3.5" />
						<span>{m.admin_media_disk_size()}</span>
					</div>
					<p className="text-foreground text-base font-bold tabular-nums">{numericSize ? formatFileSize(numericSize) : "—"}</p>
					<p className="text-muted-foreground font-mono text-xs">{m.admin_media_size_bytes({ value: formatNumber(numericSize) })}</p>
				</div>

				<div className="border-border/80 bg-background flex flex-col gap-1 rounded-xl border p-3.5 shadow-2xs">
					<div className="text-muted-foreground flex items-center gap-1.5 text-xs">
						<Zap className="text-primary size-3.5" />
						<span>{m.admin_media_average_bitrate()}</span>
					</div>
					<p className="text-foreground text-base font-bold tabular-nums">{numericBitrate ? formatBitrate(numericBitrate) : "—"}</p>
					<p className="text-muted-foreground font-mono text-xs">{m.admin_media_bitrate_bps({ value: formatNumber(numericBitrate) })}</p>
				</div>
			</div>

			{/* Raw Inputs */}
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="media-duration" tone="muted" size="xs">
						{m.admin_media_duration_raw_seconds()}
					</Label>
					<Input
						id="media-duration"
						name="duration"
						type="number"
						disabled
						readOnly
						value={duration}
						placeholder="0"
						font="mono"
						className="cursor-not-allowed"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="media-size" tone="muted" size="xs">
						{m.media_size_raw_bytes()}
					</Label>
					<Input
						id="media-size"
						name="size"
						type="number"
						disabled
						readOnly
						value={size}
						placeholder="0"
						font="mono"
						className="cursor-not-allowed"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="media-bitrate" tone="muted" size="xs">
						{m.admin_media_bitrate_raw_bps()}
					</Label>
					<Input
						id="media-bitrate"
						name="bitRate"
						type="number"
						disabled
						readOnly
						value={bitRate}
						placeholder="0"
						font="mono"
						className="cursor-not-allowed"
					/>
				</div>
			</div>

			{/* Filesystem & Database Timestamps */}
			{file && (
				<div className="border-border/60 bg-muted/20 mt-4 flex flex-col gap-2 rounded-xl border p-3.5 text-xs">
					<div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
						<Calendar className="text-primary size-3.5" />
						<span>{m.admin_media_timestamps()}</span>
					</div>

					<div className="grid gap-2 pt-1 font-mono text-xs sm:grid-cols-3">
						<div>
							<span className="text-muted-foreground block">{m.admin_media_disk_modified()}</span>
							<span className="text-foreground">
								{file.sourceMtimeMs ? `${formatDateTime(file.sourceMtimeMs)} (${formatTimeAgo(file.sourceMtimeMs)})` : m.common_none()}
							</span>
						</div>

						<div>
							<span className="text-muted-foreground block">{m.admin_media_added_to_database()}</span>
							<span className="text-foreground">{formatDateTime(file.createdAt)}</span>
						</div>

						<div>
							<span className="text-muted-foreground block">{m.common_updated_label()}</span>
							<span className="text-foreground">{`${formatDateTime(file.updatedAt)} (${formatTimeAgo(file.updatedAt)})`}</span>
						</div>
					</div>
				</div>
			)}
		</AdminSection>
	);
}
