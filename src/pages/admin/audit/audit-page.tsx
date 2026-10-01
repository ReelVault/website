import { useNavigate, useSearch } from "@tanstack/react-router";
import { History, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { type AdminAuditAction, useAdminAudit } from "@/client/hooks/use-admin-audit";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { SimplePagination } from "@/components/simple-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSearch, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import type { AdminAuditSearch } from "@/routes/admin/audit";
import { AuditEntryRow } from "./components/audit-entry-row";

const SKELETON_KEYS = ["one", "two", "three", "four", "five", "six"] as const;

const ACTIONS: Array<{ value: AdminAuditAction; label: string }> = [
	{ value: "all", label: m.common_all() },
	{ value: "create", label: m.admin_audit_creations() },
	{ value: "update", label: m.admin_audit_edits() },
	{ value: "delete", label: m.admin_audit_deletions() },
];

/** `datetime-local` values are local time without seconds; the API expects RFC 3339. */
function toIsoDateTime(value: string): string | undefined {
	if (!value) return undefined;

	const date = new Date(value);

	return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function AdminAuditContent() {
	const search = useSearch({ from: "/admin/audit" });
	const navigate = useNavigate({ from: "/admin/audit" });

	const action = search.action ?? "all";
	const resourceType = search.resourceType ?? "";
	const actorUserId = search.actorUserId ?? "";
	const ipAddress = search.ipAddress ?? "";
	const requestId = search.requestId ?? "";
	const from = search.from ?? "";
	const to = search.to ?? "";
	const page = search.page ?? 1;

	const patchSearch = (patch: Partial<AdminAuditSearch>) => {
		detach(navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }));
	};

	// Text filters are debounced copies of the URL values — otherwise every
	// keystroke fired an audit request.
	const debouncedResourceType = useDebounce({ value: resourceType, delay: 400 });
	const debouncedActorUserId = useDebounce({ value: actorUserId, delay: 400 });
	const debouncedIpAddress = useDebounce({ value: ipAddress, delay: 400 });
	const debouncedRequestId = useDebounce({ value: requestId, delay: 400 });
	const { entries, pagination, isLoading, isFetching, error, refetch } = useAdminAudit({
		action,
		resourceType: debouncedResourceType,
		actorUserId: debouncedActorUserId,
		ipAddress: debouncedIpAddress,
		requestId: debouncedRequestId,
		from: toIsoDateTime(from),
		to: toIsoDateTime(to),
		page,
		limit: 25,
	});

	const handleResourceTypeChange = (value: string) => {
		patchSearch({ resourceType: value || undefined, page: undefined });
	};

	const handleActionChange = (value: string[]) => {
		const next = value[0];
		if (!next) return;

		const matched = ACTIONS.find((item) => item.value === next);
		if (!matched) return;

		patchSearch({ action: matched.value === "all" ? undefined : matched.value, page: undefined });
	};

	const setPage = (next: number) => {
		patchSearch({ page: next > 1 ? next : undefined });
	};

	const handleRefetch = () => {
		detach(refetch());
	};

	let auditContent: ReactNode;
	if (isLoading) {
		auditContent = (
			<div className="flex flex-col gap-1 p-4">
				{SKELETON_KEYS.map((key) => (
					<Skeleton key={key} className="h-14 w-full rounded-lg" />
				))}
			</div>
		);
	} else if (error) {
		auditContent = <AppErrorState title={m.admin_audit_failed_to_fetch()} error={error} onRetry={handleRefetch} />;
	} else if (entries.length === 0) {
		auditContent = <AppEmptyState icon={History} title={m.admin_audit_no_entries()} description={m.admin_audit_no_changes_for_filters()} />;
	} else {
		auditContent = (
			<div className="divide-y divide-border">
				{entries.map((entry) => (
					<AuditEntryRow key={entry.id} entry={entry} />
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={History}
				eyebrow={m.admin_audit_eyebrow()}
				title={m.admin_audit_admin_audit()}
				description={m.admin_audit_description()}
				actions={
					<Button variant="outline" size="sm" disabled={isFetching} onClick={handleRefetch}>
						<RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
						{m.common_refresh()}
					</Button>
				}
			/>

			<div className="flex flex-col gap-3">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<AdminSearch
						value={resourceType}
						onChange={handleResourceTypeChange}
						placeholder={m.admin_audit_filter_resource_type()}
						className="sm:max-w-sm"
					/>
					<ToggleGroup
						multiple={false}
						value={[action]}
						onValueChange={handleActionChange}
						variant="outline"
						size="sm"
						className="flex-wrap"
					>
						{ACTIONS.map((item) => (
							<ToggleGroupItem key={item.value} value={item.value}>
								{item.label}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>

				<div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
					<Input
						value={actorUserId}
						placeholder={m.admin_audit_filter_actor()}
						onChange={(event) => {
							patchSearch({ actorUserId: event.target.value || undefined, page: undefined });
						}}
					/>
					<Input
						value={ipAddress}
						placeholder={m.admin_audit_filter_ip()}
						onChange={(event) => {
							patchSearch({ ipAddress: event.target.value || undefined, page: undefined });
						}}
					/>
					<Input
						value={requestId}
						placeholder={m.admin_audit_filter_request()}
						onChange={(event) => {
							patchSearch({ requestId: event.target.value || undefined, page: undefined });
						}}
					/>
					<Input
						type="datetime-local"
						value={from}
						aria-label={m.admin_audit_filter_from()}
						onChange={(event) => {
							patchSearch({ from: event.target.value || undefined, page: undefined });
						}}
					/>
					<Input
						type="datetime-local"
						value={to}
						aria-label={m.admin_audit_filter_to()}
						onChange={(event) => {
							patchSearch({ to: event.target.value || undefined, page: undefined });
						}}
					/>
				</div>
			</div>

			<AdminSection
				title={m.admin_audit_entries_section()}
				badge={
					<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
						{pagination.total}
					</Badge>
				}
				contentClassName="p-0"
			>
				{auditContent}
				<div className="border-border border-t p-3">
					<SimplePagination
						variant="admin"
						currentPage={page}
						totalPages={pagination.totalPages}
						isLoading={isLoading}
						onPageChange={setPage}
					/>
				</div>
			</AdminSection>
		</div>
	);
}

function AuditSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<Skeleton className="h-4 w-48" />
				<Skeleton className="h-8 w-72" />
			</div>
			<Skeleton className="h-9 w-full rounded-md" />
			<Skeleton className="h-96 w-full rounded-xl" />
		</div>
	);
}

export default function AdminAuditPage() {
	return (
		<Suspense fallback={<AuditSkeleton />}>
			<AdminAuditContent />
		</Suspense>
	);
}
