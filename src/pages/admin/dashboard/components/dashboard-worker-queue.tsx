import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminJobs } from "@/client/hooks/use-admin-jobs";
import { AppErrorState } from "@/components/app-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SkeletonList } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

function queueBadgeVariant(isFailed: boolean, isCompleted: boolean, isProcessing: boolean) {
	if (isFailed) return "destructive";
	if (isCompleted) return "success";
	if (isProcessing) return "primary";
	return "outline";
}

export function DashboardWorkerQueue() {
	const { operations, operationsQuery } = useAdminJobs(undefined, 8, true);

	let queueContent: ReactNode;
	if (operationsQuery.isLoading) {
		queueContent = <SkeletonList count={3} itemClassName="h-14" className="flex flex-col gap-3" />;
	} else if (operationsQuery.isError) {
		queueContent = <AppErrorState error={operationsQuery.error} onRetry={() => detach(operationsQuery.refetch())} />;
	} else if (operations.length === 0) {
		queueContent = (
			<div className="flex flex-col items-center justify-center py-10 text-center">
				<CheckCircle2 className="text-success/70 size-8" />
				<p className="text-foreground mt-3 text-sm font-semibold">{m.admin_dashboard_all_jobs_done()}</p>
				<p className="text-muted-foreground mt-1 text-xs">{m.admin_dashboard_queue_empty()}</p>
			</div>
		);
	} else {
		queueContent = (
			<div className="flex flex-col gap-3">
				{operations.slice(0, 5).map((op) => {
					const isProcessing = op.status === "running" || op.status === "pending";
					const isCompleted = op.status === "completed";
					const isFailed = op.status === "failed";
					const progress = op.progressPercent ?? 0;
					let statusIcon: ReactNode;
					if (isProcessing) {
						statusIcon = <RefreshCw className="text-primary size-3.5 animate-spin" />;
					} else if (isCompleted) {
						statusIcon = <CheckCircle2 className="text-success size-3.5" />;
					} else if (isFailed) {
						statusIcon = <XCircle className="text-destructive size-3.5" />;
					} else {
						statusIcon = <Clock className="text-muted-foreground size-3.5" />;
					}

					return (
						<div key={op.id} className="border-border/60 bg-card/60 flex flex-col gap-2 rounded-xl border p-3 text-xs">
							<div className="flex items-center justify-between">
								<div className="flex min-w-0 items-center gap-2">
									{statusIcon}
									<span className="text-foreground truncate font-semibold capitalize">{op.type.replace(/_/g, " ")}</span>
								</div>
								<Badge variant={queueBadgeVariant(isFailed, isCompleted, isProcessing)} transform="capitalize">
									{op.status}
								</Badge>
							</div>
							{op.totalItems > 0 && (
								<div className="flex flex-col gap-1">
									<Progress value={Math.min(100, Math.max(0, progress))} />
									<div className="text-muted-foreground flex justify-between text-xs">
										<span>{m.admin_dashboard_job_progress_ratio({ completed: op.completedItems, total: op.totalItems })}</span>
										<span>{m.common_percent_value({ value: Math.round(progress) })}</span>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		);
	}

	return (
		<AdminSection
			title={m.admin_dashboard_job_queue()}
			description={m.admin_dashboard_metadata_processing_description()}
			actions={
				<Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/admin/worker" />}>
					{m.admin_dashboard_jobs_panel()}
					<ArrowUpRight className="size-3.5" />
				</Button>
			}
			className="lg:col-span-1"
		>
			{queueContent}
		</AdminSection>
	);
}
