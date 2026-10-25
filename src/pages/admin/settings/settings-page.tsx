import type { ImportSystemSettings } from "@reelvault/sdk";
import { useNavigate, useSearch } from "@tanstack/react-router";
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
	Upload,
	UserCheck,
} from "lucide-react";
import { type ChangeEvent, lazy, Suspense, useRef, useState, ViewTransition } from "react";
import { useAdminSettings } from "@/client/hooks/use-admin-settings";
import { AppErrorState } from "@/components/app-states";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSearch, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
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

/** Compact pills in the mobile scroll row, comfortable full-width rows in the desktop nav column. */
const SETTINGS_TABS = [
	"resources",
	"workers",
	"streaming",
	"scanning",
	"images",
	"markers",
	"trickplay",
	"playback_defaults",
	"downloads",
	"network",
	"system",
] as const;
const DEFAULT_SETTINGS_TAB = "resources";

/** A file this page may import: the settings export, version 1, with its settings object. */
function isSettingsExport(value: unknown): value is ImportSystemSettings {
	if (typeof value !== "object" || value === null) return false;

	return (
		Reflect.get(value, "format") === "reelvault.settings" &&
		Reflect.get(value, "formatVersion") === 1 &&
		typeof Reflect.get(value, "settings") === "object"
	);
}

export default function AdminSettingsPage() {
	const {
		settings,
		isLoading,
		isFetching,
		error,
		refetch,
		updateSettings,
		isUpdating,
		resetSettings,
		isResetting,
		exportSettings,
		importSettings,
		isImporting,
	} = useAdminSettings();
	const importInputRef = useRef<HTMLInputElement>(null);
	const { tab } = useSearch({ from: "/admin/settings" });
	const navigate = useNavigate({ from: "/admin/settings" });
	// The query is transient UI state: it filters whichever section is open and survives tab switches.
	const [searchQuery, setSearchQuery] = useState("");
	const activeTab = SETTINGS_TABS.find((candidate) => candidate === tab) ?? DEFAULT_SETTINGS_TAB;
	const setActiveTab = (next: string) => {
		detach(navigate({ search: (prev) => ({ ...prev, tab: next === DEFAULT_SETTINGS_TAB ? undefined : next }), replace: true }));
	};

	const handleSave = (updates: Record<string, unknown>) => updateSettings(updates);
	const handleResetKeys = (keys: string[]) => resetSettings(keys);
	const handleResetAll = () => resetSettings();

	const handleExport = async () => {
		try {
			const exported = await exportSettings();
			const url = URL.createObjectURL(new Blob([`${JSON.stringify(exported, null, 2)}\n`], { type: "application/json" }));
			const link = document.createElement("a");
			link.href = url;
			link.download = "reelvault-settings.json";
			link.click();
			URL.revokeObjectURL(url);
		} catch (exportError) {
			toastError(m.toast_settings_export_error(), exportError);
		}
	};

	const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		let parsed: unknown;
		try {
			parsed = JSON.parse(await file.text());
		} catch {
			toast.error(m.admin_settings_import_invalid());

			return;
		}
		if (!isSettingsExport(parsed)) {
			toast.error(m.admin_settings_import_invalid());

			return;
		}

		try {
			await importSettings(parsed);
		} catch {
			// Toast is handled by hook
		}
	};

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
						<AdminSearch
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder={m.admin_settings_search_placeholder()}
							className="w-full sm:max-w-xs"
						/>
						<Button variant="outline" size="sm" disabled={isImporting} onClick={() => importInputRef.current?.click()}>
							<Upload className="size-4" />
							{m.admin_settings_import()}
						</Button>
						<Button variant="outline" size="sm" onClick={() => detach(handleExport)}>
							<Download className="size-4" />
							{m.admin_settings_export()}
						</Button>
						<input
							ref={importInputRef}
							type="file"
							accept="application/json,.json"
							className="hidden"
							onChange={(event) => detach(() => handleImportFile(event))}
						/>
						<ConfirmAction
							trigger={
								<Button variant="destructive-outline" size="sm" disabled={isResetting || isUpdating}>
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
					<RefreshCw className="text-muted-foreground size-6 animate-spin" />
				</div>
			) : (
				<Tabs
					value={activeTab}
					orientation="vertical"
					onValueChange={(value: string) => runTransition("tab", () => setActiveTab(value))}
					className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8"
				>
					<TabsList size="lg" className="max-w-full lg:sticky lg:top-20 lg:w-56 lg:shrink-0 lg:self-start">
						<TabsTrigger value="resources" size="comfortable">
							<Cpu className="size-3.5" />
							<span>{m.admin_settings_cpu_section()}</span>
						</TabsTrigger>
						<TabsTrigger value="workers" size="comfortable">
							<Activity className="size-3.5" />
							<span>{m.admin_settings_tab_workers()}</span>
						</TabsTrigger>
						<TabsTrigger value="streaming" size="comfortable">
							<Tv className="size-3.5" />
							<span>{m.admin_settings_tab_streaming()}</span>
						</TabsTrigger>
						<TabsTrigger value="scanning" size="comfortable">
							<FolderSearch className="size-3.5" />
							<span>{m.admin_settings_tab_scanning()}</span>
						</TabsTrigger>
						<TabsTrigger value="images" size="comfortable">
							<ImageIcon className="size-3.5" />
							<span>{m.admin_settings_tab_images()}</span>
						</TabsTrigger>
						<TabsTrigger value="markers" size="comfortable">
							<Bookmark className="size-3.5" />
							<span>{m.admin_settings_tab_markers()}</span>
						</TabsTrigger>
						<TabsTrigger value="trickplay" size="comfortable">
							<Clapperboard className="size-3.5" />
							<span>{m.admin_settings_tab_trickplay()}</span>
						</TabsTrigger>
						<TabsTrigger value="playback_defaults" size="comfortable">
							<UserCheck className="size-3.5" />
							<span>{m.admin_settings_tab_player()}</span>
						</TabsTrigger>
						<TabsTrigger value="downloads" size="comfortable">
							<Download className="size-3.5" />
							<span>{m.admin_settings_tab_downloads()}</span>
						</TabsTrigger>
						<TabsTrigger value="network" size="comfortable">
							<Globe className="size-3.5" />
							<span>{m.admin_settings_network()}</span>
						</TabsTrigger>
						<TabsTrigger value="system" size="comfortable">
							<Sliders className="size-3.5" />
							<span>{m.admin_settings_tab_system()}</span>
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
									searchQuery={searchQuery}
									items={settings.resources}
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
									searchQuery={searchQuery}
									items={settings.workers}
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
									searchQuery={searchQuery}
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
									searchQuery={searchQuery}
									items={settings.scanning}
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
									searchQuery={searchQuery}
									items={settings.images}
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
									searchQuery={searchQuery}
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
									searchQuery={searchQuery}
									items={settings.trickplay}
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
									searchQuery={searchQuery}
									items={settings.playback_defaults}
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
									searchQuery={searchQuery}
									items={settings.downloads}
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
									searchQuery={searchQuery}
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

						<TabsContent value="system">
							<AdminSection title={m.admin_settings_advanced_section()} description={m.admin_settings_cache_description()}>
								<SettingsGroupView
									searchQuery={searchQuery}
									items={settings.system}
									onSave={handleSave}
									onResetKeys={handleResetKeys}
									isSaving={isUpdating}
									isResetting={isResetting}
								/>
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
