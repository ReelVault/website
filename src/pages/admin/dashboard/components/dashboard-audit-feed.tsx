import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Shield } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminAudit } from "@/client/hooks/use-admin-audit";
import { AppErrorState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { SkeletonList } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { auditActionLabel, auditEntryLabel, auditResourceTypeLabel } from "../../audit/audit-entry-label";
import { auditDateFormatter } from "./dashboard-utils";

export function DashboardAuditFeed() {
	const { entries, isLoading, error, refetch } = useAdminAudit({ limit: 6 });

	let feedContent: ReactNode;
	if (isLoading) {
		feedContent = <SkeletonList count={3} className="flex flex-col gap-3" />;
	} else if (error) {
		feedContent = <AppErrorState error={error} onRetry={() => detach(refetch())} />;
	} else if (entries.length === 0) {
		feedContent = (
			<div className="flex flex-col items-center justify-center py-10 text-center">
				<Shield className="text-muted-foreground size-8" />
				<p className="text-foreground mt-3 text-sm font-semibold">{m.admin_audit_no_entries()}</p>
				<p className="text-muted-foreground mt-1 text-xs">{m.admin_dashboard_new_operations_appear_here()}</p>
			</div>
		);
	} else {
		feedContent = (
			<div className="flex flex-col gap-3">
				{entries.map((entry) => (
					<div key={entry.id} className="border-border/60 bg-card/60 flex items-start gap-3 rounded-xl border p-3 text-xs">
						<div className="bg-muted text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg">
							<Shield className="text-primary size-3.5" />
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex items-center justify-between gap-2">
								<span className="text-foreground truncate font-semibold">
									{`${auditActionLabel(entry.action)}: ${auditResourceTypeLabel(entry.resourceType)}`}
								</span>
								<span className="text-muted-foreground shrink-0 text-xs">{auditDateFormatter.format(new Date(entry.createdAt))}</span>
							</div>
							<p className="text-muted-foreground mt-0.5 truncate text-xs">{auditEntryLabel(entry)}</p>
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<AdminSection
			title={m.admin_dashboard_event_log_audit_feed()}
			description={m.admin_dashboard_audit_feed_description()}
			actions={
				<Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/admin/audit" />}>
					{m.admin_dashboard_full_audit()}
					<ArrowUpRight className="size-3.5" />
				</Button>
			}
			className="lg:col-span-1"
		>
			{feedContent}
		</AdminSection>
	);
}
