import { KeyRound, LockOpen, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import type { usePluginCatalog } from "@/client/hooks/use-plugin-catalog";
import { ConfirmAction } from "@/components/confirm-action";
import {
	FullscreenDialog,
	FullscreenDialogContent,
	FullscreenDialogDescription,
	FullscreenDialogHeader,
	FullscreenDialogTitle,
} from "@/components/fullscreen-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { formatDateTime } from "@/utils/format-utils";
import { translateCode } from "@/utils/translate-error";

interface PluginRepositoriesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	repositories: ReturnType<typeof usePluginCatalog>["repositories"];
	isBusy: boolean;
	onCreate: (body: { name: string; url: string; token?: string }) => Promise<unknown>;
	onUpdate: (repositoryId: string, body: { enabled?: boolean }) => Promise<unknown>;
	onDelete: (repositoryId: string) => Promise<unknown>;
	onRefresh: (repositoryId: string) => Promise<unknown>;
}

/** Runs the create request, then resets the form; the submitting flag clears either way. */
async function submitRepository(
	create: () => Promise<unknown>,
	onCreated: () => void,
	setSubmitting: (submitting: boolean) => void,
): Promise<void> {
	try {
		await create();
		onCreated();
	} finally {
		setSubmitting(false);
	}
}

export function PluginRepositoriesDialog({
	open,
	onOpenChange,
	repositories,
	isBusy,
	onCreate,
	onUpdate,
	onDelete,
	onRefresh,
}: PluginRepositoriesDialogProps) {
	const [name, setName] = useState("");
	const [url, setUrl] = useState("");
	const [token, setToken] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const canSubmit = name.trim().length > 0 && url.trim().length > 8 && !isBusy && !isSubmitting;

	const submit = () => {
		if (!canSubmit) return;

		setIsSubmitting(true);
		detach(
			submitRepository(
				() => onCreate({ name: name.trim(), url: url.trim(), ...(token.trim() ? { token: token.trim() } : {}) }),
				() => {
					setName("");
					setUrl("");
					setToken("");
				},
				setIsSubmitting,
			),
		);
	};

	return (
		<FullscreenDialog open={open} onOpenChange={onOpenChange}>
			<FullscreenDialogContent className="max-h-[85vh] w-full max-w-3xl overflow-y-auto">
				<FullscreenDialogHeader>
					<FullscreenDialogTitle>{m.admin_plugins_repositories_title()}</FullscreenDialogTitle>
					<FullscreenDialogDescription>{m.admin_plugins_repositories_description()}</FullscreenDialogDescription>
				</FullscreenDialogHeader>

				<div className="flex flex-col gap-3">
					{repositories.length === 0 && (
						<p className="text-muted-foreground py-4 text-center text-sm">{m.admin_plugins_repositories_empty()}</p>
					)}
					{repositories.map((repository) => (
						<div key={repository.id} className="bg-muted/30 flex flex-col gap-2 rounded-lg border p-3">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<span className="truncate text-sm font-medium">{repository.name}</span>
										{repository.hasToken ? (
											<KeyRound className="text-primary size-3.5 shrink-0" aria-label={m.admin_plugins_repositories_token_set()} />
										) : (
											<LockOpen className="text-muted-foreground size-3.5 shrink-0" aria-label={m.admin_plugins_repositories_no_token()} />
										)}
									</div>
									<p className="text-muted-foreground truncate font-mono text-xs">{repository.url}</p>
									<p className="text-muted-foreground mt-0.5 text-xs">
										{repository.lastRefreshedAt
											? m.admin_plugins_repositories_last_refreshed({ date: formatDateTime(repository.lastRefreshedAt) })
											: m.admin_plugins_repositories_never_refreshed()}
									</p>
								</div>
								<div className="flex shrink-0 items-center gap-1.5">
									<Switch
										checked={repository.enabled}
										disabled={isBusy}
										aria-label={m.admin_plugins_repositories_enabled()}
										onCheckedChange={(enabled) => detach(onUpdate(repository.id, { enabled }))}
									/>
									<Button
										variant="ghost"
										size="icon"
										disabled={isBusy}
										aria-label={m.admin_plugins_repositories_refresh()}
										title={m.admin_plugins_repositories_refresh()}
										onClick={() => detach(onRefresh(repository.id))}
									>
										<RefreshCw className="size-3.5" />
									</Button>
									<ConfirmAction
										trigger={
											<Button
												variant="destructive-ghost"
												size="icon"
												disabled={isBusy}
												aria-label={m.admin_plugins_repositories_remove()}
												title={m.admin_plugins_repositories_remove()}
											>
												<Trash2 className="size-3.5" />
											</Button>
										}
										title={m.admin_plugins_repositories_remove_confirm_title({ name: repository.name })}
										description={m.admin_plugins_repositories_remove_confirm_description()}
										confirmLabel={m.admin_plugins_repositories_remove()}
										onConfirm={() => detach(onDelete(repository.id))}
									/>
								</div>
							</div>
							{repository.lastErrorCode && (
								<p className="text-destructive text-xs wrap-break-word">
									{m.admin_plugins_repositories_last_error_value({
										error: translateCode(repository.lastErrorCode, m.plugin_repository_unavailable()),
									})}
								</p>
							)}
						</div>
					))}
				</div>

				<div className="flex flex-col gap-3 rounded-lg border border-dashed p-3">
					<h4 className="text-sm font-semibold">{m.admin_plugins_repositories_add_title()}</h4>
					<div className="flex flex-col gap-2">
						<Label htmlFor="plugin-repo-name">{m.admin_plugins_repositories_name_label()}</Label>
						<Input
							id="plugin-repo-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder={m.admin_plugins_repositories_name_placeholder()}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="plugin-repo-url">{m.admin_plugins_repositories_url_label()}</Label>
						<Input
							id="plugin-repo-url"
							value={url}
							onChange={(event) => setUrl(event.target.value)}
							placeholder="https://example.com/reelvault-catalog.json"
							font="mono"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="plugin-repo-token">{m.admin_plugins_repositories_token_label()}</Label>
						<Input
							id="plugin-repo-token"
							type="password"
							value={token}
							onChange={(event) => setToken(event.target.value)}
							placeholder={m.admin_plugins_repositories_token_placeholder()}
							font="mono"
						/>
						<p className="text-muted-foreground text-xs">{m.admin_plugins_repositories_token_hint()}</p>
					</div>
					<Button variant="outline" size="sm" disabled={!canSubmit} onClick={submit} className="self-start">
						{isSubmitting ? <Spinner size="sm" /> : <Plus className="size-3.5" />}
						{m.admin_plugins_repositories_add()}
					</Button>
				</div>
			</FullscreenDialogContent>
		</FullscreenDialog>
	);
}
