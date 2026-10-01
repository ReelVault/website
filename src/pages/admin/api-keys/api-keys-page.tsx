import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useAdminApiKeys } from "@/client/hooks/use-admin-api-keys";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { ConfirmAction } from "@/components/confirm-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatDate } from "@/utils/format-utils";
import { toast } from "@/utils/toast-facade";

type Scope = "read_only" | "full";

const SKELETON_KEYS = ["1", "2", "3"] as const;

export default function AdminApiKeysPage() {
	const page = useAdminApiKeysPageState();

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={KeyRound}
				eyebrow={m.admin_api_keys_eyebrow()}
				title={m.admin_api_keys_heading()}
				description={m.admin_api_keys_description()}
				count={page.apiKeys.length}
				actions={
					<Button size="sm" onClick={page.openCreate}>
						{m.admin_api_keys_create()}
					</Button>
				}
			/>

			{page.apiKeysQuery.isError ? (
				<AdminSection>
					<AppErrorState title={m.admin_api_keys_heading()} onRetry={() => detachRefetch(page.apiKeysQuery.refetch)} />
				</AdminSection>
			) : (
				<AdminSection>
					{page.apiKeysQuery.isPending ? (
						<div className="flex flex-col gap-3">
							{SKELETON_KEYS.map((key) => (
								<Skeleton key={key} className="h-16 w-full" />
							))}
						</div>
					) : null}
					{!page.apiKeysQuery.isPending && page.apiKeys.length === 0 ? (
						<AppEmptyState title={m.admin_api_keys_empty()} description={m.admin_api_keys_empty_description()} />
					) : null}
					{!page.apiKeysQuery.isPending && page.apiKeys.length > 0 ? (
						<div className="flex flex-col gap-3">
							{page.apiKeys.map((apiKey) => (
								<div key={apiKey.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4">
									<div className="flex min-w-0 flex-col gap-1">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-sm">{apiKey.name}</span>
											<Badge variant={apiKey.scope === "full" ? "destructive" : "secondary"} className="font-mono text-[11px]">
												{apiKey.scope === "full" ? m.admin_api_keys_scope_full() : m.admin_api_keys_scope_read_only()}
											</Badge>
											{apiKey.expiresAt && isExpired(apiKey.expiresAt) && (
												<Badge variant="destructive" className="text-[11px]">
													{m.admin_api_keys_expired()}
												</Badge>
											)}
										</div>
										<div className="flex flex-wrap gap-x-4 text-muted-foreground text-xs">
											<span className="font-mono">{`${apiKey.keyPrefix}…`}</span>
											<span>{m.admin_api_keys_created_value({ date: formatDate(apiKey.createdAt) })}</span>
											{apiKey.expiresAt && <span>{m.admin_api_keys_expires_value({ date: formatDate(apiKey.expiresAt) })}</span>}
											{apiKey.lastUsedAt && <span>{m.admin_api_keys_last_used_value({ date: formatDate(apiKey.lastUsedAt) })}</span>}
										</div>
									</div>
									<ConfirmAction
										title={m.admin_api_keys_revoke_title({ name: apiKey.name })}
										description={m.admin_api_keys_revoke_description()}
										confirmLabel={m.admin_api_keys_revoke()}
										onConfirm={async () => {
											if (page.revokeMutation.isPending) return;

											await page.revokeMutation.mutateAsync(apiKey.id);
										}}
									>
										<Button variant="outline" size="sm" disabled={page.revokeMutation.isPending}>
											{m.admin_api_keys_revoke()}
										</Button>
									</ConfirmAction>
								</div>
							))}
						</div>
					) : null}
				</AdminSection>
			)}

			<CreateKeyDialog state={page} onCreate={page.onCreate} pending={page.createMutation.isPending} />
		</div>
	);
}

function isExpired(expiresAt: string): boolean {
	return new Date(expiresAt).getTime() < Date.now();
}

function detachRefetch(refetch: () => Promise<unknown>): void {
	detach(refetch());
}

