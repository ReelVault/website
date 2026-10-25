import type { UpdateApiKeyRequest } from "@reelvault/sdk";
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

interface ApiKeyRow {
	id: string;
	name: string;
	scope: Scope;
	keyPrefix: string;
	expiresAt: string | null;
	lastUsedAt: string | null;
	createdAt: string;
	createdByName: string | null;
}

const SKELETON_KEYS = ["1", "2", "3"] as const;
/** A key expiring inside this window is listed by the "expiring soon" filter. */
const EXPIRING_WINDOW_MS = 14 * 86_400_000;

export default function AdminApiKeysPage() {
	const page = useAdminApiKeysPageState();
	const expiringCount = page.apiKeys.filter(isExpiringSoon).length;
	const visibleKeys = page.expiringOnly ? page.apiKeys.filter(isExpiringSoon) : page.apiKeys;

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
							<div>
								<Button
									variant="outline"
									size="sm"
									aria-pressed={page.expiringOnly}
									onClick={() => page.setExpiringOnly((value) => !value)}
								>
									{m.admin_api_keys_expiring_filter()}
									<Badge variant="secondary" font="mono">
										{expiringCount}
									</Badge>
								</Button>
							</div>
							{visibleKeys.map((apiKey) => (
								<div key={apiKey.id} className="border-border flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
									<div className="flex min-w-0 flex-col gap-1">
										<div className="flex items-center gap-2">
											<span className="text-sm font-semibold">{apiKey.name}</span>
											<Badge variant={apiKey.scope === "full" ? "destructive" : "secondary"} font="mono">
												{apiKey.scope === "full" ? m.admin_api_keys_scope_full() : m.admin_api_keys_scope_read_only()}
											</Badge>
											{apiKey.expiresAt && isExpired(apiKey.expiresAt) && <Badge variant="destructive">{m.admin_api_keys_expired()}</Badge>}
										</div>
										<div className="text-muted-foreground flex flex-wrap gap-x-4 text-xs">
											<span className="font-mono">{`${apiKey.keyPrefix}…`}</span>
											<span>{m.admin_api_keys_created_value({ date: formatDate(apiKey.createdAt) })}</span>
											{apiKey.createdByName && <span>{m.admin_api_keys_created_by({ name: apiKey.createdByName })}</span>}
											{apiKey.expiresAt && <span>{m.admin_api_keys_expires_value({ date: formatDate(apiKey.expiresAt) })}</span>}
											{apiKey.lastUsedAt && <span>{m.admin_api_keys_last_used_value({ date: formatDate(apiKey.lastUsedAt) })}</span>}
										</div>
									</div>
									<div className="flex flex-wrap items-center gap-2">
										<Button variant="outline" size="sm" disabled={page.updateMutation.isPending} onClick={() => page.setEditingKey(apiKey)}>
											{m.admin_api_keys_edit()}
										</Button>
										<ConfirmAction
											title={m.admin_api_keys_rotate_title({ name: apiKey.name })}
											description={m.admin_api_keys_rotate_description()}
											confirmLabel={m.admin_api_keys_rotate()}
											onConfirm={async () => {
												if (page.rotateMutation.isPending) return;

												const rotated = await page.rotateMutation.mutateAsync(apiKey.id);
												page.showSecret(rotated.key, "rotated");
											}}
										>
											<Button variant="outline" size="sm" disabled={page.rotateMutation.isPending}>
												{m.admin_api_keys_rotate()}
											</Button>
										</ConfirmAction>
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
								</div>
							))}
						</div>
					) : null}
				</AdminSection>
			)}

			<CreateKeyDialog state={page} onCreate={page.onCreate} pending={page.createMutation.isPending} />
			<EditKeyDialog
				apiKey={page.editingKey}
				onClose={() => page.setEditingKey(null)}
				onSave={page.onEdit}
				pending={page.updateMutation.isPending}
			/>
		</div>
	);
}

function isExpired(expiresAt: string): boolean {
	return new Date(expiresAt).getTime() < Date.now();
}

function isExpiringSoon(apiKey: ApiKeyRow): boolean {
	if (!apiKey.expiresAt) return false;

	const remainingMs = new Date(apiKey.expiresAt).getTime() - Date.now();

	return remainingMs > 0 && remainingMs <= EXPIRING_WINDOW_MS;
}

function detachRefetch(refetch: () => Promise<unknown>): void {
	detach(refetch());
}

