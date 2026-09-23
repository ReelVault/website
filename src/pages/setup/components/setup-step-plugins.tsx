import { cn } from "cn";
import { Download, Puzzle, Upload } from "lucide-react";
import { useState } from "react";
import type { PluginCatalogEntry, PluginRuntimeStatus } from "reelvault-sdk";
import { useAdminPlugins } from "@/client/hooks/use-admin-plugins";
import { usePluginCatalog } from "@/client/hooks/use-plugin-catalog";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { pluginCatalogCategoryLabel } from "@/pages/admin/plugins/components/plugin-catalog-card";
import { PluginUploadDialog } from "@/pages/admin/plugins/components/plugin-upload-dialog";
import { PluginUploadProgress } from "@/pages/admin/plugins/components/plugin-upload-progress";
import { m } from "@/paraglide/messages";

function entryKey(entry: PluginCatalogEntry): string {
	return `${entry.repositoryId}:${entry.id}`;
}

function pluginStateBadge(plugin: PluginRuntimeStatus): { status: "success" | "error" | "idle" | "pending"; label: string } {
	if (plugin.state === "failed" || plugin.error) return { status: "error", label: m.setup_plugin_state_failed() };

	if (plugin.state === "enabled") return { status: "success", label: m.setup_plugin_state_enabled() };

	if (plugin.state === "disabled") return { status: "idle", label: m.setup_plugin_state_disabled() };

	return { status: "pending", label: plugin.state };
}

/**
 * First-run step: pick plugins from the catalog (installing enables them
 * server-side) or upload a local archive. Reuses the admin catalog hook and
 * upload dialog; the step is optional — "Finish" works with zero installs.
 */
export function SetupStepPlugins() {
	const {
		catalog,
		catalogQuery,
		installPlugin,
		installArchive,
		archiveEntries,
		archiveSummary,
		isInstallingArchive,
		clearArchiveEntries,
		isInstalling,
	} = usePluginCatalog();
	const { plugins } = useAdminPlugins();
	const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());
	const [isUploadOpen, setIsUploadOpen] = useState(false);

	const available = catalog.filter((entry) => entry.status !== "installed");
	const isBusy = isInstalling || isInstallingArchive;

	const toggleSelection = (entry: PluginCatalogEntry) => {
		const key = entryKey(entry);
		setSelectedIds((current) => {
			const next = new Set(current);
			if (next.has(key)) next.delete(key);
			else next.add(key);

			return next;
		});
	};

	const installSelected = () => {
		const selected = available.filter((entry) => selectedIds.has(entryKey(entry)));
		if (selected.length === 0) return;

		detach(
			(async () => {
				for (const entry of selected) {
					try {
						await installPlugin({ repositoryId: entry.repositoryId, pluginId: entry.id });
					} catch {
						// The hook's onError toast reports the failure; keep installing
						// the remaining selection instead of aborting the whole batch.
					}
				}

				setSelectedIds(new Set());
			})(),
		);
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col gap-1">
				<h2 className="font-semibold text-lg tracking-tight">{m.setup_plugins_title()}</h2>
				<p className="text-muted-foreground text-sm">{m.setup_plugins_desc()}</p>
			</div>

			{plugins.length > 0 && (
				<div className="flex flex-col gap-3">
					<div className="flex flex-col gap-1">
						<h3 className="font-semibold text-sm">{m.setup_plugins_installed_title()}</h3>
						<p className="text-muted-foreground text-xs">{m.setup_plugins_installed_desc()}</p>
					</div>
					<ul className="flex flex-col gap-2">
						{plugins.map((plugin) => {
							const badge = pluginStateBadge(plugin);

							return (
								<li key={plugin.id} className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3">
									<div className="flex items-center justify-between gap-3">
										<div className="flex min-w-0 flex-col">
											<span className="truncate font-medium text-sm">{plugin.name}</span>
											<span className="font-mono text-[11px] text-muted-foreground">
												{m.common_version_badge({ version: plugin.version })}
											</span>
										</div>
										<StatusBadge status={badge.status} label={badge.label} />
									</div>
									{plugin.error && (
										<p className="wrap-break-word rounded-md bg-destructive/10 px-2 py-1 font-mono text-[11px] text-destructive">
											{plugin.error}
										</p>
									)}
								</li>
							);
						})}
					</ul>
				</div>
			)}

			{catalogQuery.isLoading && <AppLoadingState label={m.setup_plugins_loading()} className="min-h-32" />}

			{!catalogQuery.isLoading && catalogQuery.isError && (
				<AppErrorState title={m.setup_plugins_failed_to_load()} error={catalogQuery.error} onRetry={() => detach(catalogQuery.refetch())} />
			)}

			{!(catalogQuery.isLoading || catalogQuery.isError) && available.length === 0 && (
				<AppEmptyState title={m.setup_plugins_empty_title()} description={m.setup_plugins_empty_desc()} className="min-h-32" />
			)}

			{!(catalogQuery.isLoading || catalogQuery.isError) && available.length > 0 && (
				<>
					<ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
						{available.map((entry) => {
							const isSelected = selectedIds.has(entryKey(entry));

							return (
								<li key={entryKey(entry)}>
									<button
										type="button"
										aria-pressed={isSelected}
										disabled={isBusy}
										onClick={() => toggleSelection(entry)}
										className={cn(
											"flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color,box-shadow]",
											isSelected
												? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
												: "border-border bg-card/60 hover:border-border/80 hover:bg-muted/40",
										)}
									>
										<span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
											{entry.iconUrl ? (
												<img src={entry.iconUrl} alt="" className="size-full object-contain p-1.5" loading="lazy" />
											) : (
												<Puzzle className="size-4" />
											)}
										</span>
										<span className="flex min-w-0 flex-1 flex-col gap-1">
											<span className="flex flex-wrap items-center gap-2">
												<span className="font-semibold text-sm">{entry.name}</span>
												<Badge variant="outline" className="font-mono text-[10px]">
													{m.common_version_badge({ version: entry.version })}
												</Badge>
												<Badge variant="secondary" className="font-normal text-[10px]">
													{pluginCatalogCategoryLabel(entry.category)}
												</Badge>
											</span>
											{entry.description && <span className="line-clamp-2 text-muted-foreground text-xs">{entry.description}</span>}
										</span>
									</button>
								</li>
							);
						})}
					</ul>

					<div className="flex flex-wrap items-center gap-3">
						<Button type="button" className="gap-2" disabled={isBusy || selectedIds.size === 0} onClick={installSelected}>
							<Download className="size-4" />
							{m.setup_plugins_install_selected()}
						</Button>
						<span className="text-muted-foreground text-xs">{m.setup_plugins_selected_count({ count: selectedIds.size })}</span>
					</div>
				</>
			)}

			<Button type="button" variant="outline" className="gap-2 self-start" disabled={isBusy} onClick={() => setIsUploadOpen(true)}>
				<Upload className="size-4" />
				{m.setup_plugins_upload()}
			</Button>

			<PluginUploadDialog
				open={isUploadOpen}
				onOpenChange={setIsUploadOpen}
				onInstall={(files) => detach(installArchive(files))}
				isBusy={isBusy}
			/>
			<PluginUploadProgress entries={archiveEntries} summary={archiveSummary} onClose={clearArchiveEntries} />
		</div>
	);
}
