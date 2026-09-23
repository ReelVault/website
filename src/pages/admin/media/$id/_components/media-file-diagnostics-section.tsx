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
				<div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-background p-3.5 shadow-2xs">
					<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
						<Clock className="size-3.5 text-primary" />
						<span>{m.components_duration_label()}</span>
					</div>
					<p className="font-bold text-base text-foreground tabular-nums">{numericDuration ? formatDuration(numericDuration) : "—"}</p>
					<p className="font-mono text-[11px] text-muted-foreground">
						{m.admin_media_duration_seconds({ value: formatNumber(numericDuration) })}
					</p>
				</div>

				<div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-background p-3.5 shadow-2xs">
					<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
						<HardDrive className="size-3.5 text-primary" />
						<span>{m.admin_media_disk_size()}</span>
					</div>
					<p className="font-bold text-base text-foreground tabular-nums">{numericSize ? formatFileSize(numericSize) : "—"}</p>
					<p className="font-mono text-[11px] text-muted-foreground">{m.admin_media_size_bytes({ value: formatNumber(numericSize) })}</p>
				</div>

				<div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-background p-3.5 shadow-2xs">
					<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
						<Zap className="size-3.5 text-primary" />
						<span>{m.admin_media_average_bitrate()}</span>
					</div>
					<p className="font-bold text-base text-foreground tabular-nums">{numericBitrate ? formatBitrate(numericBitrate) : "—"}</p>
					<p className="font-mono text-[11px] text-muted-foreground">
						{m.admin_media_bitrate_bps({ value: formatNumber(numericBitrate) })}
					</p>
				</div>
			</div>

			{/* Raw Inputs */}
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="media-duration" className="font-medium text-muted-foreground text-xs">
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
						className="h-9 cursor-not-allowed bg-muted/40 px-3 font-mono text-muted-foreground text-xs"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="media-size" className="font-medium text-muted-foreground text-xs">
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
						className="h-9 cursor-not-allowed bg-muted/40 px-3 font-mono text-muted-foreground text-xs"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="media-bitrate" className="font-medium text-muted-foreground text-xs">
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
						className="h-9 cursor-not-allowed bg-muted/40 px-3 font-mono text-muted-foreground text-xs"
					/>
				</div>
			</div>

			{/* Filesystem & Database Timestamps */}
			{file && (
				<div className="mt-4 flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs">
					<div className="flex items-center gap-1.5 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
						<Calendar className="size-3.5 text-primary" />
						<span>{m.admin_media_timestamps()}</span>
					</div>

					<div className="grid gap-2 pt-1 font-mono text-[11px] sm:grid-cols-3">
						<div>
							<span className="block text-muted-foreground">{m.admin_media_disk_modified()}</span>
							<span className="text-foreground">
								{file.sourceMtimeMs ? `${formatDateTime(file.sourceMtimeMs)} (${formatTimeAgo(file.sourceMtimeMs)})` : m.common_none()}
							</span>
						</div>

						<div>
							<span className="block text-muted-foreground">{m.admin_media_added_to_database()}</span>
							<span className="text-foreground">{formatDateTime(file.createdAt)}</span>
						</div>

						<div>
							<span className="block text-muted-foreground">{m.common_updated_label()}</span>
							<span className="text-foreground">{`${formatDateTime(file.updatedAt)} (${formatTimeAgo(file.updatedAt)})`}</span>
						</div>
					</div>
				</div>
			)}
		</AdminSection>
	);
}
