import { useNavigate, useSearch } from "@tanstack/react-router";
import { cn } from "cn";
import { Puzzle, RefreshCw, Store, Upload } from "lucide-react";
import { useState } from "react";
import type { PluginCatalogEntry } from "reelvault-sdk";
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
import { PluginCatalogDetailDialog } from "./components/plugin-catalog-detail-dialog";
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
		isReloadingAll,
		isEnabling,
		isDisabling,
		isReloading,
	} = useAdminPlugins();

	const {
		catalog,
		catalogQuery,
		repositories,
		installPlugin,
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
	const [selectedEntry, setSelectedEntry] = useState<PluginCatalogEntry | null>(null);

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
	const categoriesWithCounts = CATEGORY_FILTERS.map((value) => ({
		value,
		label: pluginCatalogCategoryLabel(value),
		count: catalog.filter((entry) => entry.category === value).length,
	})).filter((entry) => entry.count > 0);

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

	const setView = (next: CatalogView) => {
		detach(navigate({ search: (previous: Record<string, unknown>) => ({ ...previous, view: next === "available" ? undefined : next }) }));
	};
	const setCategory = (next: CategoryFilter) => {
		detach(navigate({ search: (previous: Record<string, unknown>) => ({ ...previous, category: next === "all" ? undefined : next }) }));
	};

	const handleInstall = (entry: PluginCatalogEntry, version?: string) => {
		detach(
			(async () => {
				await installPlugin({ repositoryId: entry.repositoryId, pluginId: entry.id, ...(version ? { version } : {}) });
				setSelectedEntry(null);
			})(),
		);
	};

	const handleUninstall = (pluginId: string) => {
		detach(
			(async () => {
				await uninstallPlugin(pluginId);
				setSelectedEntry(null);
			})(),
		);
	};

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={Puzzle}
				eyebrow={m.plugins_requests_server_extensions()}
				title={m.admin_plugins_heading()}
				count={view === "installed" ? plugins.length : filteredCatalog.length}
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
						<span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-[11px] text-muted-foreground">{availableCount}</span>
					</ToggleGroupItem>
					<ToggleGroupItem value="installed" className="gap-1.5 px-3">
						<span>{m.admin_plugins_view_installed()}</span>
						<span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-[11px] text-muted-foreground">{plugins.length}</span>
					</ToggleGroupItem>
				</ToggleGroup>

				<AdminSearch
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder={m.admin_plugins_catalog_search_placeholder()}
					className="w-full sm:max-w-xs"
				/>
			</div>

			{view === "available" && (
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
							<span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-[11px] text-muted-foreground">{entry.count}</span>
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			)}

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

					{!(pluginsQuery.isLoading || pluginsQuery.isError) && plugins.length > 0 && (
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
							{plugins.map((plugin) => {
								const catalogEntry = catalog.find((entry) => entry.id === plugin.id);
								return (
									<PluginCard
										key={plugin.id}
										plugin={plugin}
										isBusy={isBusy}
										onOpenDetails={catalogEntry ? () => setSelectedEntry(catalogEntry) : undefined}
										onEnable={(id) => detach(enablePlugin(id))}
										onDisable={(id) => detach(disablePlugin(id))}
										onReload={(id) => detach(reloadPlugin(id))}
									/>
								);
							})}
						</div>
					)}
				</AdminSection>
			) : (
				<AdminSection title={m.admin_plugins_catalog_section()} description={m.admin_plugins_catalog_section_description()}>
					{catalogQuery.isLoading && <AppLoadingState label={m.admin_plugins_loading()} className="min-h-40" />}
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
									onOpenDetails={setSelectedEntry}
								/>
							))}
						</div>
					)}
				</AdminSection>
			)}

			<PluginCatalogDetailDialog
				entry={selectedEntry}
				isBusy={isCatalogBusy}
				onClose={() => setSelectedEntry(null)}
				onInstall={handleInstall}
				onUninstall={handleUninstall}
			/>

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
