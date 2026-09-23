import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminLogs } from "@/client/hooks/use-admin-logs";
import { AppErrorState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { SkeletonList } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { logTimeFormatter } from "./dashboard-utils";

export function DashboardErrorLogs() {
	// No 3 s polling on the dashboard — this is a summary widget; the dedicated
	// logs page owns live-tail polling behind its explicit toggle.
	const { logs, isLoading, error, refetch } = useAdminLogs(
		{
			level: "warn,error,fatal",
			limit: 6,
		},
		false,
	);
	const logKeyCounts = new Map<string, number>();

	const handleRetry = () => {
		detach(refetch());
	};

	let logsContent: ReactNode;
	if (isLoading) {
		logsContent = <SkeletonList count={2} className="flex flex-col gap-3" />;
	} else if (error) {
		logsContent = <AppErrorState error={error} title={m.admin_dashboard_failed_to_fetch_logs()} onRetry={handleRetry} />;
	} else if (logs.length === 0) {
		logsContent = (
			<div className="flex flex-col items-center justify-center py-10 text-center">
				<CheckCircle2 className="size-8 text-success" />
				<p className="mt-3 font-semibold text-foreground text-sm">{m.admin_dashboard_no_log_errors()}</p>
				<p className="mt-1 text-muted-foreground text-xs">{m.admin_dashboard_server_healthy()}</p>
			</div>
		);
	} else {
		logsContent = (
			<div className="flex flex-col gap-2 overflow-y-auto">
				{logs.slice(0, 6).map((log) => {
					const isError = log.levelName.toLowerCase() === "error" || log.levelName.toLowerCase() === "fatal";
					const baseKey = `${log.timestamp}-${log.levelName}-${log.module ?? "system"}-${log.msg ?? ""}`;
					const occurrence = logKeyCounts.get(baseKey) ?? 0;
					logKeyCounts.set(baseKey, occurrence + 1);

					return (
						<div
							key={`${baseKey}-${occurrence}`}
							className={cn(
								"flex flex-col gap-1 rounded-xl border p-3 font-mono text-xs",
								isError ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5",
							)}
						>
							<div className="flex items-center justify-between text-[10px]">
								<span className={isError ? "font-bold text-destructive" : "font-bold text-warning"}>
									{m.admin_dashboard_log_source_line({ level: log.levelName.toUpperCase(), module: log.module ?? "system" })}
								</span>
								<span className="text-muted-foreground">{logTimeFormatter.format(new Date(log.timestamp))}</span>
							</div>
							<p className="truncate text-foreground text-xs">{log.msg ?? m.admin_dashboard_no_error_message()}</p>
						</div>
					);
				})}
			</div>
		);
	}

	return (
		<AdminSection
			title={m.admin_dashboard_server_warnings_errors()}
			description={m.admin_dashboard_attention_events({ count: logs.length })}
			actions={
				<Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/admin/logs" />}>
					{m.admin_dashboard_all_logs()}
					<ArrowUpRight className="size-3.5" />
				</Button>
			}
			className="lg:col-span-1"
		>
			{logsContent}
		</AdminSection>
	);
}
