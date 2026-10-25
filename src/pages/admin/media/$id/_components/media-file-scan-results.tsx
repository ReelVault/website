import { CheckCircle2, XCircle } from "lucide-react";
import type { useAdminScanMediaFile } from "@/client/hooks/use-admin-media";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";
import { translateCode } from "@/utils/translate-error";

type ScanResult = NonNullable<ReturnType<typeof useAdminScanMediaFile>["scanResult"]>;

interface MediaFileScanResultsProps {
	scanResult: ScanResult;
}

export function MediaFileScanResults({ scanResult }: MediaFileScanResultsProps) {
	return (
		<div className="flex flex-col gap-5 py-4">
			<div className="flex flex-col gap-3">
				<h3 className="text-foreground text-sm font-semibold">{m.admin_scan_result()}</h3>

				{/* Status 1: file availability */}
				<div className="border-border bg-muted/40 flex items-start justify-between gap-3 rounded-xl border p-3.5">
					<div className="flex flex-col gap-1">
						<p className="text-foreground text-xs font-semibold">{m.admin_media_disk_availability()}</p>
						<p className="text-muted-foreground text-xs">
							{scanResult.exists
								? m.admin_media_file_exists_notice({
										size: scanResult.sizeBytes ? formatFileSize(scanResult.sizeBytes) : m.admin_media_unknown_size(),
									})
								: m.admin_media_no_file_at_path()}
						</p>
					</div>
					{scanResult.exists && scanResult.readable ? (
						<CheckCircle2 className="text-success size-5 shrink-0" />
					) : (
						<XCircle className="text-destructive size-5 shrink-0" />
					)}
				</div>

				{/* Status 2: ffprobe */}
				<div className="border-border bg-muted/40 flex items-start justify-between gap-3 rounded-xl border p-3.5">
					<div className="flex w-full flex-col gap-1 overflow-hidden">
						<p className="text-foreground text-xs font-semibold">{m.admin_media_container_analysis()}</p>
						<p className="text-muted-foreground text-xs">
							{scanResult.probeSuccess ? m.admin_media_streams_read_notice() : m.admin_media_failed_to_read_streams()}
						</p>
						{scanResult.probeErrorCode !== null && (
							<pre className="border-destructive/20 bg-destructive/10 text-destructive mt-2 max-h-24 overflow-x-auto rounded-lg border p-2 font-mono text-xs whitespace-pre-wrap">
								{translateCode(scanResult.probeErrorCode, m.media_probe_failed())}
							</pre>
						)}
					</div>
					{scanResult.probeSuccess ? (
						<CheckCircle2 className="text-success size-5 shrink-0" />
					) : (
						<XCircle className="text-destructive size-5 shrink-0" />
					)}
				</div>

				{/* Status 3: ffmpeg */}
				<div className="border-border bg-muted/40 flex items-start justify-between gap-3 rounded-xl border p-3.5">
					<div className="flex w-full flex-col gap-1 overflow-hidden">
						<p className="text-foreground text-xs font-semibold">{m.admin_media_decode_streams_test()}</p>
						<p className="text-muted-foreground text-xs">
							{scanResult.decodeSuccess ? m.admin_media_decode_success_notice() : m.admin_media_decode_errors()}
						</p>
						{scanResult.decodeErrorCode && (
							<pre className="border-destructive/20 bg-destructive/10 text-destructive mt-2 max-h-28 overflow-x-auto rounded-lg border p-2 font-mono text-xs whitespace-pre-wrap">
								{translateCode(scanResult.decodeErrorCode, m.media_decode_failed())}
							</pre>
						)}
					</div>
					{scanResult.decodeSuccess ? (
						<CheckCircle2 className="text-success size-5 shrink-0" />
					) : (
						<XCircle className="text-destructive size-5 shrink-0" />
					)}
				</div>
			</div>
		</div>
	);
}
