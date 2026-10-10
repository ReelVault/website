import type { PluginCatalogEntry } from "@reelvault/sdk";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { cn } from "cn";
import { Puzzle, RefreshCw, Store, Upload } from "lucide-react";
import { useState } from "react";
import { useAdminPlugins } from "@/client/hooks/use-admin-plugins";
import { usePluginCatalog } from "@/client/hooks/use-plugin-catalog";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSearch, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { PluginCard } from "./components/plugin-card";
import { PluginCatalogCard, pluginCatalogCategoryLabel } from "./components/plugin-catalog-card";
import { PluginRepositoriesDialog } from "./components/plugin-repositories-dialog";
import { PluginUploadDialog } from "./components/plugin-upload-dialog";
import { PluginUploadProgress } from "./components/plugin-upload-progress";

type CatalogView = "available" | "installed";
type CategoryFilter = "all" | "metadata" | "subtitles" | "automation" | "integrations" | "ui" | "other";
type ConcreteCategory = Exclude<CategoryFilter, "all">;

const CATEGORY_FILTERS: readonly ConcreteCategory[] = ["metadata", "subtitles", "automation", "integrations", "ui", "other"];
const CONCRETE_CATEGORY_SET: ReadonlySet<string> = new Set<string>(CATEGORY_FILTERS);

function isConcreteCategory(value: unknown): value is ConcreteCategory {
	return typeof value === "string" && CONCRETE_CATEGORY_SET.has(value);
}

function catalogStatusRank(status: PluginCatalogEntry["status"]): 0 | 1 | 2 {
	if (status === "update-available") return 0;

	if (status === "available") return 1;

	return 2;
}

