import { Link } from "@tanstack/react-router";
import { cn } from "cn";
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
				<CheckCircle2 className="size-8 text-success/70" />
				<p className="mt-3 font-semibold text-foreground text-sm">{m.admin_dashboard_all_jobs_done()}</p>
				<p className="mt-1 text-muted-foreground text-xs">{m.admin_dashboard_queue_empty()}</p>
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
						statusIcon = <RefreshCw className="size-3.5 animate-spin text-primary" />;
					} else if (isCompleted) {
						statusIcon = <CheckCircle2 className="size-3.5 text-success" />;
					} else if (isFailed) {
						statusIcon = <XCircle className="size-3.5 text-destructive" />;
					} else {
						statusIcon = <Clock className="size-3.5 text-muted-foreground" />;
					}

					return (
						<div key={op.id} className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/60 p-3 text-xs">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									{statusIcon}
									<span className="font-semibold text-foreground capitalize">{op.type.replace(/_/g, " ")}</span>
								</div>
								<Badge
									variant="outline"
									className={cn("text-[10px] capitalize", {
										"border-primary/30 bg-primary/10 text-primary": isProcessing,
										"border-success/30 bg-success/10 text-success": isCompleted,
										"border-destructive/30 bg-destructive/10 text-destructive": isFailed,
									})}
								>
									{op.status}
								</Badge>
							</div>
							{op.totalItems > 0 && (
								<div className="flex flex-col gap-1">
									<Progress value={Math.min(100, Math.max(0, progress))} className="h-1" />
									<div className="flex justify-between text-[10px] text-muted-foreground">
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
