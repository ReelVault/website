import { cn } from "cn";
import { CheckCircle2, Cpu, Gpu, RefreshCw, TriangleAlert } from "lucide-react";
import type { AdminFfmpegCapabilities } from "@reelvault/sdk";
import { useFfmpegCapabilities } from "@/client/hooks/use-ffmpeg-capabilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";
import { translateByKey } from "@/utils/translate-error";

const HWACCEL_LABELS: Record<AdminFfmpegCapabilities["effective"]["type"], string> = {
	none: m.player_hwaccel_cpu(),
	nvenc: "NVIDIA NVENC",
	vaapi: "VAAPI",
	qsv: "Intel Quick Sync",
	amf: "AMD AMF",
	videotoolbox: "VideoToolbox",
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
			<span className="min-w-56 shrink-0 text-muted-foreground text-sm">{label}</span>
			<span className="wrap-break-word min-w-0 text-sm">{children}</span>
		</div>
	);
}

function getVerificationResultText(ok: boolean, code: string | null): string {
	if (ok) return m.admin_resources_succeeded();

	if (code) return translateByKey(code);

	return m.common_error();
}

function VerificationRow({ label, ok, code, detail }: { label: string; ok: boolean | null; code: string | null; detail: string | null }) {
	return (
		<div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
			<span className="min-w-56 shrink-0 text-muted-foreground text-sm">{label}</span>
			{ok === null ? (
				<span className="text-muted-foreground text-sm">{m.common_no_value()}</span>
			) : (
				<span className="flex min-w-0 flex-col gap-0.5">
					<span className={cn("flex items-center gap-1.5 text-sm", ok ? "text-success" : "font-medium text-destructive")}>
						{ok ? <CheckCircle2 className="size-4" /> : <TriangleAlert className="size-4" />}
						{getVerificationResultText(ok, code)}
					</span>
					{detail !== null && <span className="wrap-break-word font-mono text-muted-foreground text-xs">{detail}</span>}
				</span>
			)}
		</div>
	);
}

