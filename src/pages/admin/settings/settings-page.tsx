import { cn } from "cn";
import {
	Activity,
	Bookmark,
	Clapperboard,
	Cpu,
	Download,
	FolderSearch,
	Globe,
	Image as ImageIcon,
	RefreshCw,
	RotateCcw,
	Settings,
	Sliders,
	Tv,
	UserCheck,
} from "lucide-react";
import { lazy, Suspense, useState, ViewTransition } from "react";
import { useAdminSettings } from "@/client/hooks/use-admin-settings";
import { AppErrorState } from "@/components/app-states";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { runTransition } from "@/utils/view-transitions";
import { RemoteAccessCard } from "./components/remote-access-card";
import { SettingsGroupView } from "./components/settings-group-view";

const LazyPluginTabTriggers = lazy(async () => {
	const mod = await import("@/plugin-host/tab-host");

	return { default: mod.PluginTabTriggers };
});
const LazyPluginTabContents = lazy(async () => {
	const mod = await import("@/plugin-host/tab-host");

	return { default: mod.PluginTabContents };
});

export default function AdminSettingsPage() {
	const { settings, isLoading, isFetching, error, refetch, updateSettings, isUpdating, resetSettings, isResetting } = useAdminSettings();
	const [activeTab, setActiveTab] = useState("resources");

	const handleSave = (updates: Record<string, unknown>) => updateSettings(updates);
	const handleResetKeys = (keys: string[]) => resetSettings(keys);
	const handleResetAll = () => resetSettings();

	if (error) {
		return <AppErrorState error={error} onRetry={() => detach(refetch())} />;
	}

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={Settings}
				eyebrow={m.admin_settings_system_management()}
				title={m.admin_settings_heading()}
				description={m.admin_settings_transcoding_description()}
				actions={
					<div className="flex flex-wrap items-center gap-2">
						<ConfirmAction
							trigger={
								<Button
									variant="outline"
									size="sm"
									className="text-destructive hover:bg-destructive/10 hover:text-destructive"
									disabled={isResetting || isUpdating}
								>
									<RotateCcw className="size-4" />
									{m.admin_settings_restore_all()}
								</Button>
							}
							title={m.admin_settings_restore_all_confirm()}
							description={m.admin_settings_factory_reset_notice()}
							confirmLabel={m.admin_settings_reset_everything()}
							onConfirm={handleResetAll}
						/>

						<Button variant="outline" size="sm" disabled={isLoading || isFetching} onClick={() => detach(refetch())}>
							<RefreshCw className={cn("size-4", { "animate-spin": isFetching })} />
							{m.common_refresh()}
						</Button>
					</div>
				}
			/>

			{isLoading || !settings ? (
				<div className="flex h-64 items-center justify-center">
					<RefreshCw className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : (
				<Tabs
					value={activeTab}
					onValueChange={(value: string) => runTransition("tab", () => setActiveTab(value))}
					className="flex flex-col gap-6"
				>
					<TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
						<TabsTrigger value="resources" className="gap-2 text-xs">
							<Cpu className="size-3.5" />
							<span>{m.admin_settings_cpu_section()}</span>
						</TabsTrigger>
						<TabsTrigger value="streaming" className="gap-2 text-xs">
							<Tv className="size-3.5" />
							<span>{m.admin_settings_tab_streaming()}</span>
						</TabsTrigger>
						<TabsTrigger value="scanning" className="gap-2 text-xs">
							<FolderSearch className="size-3.5" />
							<span>{m.admin_settings_tab_scanning()}</span>
						</TabsTrigger>
						<TabsTrigger value="downloads" className="gap-2 text-xs">
							<Download className="size-3.5" />
							<span>{m.admin_settings_tab_downloads()}</span>
						</TabsTrigger>
						<TabsTrigger value="markers" className="gap-2 text-xs">
							<Bookmark className="size-3.5" />
							<span>{m.admin_settings_tab_markers()}</span>
						</TabsTrigger>
						<TabsTrigger value="trickplay" className="gap-2 text-xs">
							<Clapperboard className="size-3.5" />
							<span>{m.admin_settings_tab_trickplay()}</span>
						</TabsTrigger>
						<TabsTrigger value="images" className="gap-2 text-xs">
							<ImageIcon className="size-3.5" />
							<span>{m.admin_settings_tab_images()}</span>
						</TabsTrigger>
						<TabsTrigger value="workers" className="gap-2 text-xs">
							<Activity className="size-3.5" />
							<span>{m.admin_settings_tab_workers()}</span>
						</TabsTrigger>
						<TabsTrigger value="playback_defaults" className="gap-2 text-xs">
							<UserCheck className="size-3.5" />
							<span>{m.admin_settings_tab_player()}</span>
						</TabsTrigger>
						<TabsTrigger value="system" className="gap-2 text-xs">
							<Sliders className="size-3.5" />
							<span>{m.admin_settings_tab_system()}</span>
						</TabsTrigger>
						<TabsTrigger value="network" className="gap-2 text-xs">
							<Globe className="size-3.5" />
							<span>{m.admin_settings_network()}</span>
						</TabsTrigger>
						{/* PLUGIN TABS (host settings) — render nothing when there is no contribution */}
						<Suspense fallback={null}>
							<LazyPluginTabTriggers host="settings" />
						</Suspense>
					</TabsList>

					{/* Panels — animated only on tab change (addTransitionType "tab"). */}
					<ViewTransition update={{ default: "none", tab: "auto" }}>
						<TabsContent value="resources">
							<AdminSection title={m.admin_settings_smart_resources()} description={m.admin_settings_cpu_profile_description()}>
								<SettingsGroupView
									items={settings.resources}
									onSave={handleSave}
									onResetKeys={handleResetKeys}
									isSaving={isUpdating}
									isResetting={isResetting}
								/>
							</AdminSection>
						</TabsContent>

						<TabsContent value="streaming">
							<AdminSection title={m.admin_settings_streaming_hwaccel()} description={m.admin_settings_transcoding_engine_description()}>
								<SettingsGroupView
									items={settings.streaming}
									onSave={handleSave}
									onResetKeys={handleResetKeys}
									isSaving={isUpdating}
									isResetting={isResetting}
								/>
							</AdminSection>
						</TabsContent>

						<TabsContent value="scanning">
							<AdminSection title={m.admin_settings_scanning_formats()} description={m.admin_settings_indexing_description()}>
								<SettingsGroupView
									items={settings.scanning}
									onSave={handleSave}
									onResetKeys={handleResetKeys}
									isSaving={isUpdating}
									isResetting={isResetting}
								/>
							</AdminSection>
						</TabsContent>

						<TabsContent value="downloads">
							<AdminSection title={m.admin_settings_downloads_section()} description={m.admin_settings_downloads_description()}>
								<SettingsGroupView
									items={settings.downloads}
									onSave={handleSave}
									onResetKeys={handleResetKeys}
									isSaving={isUpdating}
									isResetting={isResetting}
								/>
							</AdminSection>
						</TabsContent>

						<TabsContent value="markers">
							<AdminSection title={m.admin_settings_markers_section()} description={m.admin_settings_markers_description()}>
								<SettingsGroupView
									items={settings.markers}
									onSave={handleSave}
									onResetKeys={handleResetKeys}
									isSaving={isUpdating}
									isResetting={isResetting}
								/>
							</AdminSection>
						</TabsContent>

						<TabsContent value="trickplay">
							<AdminSection title={m.admin_settings_trickplay_section()} description={m.admin_settings_trickplay_description()}>
								<SettingsGroupView
									items={settings.trickplay}
									onSave={handleSave}
									onResetKeys={handleResetKeys}
									isSaving={isUpdating}
									isResetting={isResetting}
								/>
							</AdminSection>
						</TabsContent>

						<TabsContent value="images">
							<AdminSection title={m.admin_settings_images_section()} description={m.admin_settings_webp_description()}>
								<SettingsGroupView
									items={settings.images}
									onSave={handleSave}
									onResetKeys={handleResetKeys}
									isSaving={isUpdating}
									isResetting={isResetting}
								/>
							</AdminSection>
						</TabsContent>

						<TabsContent value="workers">
							<AdminSection title={m.admin_settings_background_queues()} description={m.admin_settings_scheduler_description()}>
								<SettingsGroupView
									items={settings.workers}
									onSave={handleSave}
									onResetKeys={handleResetKeys}
									isSaving={isUpdating}
									isResetting={isResetting}
								/>
							</AdminSection>
						</TabsContent>

						<TabsContent value="playback_defaults">
							<AdminSection title={m.admin_settings_default_player_prefs()} description={m.admin_settings_new_profile_defaults()}>
								<SettingsGroupView
									items={settings.playback_defaults}
									onSave={handleSave}
									onResetKeys={handleResetKeys}
									isSaving={isUpdating}
									isResetting={isResetting}
								/>
							</AdminSection>
						</TabsContent>

						<TabsContent value="system">
							<AdminSection title={m.admin_settings_advanced_section()} description={m.admin_settings_cache_description()}>
								<SettingsGroupView
									items={settings.system}
									onSave={handleSave}
									onResetKeys={handleResetKeys}
									isSaving={isUpdating}
									isResetting={isResetting}
								/>
							</AdminSection>
						</TabsContent>

						<TabsContent value="network">
							<AdminSection title={m.admin_settings_network_section()} description={m.admin_settings_domains_description()}>
								<SettingsGroupView
									items={settings.network}
									onSave={handleSave}
									onResetKeys={handleResetKeys}
									isSaving={isUpdating}
									isResetting={isResetting}
								/>
							</AdminSection>
							<AdminSection title={m.admin_settings_remote_access()} description={m.admin_settings_remote_ready_hint()}>
								<RemoteAccessCard />
							</AdminSection>
						</TabsContent>

						<Suspense fallback={null}>
							<LazyPluginTabContents host="settings" />
						</Suspense>
					</ViewTransition>
				</Tabs>
			)}
		</div>
	);
}
