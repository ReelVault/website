import type { TrickplayRegenerationQueued } from "@reelvault/sdk";
import { AlertTriangle, CheckCircle2, Clock, Film, HardDrive } from "lucide-react";
import { useState } from "react";
import { useRegenerateTrickplay, useTrickplayRegenerationReport } from "@/client/hooks/use-admin-trickplay";
import { useAdminLibraries } from "@/client/hooks/use-libraries";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { AdminSection, AdminStatCard } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

interface QueuedRegeneration {
	library: string;
	result: TrickplayRegenerationQueued;
}

/**
 * Library-scoped regeneration: queues the missing previews of one library, or rebuilds all of them, and shows what
 * that pass produced. The report keeps refreshing while any of its jobs is still queued or running.
 */
export function TrickplayRegenerationSection() {
	const { libraries } = useAdminLibraries();
	const regenerate = useRegenerateTrickplay();
	const [queued, setQueued] = useState<QueuedRegeneration | null>(null);
	const report = useTrickplayRegenerationReport(queued?.result.operationId);

	const queue = async (library: { id: string; name: string }, force: boolean) => {
		const result = await regenerate.mutateAsync({ scope: "library", id: library.id, force });
		setQueued({ library: library.name, result });
	};

	return (
		<AdminSection title={m.admin_trickplay_regenerate_section()} description={m.admin_trickplay_regenerate_section_description()}>
			<div className="flex flex-col gap-3">
				{libraries.map((library) => (
					<div key={library.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
						<span className="font-medium text-sm">{library.name}</span>
						<div className="flex flex-wrap items-center gap-2">
							<ConfirmAction
								trigger={
									<Button variant="outline" size="sm" disabled={regenerate.isPending}>
										{m.admin_trickplay_fill_missing()}
									</Button>
								}
								title={m.admin_trickplay_regenerate_confirm_title({ library: library.name })}
								description={m.admin_trickplay_regenerate_confirm_description()}
								confirmLabel={m.admin_trickplay_regenerate_confirm_action()}
								onConfirm={() => queue(library, false)}
							/>
							<ConfirmAction
								trigger={
									<Button variant="outline" size="sm" disabled={regenerate.isPending}>
										{m.admin_trickplay_regenerate_all()}
									</Button>
								}
								title={m.admin_trickplay_regenerate_confirm_title({ library: library.name })}
								description={m.admin_trickplay_regenerate_confirm_description()}
								confirmLabel={m.admin_trickplay_regenerate_confirm_action()}
								onConfirm={() => queue(library, true)}
							/>
						</div>
					</div>
				))}
			</div>

			{queued && (
				<div className="mt-4 flex flex-col gap-3 border-border/60 border-t pt-4">
					<p className="text-muted-foreground text-sm">
						{m.admin_trickplay_report_queued({ enqueued: queued.result.enqueued, matching: queued.result.matching })}
					</p>
					{queued.result.remaining > 0 && (
						<p className="text-sm text-warning">{m.admin_trickplay_report_remaining({ remaining: queued.result.remaining })}</p>
					)}
					{report.data && (
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
							<AdminStatCard
								label={m.admin_trickplay_report_generated()}
								value={report.data.generated}
								icon={CheckCircle2}
								tone="success"
							/>
							<AdminStatCard
								label={m.admin_trickplay_report_budget_skipped()}
								value={report.data.skippedStorageBudget}
								icon={HardDrive}
								tone={report.data.skippedStorageBudget > 0 ? "warning" : "muted"}
							/>
							<AdminStatCard label={m.admin_trickplay_report_other_skipped()} value={report.data.skippedOther} icon={Film} tone="muted" />
							<AdminStatCard
								label={m.admin_trickplay_report_failed()}
								value={report.data.failed}
								icon={AlertTriangle}
								tone={report.data.failed > 0 ? "destructive" : "muted"}
							/>
							<AdminStatCard
								label={m.admin_trickplay_report_unfinished()}
								value={report.data.unfinished}
								icon={Clock}
								tone={report.data.unfinished > 0 ? "default" : "muted"}
							/>
						</div>
					)}
				</div>
			)}
		</AdminSection>
	);
}