export function FfmpegHwaccelDiagnostics() {
	const { capabilities, isLoading, isRefreshing, refresh } = useFfmpegCapabilities();

	if (isLoading) {
		return (
			<div className="mt-4 flex flex-col gap-3 rounded-xl border border-border p-4">
				<Skeleton className="h-5 w-64" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
			</div>
		);
	}

	if (!capabilities) return null;

	const { effective, verification, decodeTest } = capabilities;
	const isHardware = effective.type !== "none";
	const configuredLabel = capabilities.configured === "auto" ? m.admin_resources_hwaccel_auto() : HWACCEL_LABELS[capabilities.configured];

	let toneMappingStatus: React.ReactNode;
	if (capabilities.toneMapping === "auto" && capabilities.toneMappingMethod !== "none") {
		toneMappingStatus = (
			<span>
				{m.admin_resources_active_paren()}
				<code className="font-mono text-xs">{capabilities.toneMappingMethod}</code>
				{m.admin_resources_tonemap_algorithm_suffix({ algorithm: capabilities.toneMapAlgorithm })}
			</span>
		);
	} else if (capabilities.toneMapping === "none") {
		toneMappingStatus = <span className="text-muted-foreground">{m.admin_resources_disabled_in_settings()}</span>;
	} else {
		toneMappingStatus = <span className="text-warning">{m.admin_resources_no_hdr_tonemap_note()}</span>;
	}

	return (
		<div className="mt-4 flex flex-col gap-4 rounded-xl border border-border p-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-2">
					<span className="font-medium text-sm">{m.admin_resources_detected_capabilities()}</span>
					{isHardware ? (
						<Badge className="border-success/30 bg-success/10 text-success" variant="outline">
							<Gpu data-icon="inline-start" />
							{HWACCEL_LABELS[effective.type]}
						</Badge>
					) : (
						<Badge variant="secondary">
							<Cpu data-icon="inline-start" />
							{m.player_hwaccel_cpu()}
						</Badge>
					)}
					{decodeTest && (
						<Badge
							variant="outline"
							className={cn(
								decodeTest.ok ? "border-success/30 bg-success/10 text-success" : "border-destructive/30 bg-destructive/10 text-destructive",
							)}
						>
							{decodeTest.ok ? <CheckCircle2 data-icon="inline-start" /> : <TriangleAlert data-icon="inline-start" />}
							{m.admin_resources_decoding_status({ status: decodeTest.ok ? m.common_ok() : m.admin_resources_error_word() })}
						</Badge>
					)}
				</div>
				<Button variant="outline" size="sm" disabled={isRefreshing} onClick={() => refresh()}>
					<RefreshCw className={cn("size-4", { "animate-spin": isRefreshing })} />
					{m.admin_resources_redetect()}
				</Button>
			</div>

			<div className="flex flex-col gap-2.5">
				<InfoRow label={m.admin_resources_ffmpeg_version()}>{capabilities.version}</InfoRow>
				<InfoRow label={m.admin_resources_binary_path()}>
					<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{capabilities.binaryPath}</code>
				</InfoRow>
				<InfoRow label={m.admin_resources_hwaccel_configured()}>{configuredLabel}</InfoRow>
				<InfoRow label={m.admin_resources_hwaccel_effective()}>
					{HWACCEL_LABELS[effective.type]}
					{effective.device !== null && (
						<span className="text-muted-foreground">{m.admin_resources_effective_device({ device: effective.device })}</span>
					)}
				</InfoRow>
				<InfoRow label={m.admin_resources_video_encoders()}>
					{m.admin_resources_h264_encoder_label()}
					<code className="font-mono text-xs">{effective.h264Encoder}</code>
					{m.admin_resources_hevc_encoder_label()}
					<code className="font-mono text-xs">{effective.hevcEncoder}</code>
				</InfoRow>
				<InfoRow label={m.admin_resources_drm_device()}>
					{capabilities.driDevice !== null ? (
						<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{capabilities.driDevice}</code>
					) : (
						<span className="text-muted-foreground">{m.admin_resources_not_detected()}</span>
					)}
					{effective.type === "nvenc" && (
						<span className="block text-muted-foreground text-xs">{m.admin_resources_nvenc_dev_dri_note()}</span>
					)}
				</InfoRow>
				<VerificationRow
					label={m.admin_resources_encoder_test_boot()}
					ok={verification?.ok ?? null}
					code={verification?.code ?? null}
					detail={verification?.detail ?? null}
				/>
				{decodeTest && (
					<VerificationRow
						label={m.admin_resources_decode_test_label({ accelerator: HWACCEL_LABELS[decodeTest.accelerator] })}
						ok={decodeTest.ok}
						code={decodeTest.code}
						detail={decodeTest.detail}
					/>
				)}
				<InfoRow label={m.admin_resources_hardware_apis()}>
					{capabilities.hwaccelApis.length > 0 ? (
						<span className="flex flex-wrap gap-1">
							{capabilities.hwaccelApis.map((api) => (
								<Badge key={api} variant="outline" size="sm">
									{api}
								</Badge>
							))}
						</span>
					) : (
						<span className="text-muted-foreground">{m.common_none_lowercase()}</span>
					)}
				</InfoRow>
				<InfoRow label={m.admin_resources_hw_encoders()}>
					{capabilities.hardwareEncoders.length > 0 ? (
						<span className="flex flex-wrap gap-1">
							{capabilities.hardwareEncoders.map((encoder) => (
								<Badge key={encoder} variant="outline" size="sm">
									<code className="font-mono">{encoder}</code>
								</Badge>
							))}
						</span>
					) : (
						<span className="text-muted-foreground">{m.admin_resources_missing_in_ffmpeg_binary()}</span>
					)}
				</InfoRow>
				<InfoRow label={m.admin_resources_tonemapping()}>{toneMappingStatus}</InfoRow>
			</div>

			{verification !== null && !verification.ok && (
				<p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-muted-foreground text-xs">
					{m.admin_resources_accel_failed_notice()}
				</p>
			)}
		</div>
	);
}
