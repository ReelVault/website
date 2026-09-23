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
import { auditDateFormatter } from "./dashboard-utils";

function auditEntryLabel(entry: {
	summary?: string | null;
	resourceType?: string;
	resourceName?: string | null;
	actorUserId?: string | null;
}): string {
	if (entry.summary) return entry.summary;

	if (entry.resourceName) return `${entry.resourceType ?? "resource"}: ${entry.resourceName}`;

	if (entry.actorUserId) return m.admin_dashboard_action_by_user({ actorId: entry.actorUserId.slice(0, 8) });

	return m.admin_dashboard_action_by_system();
}

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
				<Shield className="size-8 text-muted-foreground" />
				<p className="mt-3 font-semibold text-foreground text-sm">{m.admin_audit_no_entries()}</p>
				<p className="mt-1 text-muted-foreground text-xs">{m.admin_dashboard_new_operations_appear_here()}</p>
			</div>
		);
	} else {
		feedContent = (
			<div className="flex flex-col gap-3">
				{entries.map((entry) => (
					<div key={entry.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/60 p-3 text-xs">
						<div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
							<Shield className="size-3.5 text-primary" />
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex items-center justify-between gap-2">
								<span className="truncate font-semibold text-foreground capitalize">
									{entry.action} {entry.resourceType}
								</span>
								<span className="shrink-0 text-[10px] text-muted-foreground">{auditDateFormatter.format(new Date(entry.createdAt))}</span>
							</div>
							<p className="mt-0.5 truncate text-[11px] text-muted-foreground">{auditEntryLabel(entry)}</p>
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
