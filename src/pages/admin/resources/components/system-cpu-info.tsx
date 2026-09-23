import { Cpu, Gauge, Zap } from "lucide-react";
import type { AdminSystemCpu } from "reelvault-sdk";
import { Badge } from "@/components/ui/badge";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

const PROFILE_LABELS: Record<AdminSystemCpu["cpuProfile"], { label: string; badgeClass: string }> = {
	conservative: { label: "Conservative", badgeClass: "border-info/30 bg-info/10 text-info" },
	balanced: { label: "Balanced", badgeClass: "border-green-500/30 bg-green-500/10 text-green-500" },
	performance: { label: "Performance", badgeClass: "border-orange-500/30 bg-orange-500/10 text-orange-500" },
	custom: { label: "Custom", badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-500" },
};

function MetricItem({ label, value, unit }: { label: string; value: number; unit?: string }) {
	return (
		<div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
			<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
			<p className="mt-1 font-bold font-mono text-foreground text-lg tabular-nums">
				{value}
				{unit && <span className="ml-1 font-medium text-muted-foreground text-xs">{unit}</span>}
			</p>
		</div>
	);
}

export function SystemCpuInfo({ cpu }: { cpu?: AdminSystemCpu | null }) {
	if (!cpu) return null;

	const profile = PROFILE_LABELS[cpu.cpuProfile];

	let speedFactorNotice: string;
	if (cpu.speedFactor < 0.7) {
		speedFactorNotice = m.admin_resources_slow_cores_notice();
	} else if (cpu.speedFactor < 1.0) {
		speedFactorNotice = m.admin_resources_cores_below_reference();
	} else {
		speedFactorNotice = m.admin_resources_cores_reference_or_better();
	}

	return (
		<AdminSection title={m.player_hwaccel_cpu()} description={m.admin_resources_hardware_params()}>
			<div className="flex flex-col gap-5">
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Cpu className="size-4 text-primary" aria-hidden="true" />
						<p className="font-medium text-[11px] uppercase tracking-wider">{m.admin_resources_detected_cores()}</p>
					</div>
					<Badge variant="outline" className={profile.badgeClass}>
						{profile.label}
					</Badge>
				</div>

				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<MetricItem label={m.admin_resources_detected_cores()} value={cpu.detectedCores} />
					<MetricItem label={m.admin_resources_effective_cores()} value={cpu.effectiveCores} />
					<MetricItem label="Speed Factor" value={Number(cpu.speedFactor.toFixed(2))} unit="×" />
					<MetricItem label="Capacity" value={cpu.capacity} unit="equiv." />
				</div>

				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<MetricItem label={m.admin_resources_http_reserve()} value={cpu.reservedWebCores} unit={m.admin_resources_cores_unit()} />
					<MetricItem label={m.admin_resources_worker_budget()} value={cpu.backgroundBudgetCores} unit={m.admin_resources_cores_unit()} />
					<MetricItem label={m.admin_resources_max_core()} value={cpu.configuredMaxCores} unit={m.admin_resources_cores_unit()} />
				</div>

				<div className="flex items-center gap-2 text-muted-foreground">
					<Zap className="size-4 text-primary" aria-hidden="true" />
					<p className="font-medium text-[11px] uppercase tracking-wider">{m.admin_resources_subprocess_budgets()}</p>
				</div>

				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
					<MetricItem label="FFmpeg Threads" value={cpu.ffmpegThreads} />
					<MetricItem label={m.admin_resources_sharp_images()} value={cpu.sharpConcurrency} />
					<MetricItem label={m.admin_dashboard_worker_jobs_label()} value={cpu.workerPoolMaxConcurrent} />
					<MetricItem label="Scanner" value={cpu.scannerConcurrency} />
					<MetricItem label="FFprobe" value={cpu.ffprobeConcurrency} />
				</div>

				<div className="flex items-center gap-2 text-muted-foreground">
					<Gauge className="size-4 text-primary" aria-hidden="true" />
					<p className="font-medium text-[11px] uppercase tracking-wider">{m.admin_resources_speed_factor_meaning()}</p>
				</div>
				<p className="text-muted-foreground text-xs leading-relaxed">{speedFactorNotice}</p>
			</div>
		</AdminSection>
	);
}
