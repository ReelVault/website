import { CheckCircle2, XCircle } from "lucide-react";
import type { useAdminScanMediaFile } from "@/client/hooks/use-admin-media";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";

type ScanResult = NonNullable<ReturnType<typeof useAdminScanMediaFile>["scanResult"]>;

interface MediaFileScanResultsProps {
	scanResult: ScanResult;
}

export function MediaFileScanResults({ scanResult }: MediaFileScanResultsProps) {
	return (
		<div className="flex flex-col gap-5 py-4">
			<div className="flex flex-col gap-3">
				<h3 className="font-semibold text-foreground text-sm">{m.admin_scan_result()}</h3>

				{/* Status 1: file availability */}
				<div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3.5">
					<div className="flex flex-col gap-1">
						<p className="font-semibold text-foreground text-xs">{m.admin_media_disk_availability()}</p>
						<p className="text-[11px] text-muted-foreground">
							{scanResult.exists
								? m.admin_media_file_exists_notice({
										size: scanResult.sizeBytes ? formatFileSize(scanResult.sizeBytes) : m.admin_media_unknown_size(),
									})
								: m.admin_media_no_file_at_path()}
						</p>
					</div>
					{scanResult.exists && scanResult.readable ? (
						<CheckCircle2 className="size-5 shrink-0 text-success" />
					) : (
						<XCircle className="size-5 shrink-0 text-destructive" />
					)}
				</div>

				{/* Status 2: ffprobe */}
				<div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3.5">
					<div className="flex w-full flex-col gap-1 overflow-hidden">
						<p className="font-semibold text-foreground text-xs">{m.admin_media_container_analysis()}</p>
						<p className="text-[11px] text-muted-foreground">
							{scanResult.probeSuccess ? m.admin_media_streams_read_notice() : m.admin_media_failed_to_read_streams()}
						</p>
						{scanResult.probeError !== null && (
							<pre className="mt-2 max-h-24 overflow-x-auto whitespace-pre-wrap rounded-lg border border-destructive/20 bg-destructive/10 p-2 font-mono text-[10px] text-destructive">
								{scanResult.probeError}
							</pre>
						)}
					</div>
					{scanResult.probeSuccess ? (
						<CheckCircle2 className="size-5 shrink-0 text-success" />
					) : (
						<XCircle className="size-5 shrink-0 text-destructive" />
					)}
				</div>

				{/* Status 3: ffmpeg */}
				<div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3.5">
					<div className="flex w-full flex-col gap-1 overflow-hidden">
						<p className="font-semibold text-foreground text-xs">{m.admin_media_decode_streams_test()}</p>
						<p className="text-[11px] text-muted-foreground">
							{scanResult.decodeSuccess ? m.admin_media_decode_success_notice() : m.admin_media_decode_errors()}
						</p>
						{scanResult.decodeError && (
							<pre className="mt-2 max-h-28 overflow-x-auto whitespace-pre-wrap rounded-lg border border-destructive/20 bg-destructive/10 p-2 font-mono text-[10px] text-destructive">
								{scanResult.decodeError}
							</pre>
						)}
					</div>
					{scanResult.decodeSuccess ? (
						<CheckCircle2 className="size-5 shrink-0 text-success" />
					) : (
						<XCircle className="size-5 shrink-0 text-destructive" />
					)}
				</div>
			</div>
		</div>
	);
}