function useAdminApiKeysPageState() {
	const query = useAdminApiKeys();
	const [createOpen, setCreateOpen] = useState(false);
	const [createdSecret, setCreatedSecret] = useState<string | null>(null);

	const openCreate = () => setCreateOpen(true);

	const onCreate = async (input: { name: string; scope: Scope; expiresAtDays?: number }) => {
		const created = await query.createMutation.mutateAsync(input);
		setCreateOpen(false);
		setCreatedSecret(created.key);
	};

	return {
		apiKeysQuery: query.apiKeysQuery,
		apiKeys: query.apiKeysQuery.data ?? [],
		createMutation: query.createMutation,
		revokeMutation: query.revokeMutation,
		createOpen,
		setCreateOpen,
		createdSecret,
		setCreatedSecret,
		openCreate,
		onCreate,
	};
}

function CreateKeyDialog({
	state,
	onCreate,
	pending,
}: {
	state: {
		createOpen: boolean;
		setCreateOpen: (open: boolean) => void;
		createdSecret: string | null;
		setCreatedSecret: (secret: string | null) => void;
		onCreate: (input: { name: string; scope: Scope; expiresAtDays?: number }) => Promise<unknown>;
	};
	onCreate: (input: { name: string; scope: Scope; expiresAtDays?: number }) => Promise<unknown>;
	pending: boolean;
}) {
	const [name, setName] = useState("");
	const [scope, setScope] = useState<Scope>("read_only");
	const [expiresInDays, setExpiresInDays] = useState("");

	const reset = () => {
		state.setCreateOpen(false);
		setName("");
		setScope("read_only");
		setExpiresInDays("");
	};

	const submit = async () => {
		if (pending || !name.trim()) return;

		await onCreate({
			name: name.trim(),
			scope,
			expiresAtDays: expiresInDays ? Number(expiresInDays) : undefined,
		});
		reset();
	};

	return (
		<Dialog
			open={state.createdSecret !== null || state.createOpen}
			onOpenChange={(open) => {
				if (!open) {
					state.setCreatedSecret(null);
					state.setCreateOpen(false);
				}
			}}
		>
			<DialogContent className="max-w-lg">
				{state.createdSecret ? (
					<>
						<DialogHeader>
							<DialogTitle>{m.admin_api_keys_created_title()}</DialogTitle>
							<DialogDescription>{m.admin_api_keys_created_warning()}</DialogDescription>
						</DialogHeader>
						<div className="break-all rounded-xl border border-border bg-muted/40 p-3 font-mono text-xs">{state.createdSecret}</div>
						<DialogFooter>
							<Button
								onClick={() => {
									detach(navigator.clipboard.writeText(state.createdSecret ?? ""));
									toast.success(m.common_copied());
								}}
							>
								{m.common_copy()}
							</Button>
							<Button variant="outline" onClick={() => state.setCreatedSecret(null)}>
								{m.common_done()}
							</Button>
						</DialogFooter>
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>{m.admin_api_keys_create_title()}</DialogTitle>
							<DialogDescription>{m.admin_api_keys_create_description()}</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="api-key-name">{m.admin_api_keys_name_label()}</Label>
								<Input id="api-key-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} />
							</div>
							<div className="flex flex-col gap-2">
								<Label>{m.admin_api_keys_scope_label()}</Label>
								<Select
									value={scope}
									onValueChange={(value) => {
										if (value === "read_only" || value === "full") setScope(value);
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="read_only">{m.admin_api_keys_scope_read_only()}</SelectItem>
										<SelectItem value="full">{m.admin_api_keys_scope_full()}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="api-key-expiry">{m.admin_api_keys_expiry_label()}</Label>
								<Input
									id="api-key-expiry"
									type="number"
									min={1}
									max={3650}
									placeholder={m.admin_api_keys_expiry_placeholder()}
									value={expiresInDays}
									onChange={(event) => setExpiresInDays(event.target.value)}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={reset}>
								{m.common_cancel()}
							</Button>
							<Button
								onClick={() => {
									detach(submit());
								}}
								disabled={pending || !name.trim()}
							>
								{pending ? m.common_saving() : m.admin_api_keys_create()}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
