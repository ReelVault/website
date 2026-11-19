import { m } from "@/paraglide/messages";

/** One line describing an audit entry, shared by the audit log and the dashboard feed. */
export function auditEntryLabel(entry: {
	summary?: string | null;
	resourceType?: string;
	resourceName?: string | null;
	resourceId?: string | null;
	actorUserId?: string | null;
}): string {
	if (entry.summary) return entry.summary;

	const type = entry.resourceType ?? "resource";
	if (entry.resourceName) return `${type}: ${entry.resourceName}`;

	// Raw ids are long UUIDs — the row stays scannable with the short form.
	if (entry.resourceId) return `${type} / ${entry.resourceId.slice(0, 8)}`;

	if (entry.actorUserId) return m.admin_dashboard_action_by_user({ actorId: entry.actorUserId.slice(0, 8) });

	return m.admin_dashboard_action_by_system();
}
