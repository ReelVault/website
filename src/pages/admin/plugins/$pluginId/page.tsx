import { Link, useParams } from "@tanstack/react-router";
import { Puzzle, Sliders } from "lucide-react";
import { useAdminPlugins } from "@/client/hooks/use-admin-plugins";
import { resolvePluginText, usePluginUiManifest } from "@/client/hooks/use-plugin-ui";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { getPluginIcon } from "@/plugin-host/icons";
import { PluginSurface } from "@/plugin-host/surface";

function safeDecode(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

export default function PluginAdminPage() {
	const params = useParams({ from: "/admin/plugins/pages/$pluginId" });
	const pluginId = safeDecode(params.pluginId);
	const { plugins, pluginsQuery } = useAdminPlugins();
	const { data: manifest } = usePluginUiManifest();

	if (pluginsQuery.isLoading) {
		return <AppLoadingState label={m.admin_plugins_loading_view()} className="min-h-96" />;
	}

	const plugin = plugins.find((candidate) => candidate.id === pluginId);
	if (!plugin) {
		return <AppErrorState title={m.plugins_plugin_not_found_heading()} description={m.plugins_plugin_not_installed({ pluginId })} />;
	}

	if (plugin.state !== "enabled") {
		return (
			<AppErrorState
				title={m.admin_plugins_disabled_notice()}
				description={m.admin_plugins_disabled_with_name({ name: plugin.name, state: plugin.state })}
			/>
		);
	}

	const header = (
		<AdminPageHeader
			icon={Puzzle}
			eyebrow={m.admin_plugins_version_eyebrow({ version: plugin.version })}
			title={plugin.name}
			description={plugin.description ?? m.admin_plugins_admin_subpage_desc()}
			actions={
				<Button
					variant="outline"
					size="sm"
					nativeButton={false}
					render={<Link to="/admin/plugins/$id" params={{ id: encodeURIComponent(plugin.id) }} />}
					className="gap-1.5 text-xs"
				>
					<Sliders className="size-3.5" />
					{m.admin_plugins_settings_section()}
				</Button>
			}
		/>
	);

	// Admin-facing pages are those flagged adminOnly or advertised in the admin nav.
	const pluginDefaultLocale = manifest?.plugins[pluginId]?.defaultLocale;
	const adminPages = (manifest?.plugins[pluginId]?.pages ?? []).filter((page) => page.adminOnly === true || page.nav === "admin");

	if (adminPages.length === 0) {
		return (
			<div className="flex flex-col gap-6 text-foreground">
				{header}
				<AdminSection title={m.admin_plugins_subpage_heading()}>
					<AppEmptyState
						title={m.admin_plugins_no_native_view_heading()}
						description={m.admin_plugins_no_native_view_named({ name: plugin.name })}
					/>
				</AdminSection>
			</div>
		);
	}

	if (adminPages.length === 1) {
		const page = adminPages[0];

		return (
			<div className="flex flex-col gap-6 text-foreground">
				{header}
				{page ? (
					<PluginSurface pluginId={pluginId} tag={page.tag} schema={page.schema} page={page.id} className="min-h-[32rem] w-full" />
				) : null}
			</div>
		);
	}

	const first = adminPages[0];

	return (
		<div className="flex flex-col gap-6 text-foreground">
			{header}
			<Tabs defaultValue={first ? `${pluginId}:${first.id}` : undefined}>
				<TabsList className="w-full justify-start overflow-x-auto">
					{adminPages.map((page) => {
						const Icon = getPluginIcon(page.icon);

						return (
							<TabsTrigger key={page.id} value={`${pluginId}:${page.id}`} className="gap-1.5">
								<Icon className="size-3.5" aria-hidden="true" />
								{resolvePluginText(page.name, pluginDefaultLocale)}
							</TabsTrigger>
						);
					})}
				</TabsList>
				{adminPages.map((page) => (
					<TabsContent key={page.id} value={`${pluginId}:${page.id}`}>
						<PluginSurface pluginId={pluginId} tag={page.tag} schema={page.schema} page={page.id} className="min-h-[32rem] w-full" />
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
