import type { ReactNode } from "react";
import { type AdminAuditSummaryFilters, useAdminAuditSummary } from "@/client/hooks/use-admin-audit";
import { AppErrorState } from "@/components/app-states";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatDate } from "@/utils/format-utils";

/** Activity per administrator for the filters the audit page shows. */
export function AuditActorSummary({ filters }: { filters: AdminAuditSummaryFilters }) {
	const { data, isLoading, error, refetch } = useAdminAuditSummary(filters);
	const actors = data?.actors ?? [];

	let content: ReactNode;
	if (isLoading) {
		content = <Skeleton className="h-16 w-full" />;
	} else if (error) {
		content = <AppErrorState title={m.admin_audit_failed_to_fetch()} error={error} onRetry={() => detach(refetch)} />;
	} else if (actors.length === 0) {
		content = <p className="text-muted-foreground text-sm">{m.admin_audit_no_changes_for_filters()}</p>;
	} else {
		content = (
			<div className="divide-border divide-y">
				{actors.map((actor) => (
					<div key={actor.actorUserId ?? "unattributed"} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5">
						<div className="min-w-0">
							{actor.name ? (
								<p className="truncate text-sm font-medium">{actor.name}</p>
							) : (
								<p className="truncate font-mono text-xs">{actor.actorUserId ?? m.admin_audit_unattributed()}</p>
							)}
							{actor.lastAt && (
								<p className="text-muted-foreground text-xs">{m.admin_audit_last_activity({ date: formatDate(actor.lastAt) })}</p>
							)}
						</div>
						<div className="flex flex-wrap items-center gap-1.5 text-xs">
							<Badge weight="normal" variant="secondary">
								<span>{m.admin_audit_creations()}</span>
								<strong className="font-semibold">{actor.creates}</strong>
							</Badge>
							<Badge weight="normal" variant="secondary">
								<span>{m.admin_audit_edits()}</span>
								<strong className="font-semibold">{actor.updates}</strong>
							</Badge>
							<Badge weight="normal" variant="secondary">
								<span>{m.admin_audit_deletions()}</span>
								<strong className="font-semibold">{actor.deletes}</strong>
							</Badge>
							<Badge variant="outline" font="mono">
								{actor.total}
							</Badge>
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<AdminSection
			title={m.admin_audit_by_admin_section()}
			description={m.admin_audit_by_admin_description()}
			badge={
				<Badge variant="secondary" font="mono">
					{data?.total ?? 0}
				</Badge>
			}
		>
			{content}
		</AdminSection>
	);
}
