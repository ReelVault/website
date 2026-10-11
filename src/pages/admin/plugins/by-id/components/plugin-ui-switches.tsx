import type { PluginUiContribution, PluginUiSurfaceKind } from "@reelvault/sdk";
import { Eye } from "lucide-react";
import { useAdminPluginUi } from "@/client/hooks/use-admin-plugin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { detach } from "@/lib/detach";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

const SURFACE_ORDER: readonly PluginUiSurfaceKind[] = ["page", "dialog", "tab", "slot", "searchProvider", "playbackPreRoll"];

const SURFACE_LABELS: Record<PluginUiSurfaceKind, () => string> = {
	page: () => m.admin_plugins_ui_surface_page(),
	dialog: () => m.admin_plugins_ui_surface_dialog(),
	tab: () => m.admin_plugins_ui_surface_tab(),
	slot: () => m.admin_plugins_ui_surface_slot(),
	searchProvider: () => m.admin_plugins_ui_surface_search(),
	playbackPreRoll: () => m.admin_plugins_ui_surface_pre_roll(),
};

const surfaceLabel = (surface: PluginUiSurfaceKind): string => SURFACE_LABELS[surface]();

/** Switches for the parts of a plugin's interface; every change is saved immediately. */
export function PluginUiSwitches({ pluginId }: { pluginId: string }) {
	const { settings, update, reset, isSaving } = useAdminPluginUi(pluginId);
	if (!settings || settings.contributions.length === 0) return null;

	const disabledKeys = settings.contributions.filter((item) => !item.enabled).map((item) => item.key);
	const save = (enabled: boolean, nextDisabledKeys: string[]) => detach(update({ enabled, disabledKeys: nextDisabledKeys }));
	const toggle = (item: PluginUiContribution, enabled: boolean) =>
		save(settings.enabled, enabled ? disabledKeys.filter((key) => key !== item.key) : [...disabledKeys, item.key]);
	const isCustomized = !settings.enabled || disabledKeys.length > 0;

	return (
		<AdminSection
			title={m.admin_plugins_ui_heading()}
			description={m.admin_plugins_ui_description()}
			actions={
				isCustomized ? (
					<Button variant="ghost" size="sm" disabled={isSaving} onClick={() => detach(reset)}>
						<Eye className="size-3.5" />
						{m.admin_plugins_ui_show_all()}
					</Button>
				) : undefined
			}
		>
			<div className="flex flex-col gap-5">
				<div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/40 p-3">
					<div>
						<p className="font-medium text-sm">{m.admin_plugins_ui_master()}</p>
						<p className="text-muted-foreground text-xs">{m.admin_plugins_ui_master_desc()}</p>
					</div>
					<Switch
						checked={settings.enabled}
						disabled={isSaving}
						onCheckedChange={(enabled) => save(enabled, disabledKeys)}
						aria-label={m.admin_plugins_ui_master()}
					/>
				</div>

				{SURFACE_ORDER.map((surface) => {
					const items = settings.contributions.filter((item) => item.surface === surface);
					if (items.length === 0) return null;

					return (
						<section key={surface} className="flex flex-col gap-1">
							<h3 className="px-1 font-bold text-muted-foreground text-xs">{surfaceLabel(surface)}</h3>
							{items.map((item) => (
								<div key={item.key} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-accent/40">
									<div className="flex min-w-0 items-center gap-2">
										<span className="truncate text-sm">
											{surface === "searchProvider" || surface === "playbackPreRoll" ? surfaceLabel(surface) : item.label}
										</span>
										{item.adminOnly && <Badge variant="outline">{m.admin_plugins_ui_admin_only()}</Badge>}
									</div>
									<Switch
										checked={item.enabled}
										disabled={isSaving || !settings.enabled}
										onCheckedChange={(enabled) => toggle(item, enabled)}
										aria-label={item.label}
									/>
								</div>
							))}
						</section>
					);
				})}
			</div>
		</AdminSection>
	);
}
