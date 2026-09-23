import { Link } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import type { reelvault } from "@/client/client";
import { Badge } from "@/components/ui/badge";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { formatFullDateTime, formatTimeAgo } from "@/utils/format-utils";

export type AuditEntryItem = NonNullable<Awaited<ReturnType<typeof reelvault.admin.getAudit>>["data"]>[number];

export function AuditDetailInspector({ entry }: { entry: AuditEntryItem }) {
	const { hasCopied, copy } = useCopyToClipboard();
	const beforeSnapshot = entry.before !== undefined ? JSON.stringify(entry.before, null, 2) : "";
	const afterSnapshot = entry.after !== undefined ? JSON.stringify(entry.after, null, 2) : "";

	const renderResourceLink = () => {
		if (!entry.resourceId) return null;

		if (entry.resourceType === "metadata") {
			return (
				<Link to="/admin/metadata/$id" params={{ id: entry.resourceId }} className="font-mono text-primary hover:underline">
					{entry.resourceName ?? `${entry.resourceId.slice(0, 10)}…`}
				</Link>
			);
		}

		if (entry.resourceType === "media_file") {
			return (
				<Link to="/admin/media/$id" params={{ id: entry.resourceId }} className="font-mono text-primary hover:underline">
					{entry.resourceName ?? `${entry.resourceId.slice(0, 10)}…`}
				</Link>
			);
		}

		if (entry.resourceType === "collection") {
			return (
				<Link to="/admin/collections/$id" params={{ id: entry.resourceId }} className="font-mono text-primary hover:underline">
					{entry.resourceName ?? `${entry.resourceId.slice(0, 10)}…`}
				</Link>
			);
		}

		if (entry.resourceType === "user") {
			return (
				<Link to="/admin/users/$id" params={{ id: entry.resourceId }} className="font-mono text-primary hover:underline">
					{entry.resourceName ?? `${entry.resourceId.slice(0, 10)}…`}
				</Link>
			);
		}

		if (entry.resourceType === "library") {
			return (
				<Link to="/admin/libraries" className="font-mono text-primary hover:underline">
					{entry.resourceName ?? `${entry.resourceId.slice(0, 10)}…`}
				</Link>
			);
		}

		return <span className="font-mono text-foreground">{entry.resourceName ?? `${entry.resourceId.slice(0, 10)}…`}</span>;
	};

	return (
		<div className="flex flex-col gap-4 border-border border-t bg-muted/15 p-4 text-xs">
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-background/60 p-3">
					<span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">{m.admin_audit_resource()}</span>
					<div className="flex flex-wrap items-center gap-1.5">
						<Badge variant="outline" className="font-mono text-[11px]">
							{entry.resourceType}
						</Badge>
						{renderResourceLink()}
					</div>
					{entry.resourceId && (
						<div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
							<span className="block truncate">{m.common_id_label({ id: entry.resourceId })}</span>
							<button
								type="button"
								onClick={() => {
									const { resourceId } = entry;
									if (resourceId !== null) detach(() => copy(resourceId, m.admin_audit_resource_id()));
								}}
								className="hover:text-foreground"
								title={m.admin_audit_copy_resource_id()}
							>
								{hasCopied ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
							</button>
						</div>
					)}
				</div>

				<div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-background/60 p-3">
					<span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">{m.admin_audit_actor_word()}</span>
					{entry.actorUserId ? (
						<div className="flex flex-col gap-0.5">
							<Link to="/admin/users/$id" params={{ id: entry.actorUserId }} className="block font-semibold text-primary hover:underline">
								{m.admin_audit_actor_user_named({ id: entry.actorUserId.slice(0, 8) })}
							</Link>
							<div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
								<span className="block truncate">{entry.actorUserId}</span>
								<button
									type="button"
									onClick={() => {
										const { actorUserId } = entry;
										if (actorUserId !== null) detach(() => copy(actorUserId, m.admin_audit_actor_id()));
									}}
									className="hover:text-foreground"
									title={m.admin_audit_copy_actor_id()}
								>
									{hasCopied ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
								</button>
							</div>
						</div>
					) : (
						<p className="font-medium text-muted-foreground">{m.admin_audit_system_job()}</p>
					)}
				</div>

				<div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-background/60 p-3">
					<span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
						{m.admin_audit_client_and_network()}
					</span>
					<div className="flex flex-col gap-0.5">
						{entry.ipAddress ? (
							<div className="flex items-center gap-1 font-mono text-foreground">
								<span>{m.admin_audit_ip_display({ ip: entry.ipAddress })}</span>
								<button
									type="button"
									onClick={() => {
										const { ipAddress } = entry;
										if (ipAddress !== null) detach(() => copy(ipAddress, m.admin_audit_ip_word()));
									}}
									className="hover:text-foreground"
									title={m.admin_audit_copy_ip()}
								>
									{hasCopied ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
								</button>
							</div>
						) : (
							<span className="text-muted-foreground">{m.admin_audit_local_no_ip()}</span>
						)}
						{entry.requestId && (
							<span className="block truncate font-mono text-[10px] text-muted-foreground" title={entry.requestId}>
								{m.admin_audit_request_id_display({ id: entry.requestId.slice(0, 12) })}
							</span>
						)}
					</div>
				</div>

				<div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-background/60 p-3">
					<span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">{m.admin_audit_operation_time()}</span>
					<p className="font-medium text-foreground">{formatFullDateTime(entry.createdAt)}</p>
					<p className="text-[10px] text-muted-foreground">{formatTimeAgo(entry.createdAt)}</p>
				</div>
			</div>

			{entry.userAgent && (
				<div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-[11px] text-muted-foreground">
					<span className="font-semibold text-foreground">{m.admin_audit_user_agent_label()}</span> {entry.userAgent}
				</div>
			)}

			{(beforeSnapshot || afterSnapshot) && (
				<div className="grid gap-3 sm:grid-cols-2">
					{beforeSnapshot && (
						<div className="flex flex-col gap-1.5">
							<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
								{m.admin_audit_state_before_change()}
							</span>
							<pre className="max-h-60 overflow-auto rounded-lg border border-border/80 bg-background/80 p-3 font-mono text-[11px] text-muted-foreground leading-relaxed">
								{beforeSnapshot}
							</pre>
						</div>
					)}
					{afterSnapshot && (
						<div className="flex flex-col gap-1.5">
							<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
								{m.admin_audit_state_after_change()}
							</span>
							<pre className="max-h-60 overflow-auto rounded-lg border border-border/80 bg-background/80 p-3 font-mono text-[11px] text-success/90 leading-relaxed">
								{afterSnapshot}
							</pre>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