function useAdminApiKeysPageState() {
	const query = useAdminApiKeys();
	const [createOpen, setCreateOpen] = useState(false);
	const [createdSecret, setCreatedSecret] = useState<string | null>(null);
	const [secretKind, setSecretKind] = useState<"created" | "rotated">("created");
	const [editingKey, setEditingKey] = useState<ApiKeyRow | null>(null);
	const [expiringOnly, setExpiringOnly] = useState(false);

	const openCreate = () => setCreateOpen(true);

	const showSecret = (secret: string, kind: "created" | "rotated") => {
		setSecretKind(kind);
		setCreatedSecret(secret);
	};

	const onCreate = async (input: { name: string; scope: Scope; expiresAtDays?: number }) => {
		const created = await query.createMutation.mutateAsync(input);
		setCreateOpen(false);
		showSecret(created.key, "created");
	};

	const onEdit = async (id: string, body: UpdateApiKeyRequest) => {
		await query.updateMutation.mutateAsync({ id, body });
		setEditingKey(null);
	};

	return {
		apiKeysQuery: query.apiKeysQuery,
		apiKeys: (query.apiKeysQuery.data ?? []) as ApiKeyRow[],
		createMutation: query.createMutation,
		revokeMutation: query.revokeMutation,
		rotateMutation: query.rotateMutation,
		updateMutation: query.updateMutation,
		createOpen,
		setCreateOpen,
		createdSecret,
		secretKind,
		setCreatedSecret,
		showSecret,
		editingKey,
		setEditingKey,
		expiringOnly,
		setExpiringOnly,
		openCreate,
		onCreate,
		onEdit,
	};
}

function EditKeyDialog({
	apiKey,
	onClose,
	onSave,
	pending,
}: {
	apiKey: ApiKeyRow | null;
	onClose: () => void;
	onSave: (id: string, body: UpdateApiKeyRequest) => Promise<unknown>;
	pending: boolean;
}) {
	return (
		<Dialog open={apiKey !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent size="lg">
				{/* Keyed by the edited key, so each opening starts from that key's own values. */}
				{apiKey ? <EditKeyForm key={apiKey.id} apiKey={apiKey} onClose={onClose} onSave={onSave} pending={pending} /> : null}
			</DialogContent>
		</Dialog>
	);
}

function EditKeyForm({
	apiKey,
	onClose,
	onSave,
	pending,
}: {
	apiKey: ApiKeyRow;
	onClose: () => void;
	onSave: (id: string, body: UpdateApiKeyRequest) => Promise<unknown>;
	pending: boolean;
}) {
	const [name, setName] = useState(apiKey.name);
	const [neverExpires, setNeverExpires] = useState(apiKey.expiresAt === null);
	const [expiresInDays, setExpiresInDays] = useState("");

	const submit = async () => {
		if (pending || !name.trim()) return;

		const body: UpdateApiKeyRequest = { name: name.trim() };
		if (neverExpires) body.expiresAtDays = null;
		else if (expiresInDays) body.expiresAtDays = Number(expiresInDays);

		await onSave(apiKey.id, body);
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>{m.admin_api_keys_edit_title()}</DialogTitle>
				<DialogDescription>{m.admin_api_keys_edit_description()}</DialogDescription>
			</DialogHeader>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="api-key-edit-name">{m.admin_api_keys_name_label()}</Label>
					<Input id="api-key-edit-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} />
				</div>
				<label className="flex cursor-pointer items-center gap-2 text-sm">
					<input
						type="checkbox"
						className="accent-primary size-4"
						checked={neverExpires}
						onChange={(event) => setNeverExpires(event.target.checked)}
					/>
					{m.admin_api_keys_never_expires()}
				</label>
				{!neverExpires && (
					<div className="flex flex-col gap-2">
						<Label htmlFor="api-key-edit-expiry">{m.admin_api_keys_expiry_label()}</Label>
						<Input
							id="api-key-edit-expiry"
							type="number"
							min={1}
							max={3650}
							placeholder={m.admin_api_keys_edit_expiry_placeholder()}
							value={expiresInDays}
							onChange={(event) => setExpiresInDays(event.target.value)}
						/>
					</div>
				)}
			</div>
			<DialogFooter>
				<Button variant="outline" onClick={onClose}>
					{m.common_cancel()}
				</Button>
				<Button onClick={() => detach(submit())} disabled={pending || !name.trim()}>
					{pending ? m.common_saving() : m.common_save()}
				</Button>
			</DialogFooter>
		</>
	);
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
		secretKind: "created" | "rotated";
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
			<DialogContent size="lg">
				{state.createdSecret ? (
					<>
						<DialogHeader>
							<DialogTitle>
								{state.secretKind === "rotated" ? m.admin_api_keys_rotated_title() : m.admin_api_keys_created_title()}
							</DialogTitle>
							<DialogDescription>{m.admin_api_keys_created_warning()}</DialogDescription>
						</DialogHeader>
						<div className="border-border bg-muted/40 rounded-xl border p-3 font-mono text-xs break-all">{state.createdSecret}</div>
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
