import { Play, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useAdminScanMediaFile } from "@/client/hooks/use-admin-media";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { type DurationPreset, MediaFileScanConfig } from "./media-file-scan-config";
import { MediaFileScanResults } from "./media-file-scan-results";

interface MediaFileScanDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mediaFileId: string;
	fileName: string;
}

export function MediaFileScanDialog({ open, onOpenChange, mediaFileId, fileName }: MediaFileScanDialogProps) {
	const { scanMediaFile, isScanning, scanResult, resetScan } = useAdminScanMediaFile();
	const [durationPreset, setDurationPreset] = useState<DurationPreset>("10");
	const [customDuration, setCustomDuration] = useState<string>("120");

	// null means "decode the whole file" — only the "all" preset may ask for it; an
	// empty or invalid custom value must not silently turn into a full decode.
	const parsedCustom = Number.parseInt(customDuration, 10);
	const isCustomInvalid = durationPreset === "custom" && !(parsedCustom > 0);

	const handleScan = () => {
		if (isCustomInvalid) return;

		let durationSeconds: number | null = null;
		if (durationPreset === "10") durationSeconds = 10;
		else if (durationPreset === "60") durationSeconds = 60;
		else if (durationPreset === "custom") durationSeconds = parsedCustom;

		detach(scanMediaFile({ mediaFileId, durationSeconds }));
	};

	const handleClose = () => {
		if (!isScanning) {
			resetScan();
			onOpenChange(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent size="xl">
				<DialogHeader>
					<DialogTitle>{m.admin_media_integrity_scan()}</DialogTitle>
					<DialogDescription className="truncate">{fileName}</DialogDescription>
				</DialogHeader>

				{!(scanResult ?? isScanning) && (
					<MediaFileScanConfig
						durationPreset={durationPreset}
						onDurationPresetChange={setDurationPreset}
						customDuration={customDuration}
						onCustomDurationChange={setCustomDuration}
					/>
				)}

				{isScanning && (
					<div className="flex flex-col items-center justify-center gap-4 py-12">
						<RefreshCw className="text-primary size-10 animate-spin" />
						<div className="flex flex-col gap-1 text-center">
							<p className="text-foreground text-sm font-semibold">{m.admin_media_scan_in_progress()}</p>
							<p className="text-muted-foreground text-xs">{m.admin_media_scan_may_take_time()}</p>
						</div>
					</div>
				)}

				{scanResult && !isScanning && <MediaFileScanResults scanResult={scanResult} />}

				<DialogFooter className="gap-2">
					{!(scanResult ?? isScanning) && (
						<>
							<Button variant="ghost" onClick={handleClose}>
								{m.common_cancel()}
							</Button>
							<Button onClick={handleScan} disabled={isCustomInvalid}>
								<Play className="size-3.5" />
								{m.admin_media_run_scan()}
							</Button>
						</>
					)}
					{scanResult && !isScanning && (
						<>
							<Button variant="outline" onClick={handleScan}>
								<RefreshCw className="size-3.5" />
								{m.admin_media_run_again()}
							</Button>
							<Button onClick={handleClose}>{m.common_close()}</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
