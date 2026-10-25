import type { AdminWorkerAllocation } from "@reelvault/sdk";
import { Badge } from "@/components/ui/badge";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

const WORKER_LABELS: Record<string, string> = {
	imageProcessing: "Image Processing",
	mediaFileAnalysis: "Media File Analysis",
	mediaFileTechnicalRefresh: "Media File Technical Refresh",
	metadataRefresh: "Metadata Refresh",
	scanning: "Scanning",
	transcode: "Transcode",
};

const REASON_LABELS: Record<string, string> = {
	critical_pressure: m.admin_resources_critical_pressure(),
	high_pressure_low_priority: m.admin_resources_high_pressure_low_priority(),
	memory_pressure: m.admin_resources_memory_pressure(),
	streaming_limit: m.admin_resources_streams_limit(),
	server_rescue: "Server Rescue",
};

export function WorkerAllocations({ allocations }: { allocations?: AdminWorkerAllocation[] | null }) {
	if (!allocations || allocations.length === 0) return null;

	return (
		<AdminSection title={m.admin_resources_worker_allocations()} description={m.admin_resources_current_concurrency()}>
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{allocations.map((alloc) => (
					<div
						key={alloc.workerId}
						className={`flex flex-col justify-between gap-3 rounded-lg border p-4 transition-colors ${
							alloc.throttled ? "border-warning/30 bg-warning/5 hover:bg-warning/10" : "border-border/70 bg-muted/20 hover:bg-muted/35"
						}`}
					>
						<div className="flex items-start justify-between gap-2">
							<div className="min-w-0">
								<p className="text-foreground truncate text-sm font-medium">{WORKER_LABELS[alloc.workerId] ?? alloc.workerId}</p>
								<p className="text-muted-foreground mt-1 text-xs">
									{alloc.requested > 0 ? m.admin_resources_manual_allocation({ count: alloc.requested }) : m.common_auto_word()}
								</p>
							</div>
							{alloc.throttled && (
								<Badge variant="warning" className="shrink-0">
									{m.admin_resources_throttled()}
								</Badge>
							)}
						</div>
						<div className="border-border/60 flex items-center justify-between border-t pt-2 text-xs">
							<span className="text-muted-foreground">
								{m.admin_resources_allocation_label()} <span className="text-foreground font-mono font-bold">{alloc.allocated}</span>
							</span>
							{alloc.reason && (
								<span className="text-warning truncate text-xs" title={alloc.reason}>
									{REASON_LABELS[alloc.reason] ?? alloc.reason}
								</span>
							)}
						</div>
					</div>
				))}
			</div>
		</AdminSection>
	);
}