export default function AdminPluginsPage() {
	const search = useSearch({ from: "/admin/plugins/" });
	const navigate = useNavigate({ from: "/admin/plugins/" });
	const view: CatalogView = search.view === "installed" ? "installed" : "available";
	const category: CategoryFilter = isConcreteCategory(search.category) ? search.category : "all";

	const {
		plugins,
		pluginsQuery,
		reloadAll,
		enablePlugin,
		disablePlugin,
		reloadPlugin,
		setPluginCsp,
		setPluginsEnabled,
		isBulkUpdating,
		setPluginPinned,
		isReloadingAll,
		isEnabling,
		isDisabling,
		isReloading,
	} = useAdminPlugins();
	// Installed plugins picked for one bulk enable or disable.
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const toggleSelected = (pluginId: string) => {
		setSelectedIds((previous) => {
			const next = new Set(previous);
			if (next.has(pluginId)) next.delete(pluginId);
			else next.add(pluginId);
			return next;
		});
	};
	const applyToSelected = (enabled: boolean) => {
		const pluginIds = [...selectedIds];
		setSelectedIds(new Set());
		detach(setPluginsEnabled({ pluginIds, enabled }));
	};

	const {
		catalog,
		catalogQuery,
		unavailableRepositories,
		repositories,
		installArchive,
		archiveEntries,
		archiveSummary,
		isInstallingArchive,
		clearArchiveEntries,
		uninstallPlugin,
		createRepository,
		updateRepository,
		deleteRepository,
		refreshRepository,
		isInstalling,
		isUninstalling,
		isCreatingRepository,
		isUpdatingRepository,
		isDeletingRepository,
		isRefreshingRepository,
	} = usePluginCatalog();

	const [searchQuery, setSearchQuery] = useState("");
	const [repositoriesOpen, setRepositoriesOpen] = useState(false);
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

	const isCatalogBusy =
		isInstalling ||
		isInstallingArchive ||
		isUninstalling ||
		isCreatingRepository ||
		isUpdatingRepository ||
		isDeletingRepository ||
		isRefreshingRepository;
	const isBusy = isCatalogBusy || isReloadingAll || isEnabling || isDisabling || isReloading;

	const availableCount = catalog.filter((entry) => entry.status !== "installed").length;
	// The choices count what the current view lists: installed plugins in that view, catalog entries otherwise.
	const categoriesWithCounts = CATEGORY_FILTERS.map((value) => ({
		value,
		label: pluginCatalogCategoryLabel(value),
		count:
			view === "installed"
				? plugins.filter((plugin) => catalog.find((entry) => entry.id === plugin.id)?.category === value).length
				: catalog.filter((entry) => entry.category === value).length,
	})).filter((entry) => entry.count > 0 || entry.value === category);

	let entries = catalog;
	if (view === "available") entries = entries.filter((entry) => entry.status !== "installed");

	if (category !== "all") entries = entries.filter((entry) => entry.category === category);

	const query = searchQuery.trim().toLowerCase();
	if (query.length > 0) {
		entries = entries.filter((entry) => `${entry.name} ${entry.description ?? ""} ${entry.id}`.toLowerCase().includes(query));
	}

	const filteredCatalog = entries.toSorted(
		(left, right) => catalogStatusRank(left.status) - catalogStatusRank(right.status) || left.name.localeCompare(right.name),
	);

	// Search and category narrow the installed list too (category comes from the catalog entry).
	const installedPlugins = plugins.filter((plugin) => {
		if (category !== "all" && catalog.find((entry) => entry.id === plugin.id)?.category !== category) return false;

		return query.length === 0 || `${plugin.name} ${plugin.description ?? ""} ${plugin.id}`.toLowerCase().includes(query);
	});

	const setView = (next: CatalogView) => {
		detach(navigate({ search: (previous: Record<string, unknown>) => ({ ...previous, view: next === "available" ? undefined : next }) }));
	};
	const setCategory = (next: CategoryFilter) => {
		detach(navigate({ search: (previous: Record<string, unknown>) => ({ ...previous, category: next === "all" ? undefined : next }) }));
	};

	// A plugin's details are a page of their own; the list keeps its filters in the address.
	const openCatalogDetails = (entry: PluginCatalogEntry) => {
		detach(navigate({ to: "/admin/plugins/catalog/$id", params: { id: entry.id } }));
	};

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={Puzzle}
				eyebrow={m.plugins_requests_server_extensions()}
				title={m.admin_plugins_heading()}
				count={view === "installed" ? installedPlugins.length : filteredCatalog.length}
				description={m.admin_plugins_manage_description()}
				actions={
					<>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setUploadDialogOpen(true)}
							disabled={isBusy}
							className="gap-2 font-medium text-xs"
						>
							<Upload className={cn("size-3.5", { "animate-pulse": isInstallingArchive })} />
							{m.admin_plugins_upload_install()}
						</Button>
						<Button variant="outline" size="sm" onClick={() => setRepositoriesOpen(true)} className="gap-2 font-medium text-xs">
							<Store className="size-3.5" />
							{m.admin_plugins_repositories_manage()}
						</Button>
						<Button variant="outline" size="sm" onClick={() => detach(reloadAll())} disabled={isBusy} className="gap-2 font-medium text-xs">
							<RefreshCw className={cn("size-3.5", { "animate-spin": isReloadingAll })} />
							{m.admin_plugins_reload_all()}
						</Button>
					</>
				}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<ToggleGroup
					multiple={false}
					value={[view]}
					onValueChange={(value) => {
						const selected = value[0];
						if (selected === "available" || selected === "installed") setView(selected);
					}}
					variant="outline"
					size="sm"
					className="justify-start"
				>
					<ToggleGroupItem value="available" className="gap-1.5 px-3">
						<span>{m.admin_plugins_view_available()}</span>
						<span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-muted-foreground text-xs">{availableCount}</span>
					</ToggleGroupItem>
					<ToggleGroupItem value="installed" className="gap-1.5 px-3">
						<span>{m.admin_plugins_view_installed()}</span>
						<span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-muted-foreground text-xs">{plugins.length}</span>
					</ToggleGroupItem>
				</ToggleGroup>

				<AdminSearch
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder={m.admin_plugins_catalog_search_placeholder()}
					className="w-full sm:max-w-xs"
				/>
			</div>

			<ToggleGroup
				multiple={false}
				value={[category]}
				onValueChange={(value) => {
					const selected = value[0];
					if (selected === "all" || isConcreteCategory(selected)) setCategory(selected);
				}}
				variant="outline"
				size="sm"
				className="flex-wrap justify-start"
			>
				<ToggleGroupItem value="all" className="gap-1.5 px-3">
					{m.common_all()}
				</ToggleGroupItem>
				{categoriesWithCounts.map((entry) => (
					<ToggleGroupItem key={entry.value} value={entry.value} className="gap-1.5 px-3">
						<span>{entry.label}</span>
						<span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-muted-foreground text-xs">{entry.count}</span>
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			{view === "installed" ? (
				<AdminSection title={m.admin_plugins_installed_section()} description={m.admin_plugins_isolation_notice()}>
					{pluginsQuery.isLoading && <AppLoadingState label={m.admin_plugins_loading()} className="min-h-40" />}
					{pluginsQuery.isError && (
						<AppErrorState
							title={m.admin_plugins_failed_to_fetch_list()}
							error={pluginsQuery.error}
							onRetry={() => detach(pluginsQuery.refetch())}
						/>
					)}

					{!(pluginsQuery.isLoading || pluginsQuery.isError) && plugins.length === 0 && (
						<AppEmptyState title={m.admin_plugins_none_installed()} description={m.admin_plugins_install_hint()} />
					)}

					{!(pluginsQuery.isLoading || pluginsQuery.isError) && plugins.length > 0 && installedPlugins.length === 0 && (
						<AppEmptyState title={m.admin_plugins_none_installed()} description={m.admin_plugins_catalog_empty_filter()} />
					)}

					{!(pluginsQuery.isLoading || pluginsQuery.isError) && installedPlugins.length > 0 && (
						<>
							{selectedIds.size > 0 && (
								<div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/80 bg-card p-3 text-xs">
									<span className="font-medium">{m.admin_plugins_bulk_selected({ count: selectedIds.size })}</span>
									<Button size="sm" disabled={isBulkUpdating} onClick={() => applyToSelected(true)} className="text-xs">
										{m.admin_plugins_bulk_enable()}
									</Button>
									<Button variant="outline" size="sm" disabled={isBulkUpdating} onClick={() => applyToSelected(false)} className="text-xs">
										{m.admin_plugins_bulk_disable()}
									</Button>
									<Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="text-xs">
										{m.admin_plugins_bulk_clear()}
									</Button>
								</div>
							)}
							<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
								{installedPlugins.map((plugin) => {
									const catalogEntry = catalog.find((entry) => entry.id === plugin.id);

									return (
										<PluginCard
											key={plugin.id}
											plugin={plugin}
											isBusy={isBusy}
											onOpenDetails={catalogEntry ? () => openCatalogDetails(catalogEntry) : undefined}
											onUninstall={catalogEntry ? undefined : () => detach(uninstallPlugin(plugin.id))}
											onEnable={(id) => detach(enablePlugin(id))}
											onDisable={(id) => detach(disablePlugin(id))}
											onReload={(id) => detach(reloadPlugin(id))}
											onSetCsp={(id, enabled) => detach(setPluginCsp({ pluginId: id, enabled }))}
											onSetPinned={(id, pinned) => detach(setPluginPinned({ pluginId: id, pinned }))}
											selected={selectedIds.has(plugin.id)}
											onToggleSelect={() => toggleSelected(plugin.id)}
										/>
									);
								})}
							</div>
						</>
					)}
				</AdminSection>
			) : (
				<AdminSection title={m.admin_plugins_catalog_section()} description={m.admin_plugins_catalog_section_description()}>
					{catalogQuery.isLoading && <AppLoadingState label={m.admin_plugins_loading()} className="min-h-40" />}
					{!catalogQuery.isLoading && unavailableRepositories.length > 0 && (
						<div role="alert" className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-warning text-xs">
							{m.admin_plugins_repositories_unavailable({
								names: unavailableRepositories.map((repository) => repository.repositoryName).join(", "),
							})}
						</div>
					)}
					{catalogQuery.isError && (
						<AppErrorState
							title={m.admin_plugins_catalog_failed_to_fetch()}
							error={catalogQuery.error}
							onRetry={() => detach(catalogQuery.refetch())}
						/>
					)}

					{!(catalogQuery.isLoading || catalogQuery.isError) && filteredCatalog.length === 0 && (
						<AppEmptyState
							title={m.admin_plugins_catalog_empty()}
							description={
								repositories.length === 0 ? m.admin_plugins_catalog_empty_add_repository() : m.admin_plugins_catalog_empty_filter()
							}
						/>
					)}

					{!(catalogQuery.isLoading || catalogQuery.isError) && filteredCatalog.length > 0 && (
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
							{filteredCatalog.map((entry) => (
								<PluginCatalogCard
									key={`${entry.repositoryId}:${entry.id}`}
									entry={entry}
									isBusy={isBusy}
									onOpenDetails={openCatalogDetails}
								/>
							))}
						</div>
					)}
				</AdminSection>
			)}

			<PluginRepositoriesDialog
				open={repositoriesOpen}
				onOpenChange={setRepositoriesOpen}
				repositories={repositories}
				isBusy={isCatalogBusy}
				onCreate={createRepository}
				onUpdate={updateRepository}
				onDelete={deleteRepository}
				onRefresh={refreshRepository}
			/>

			<PluginUploadDialog
				open={uploadDialogOpen}
				onOpenChange={setUploadDialogOpen}
				onInstall={(files) => detach(installArchive(files))}
				isBusy={isCatalogBusy}
			/>

			<PluginUploadProgress entries={archiveEntries} summary={archiveSummary} onClose={clearArchiveEntries} />
		</div>
	);
}
