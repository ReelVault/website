import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { m } from "@/paraglide/messages";

export type DurationPreset = "10" | "60" | "all" | "custom";

interface MediaFileScanConfigProps {
	durationPreset: DurationPreset;
	onDurationPresetChange: (preset: DurationPreset) => void;
	customDuration: string;
	onCustomDurationChange: (value: string) => void;
}

export function MediaFileScanConfig({
	durationPreset,
	onDurationPresetChange,
	customDuration,
	onCustomDurationChange,
}: MediaFileScanConfigProps) {
	return (
		<div className="flex flex-col gap-6 py-4">
			<div className="flex flex-col gap-3">
				<Label className="font-medium text-foreground text-sm">{m.admin_media_decode_test_duration()}</Label>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
					<Button
						type="button"
						variant={durationPreset === "10" ? "default" : "outline"}
						onClick={() => onDurationPresetChange("10")}
						className="text-xs"
					>
						{m.admin_media_scan_preset_quick()}
					</Button>
					<Button
						type="button"
						variant={durationPreset === "60" ? "default" : "outline"}
						onClick={() => onDurationPresetChange("60")}
						className="text-xs"
					>
						{m.admin_media_scan_preset_standard()}
					</Button>
					<Button
						type="button"
						variant={durationPreset === "all" ? "default" : "outline"}
						onClick={() => onDurationPresetChange("all")}
						className="text-xs"
					>
						{m.admin_media_full_scan()}
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant={durationPreset === "custom" ? "default" : "outline"}
						onClick={() => onDurationPresetChange("custom")}
						className="shrink-0 text-xs"
					>
						{m.admin_media_other_time()}
					</Button>
					{durationPreset === "custom" && (
						<Input
							type="number"
							value={customDuration}
							onChange={(e) => onCustomDurationChange(e.target.value)}
							placeholder={m.admin_media_scan_seconds_placeholder()}
							className="h-9 text-xs"
							min={1}
						/>
					)}
				</div>
				{durationPreset === "all" && (
					<p className="flex items-center gap-1.5 rounded-lg border border-warning/20 bg-warning/10 p-2 font-medium text-[11px] text-warning">
						<AlertCircle className="size-3.5 shrink-0" />
						{m.admin_media_full_decode_warning()}
					</p>
				)}
			</div>

			<div className="rounded-xl border border-border bg-muted/20 p-4 text-muted-foreground text-xs leading-relaxed">
				{m.admin_media_scan_integrity_hint()}
			</div>
		</div>
	);
}
