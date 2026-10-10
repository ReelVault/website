import type { PluginCatalogEntry } from "@reelvault/sdk";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { usePluginCatalog } from "@/client/hooks/use-plugin-catalog";
import { AppEmptyState, AppLoadingState } from "@/components/app-states";
import { usePageTitle } from "@/hooks/use-page-title";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { PluginCatalogDetail } from "../components/plugin-catalog-detail";

export default function PluginCatalogPage() {
	const { id } = useParams({ from: "/admin/plugins/catalog/$id" });
	const navigate = useNavigate();
	const { catalog, catalogQuery, installPlugin, uninstallPlugin, isInstalling, isInstallingArchive, isUninstalling } = usePluginCatalog();
	const entry = catalog.find((item) => item.id === id);
	const isBusy = isInstalling || isInstallingArchive || isUninstalling;

	usePageTitle(entry?.name ?? m.plugins_plugin_not_found_heading());

	// Install and uninstall return to the plugin list, which shows the new state.
	const goToPlugins = () => detach(navigate({ to: "/admin/plugins" }));

	const handleInstall = (target: PluginCatalogEntry, version?: string) => {
		detach(
			(async () => {
				await installPlugin({ repositoryId: target.repositoryId, pluginId: target.id, ...(version ? { version } : {}) });
				goToPlugins();
			})(),
		);
	};

	const handleUninstall = (pluginId: string) => {
		detach(
			(async () => {
				await uninstallPlugin(pluginId);
				goToPlugins();
			})(),
		);
	};

	if (catalogQuery.isPending) return <AppLoadingState />;

	return (
		<main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
			<Link
				to="/admin/plugins"
				className="inline-flex min-h-11 w-fit items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				{m.common_back()}
			</Link>

			{entry ? (
				<PluginCatalogDetail entry={entry} isBusy={isBusy} onInstall={handleInstall} onUninstall={handleUninstall} />
			) : (
				<AppEmptyState title={m.plugins_plugin_not_found_heading()} />
			)}
		</main>
	);
}
