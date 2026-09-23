import type { PluginSlotAction, PluginSlotName, PluginUiPlayerContext } from "@reelvault/sdk/plugin";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { resolvePluginText, usePluginSlots, usePluginUiManifest } from "@/client/hooks/use-plugin-ui";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { detach } from "@/lib/detach";
import { getPluginIcon } from "./icons";
import { usePluginDialogController } from "./plugin-dialog-context";
import { PluginSlotBoundary } from "./slot-error-boundary";
import { PluginSurface } from "./surface";

export type PluginSlotVariant = "buttons" | "menu-items" | "admin-sidebar-links" | "floating" | "sections";

/**
 * The render variant each slot is designed for. The mount point no longer needs
 * to repeat it — `PluginSlotHost` defaults to this map.
 */
const SLOT_VARIANTS: Record<PluginSlotName, PluginSlotVariant> = {
	"player-footer": "buttons",
	"details-action-bar": "buttons",
	"root-floating-overlay": "floating",
	"navbar-profile-menu": "menu-items",
	"media-file-card-actions": "menu-items",
	"details-dropdown": "menu-items",
	"admin-sidebar-plugin-section": "admin-sidebar-links",
	"dashboard-section": "sections",
};

interface PluginSlotHostProps {
	name: PluginSlotName;
	/** Override the slot's default render variant (see `SLOT_VARIANTS`). */
	variant?: PluginSlotVariant;
	/** Extra classes for the buttons variant (each slot has different sizing needs). */
	buttonClassName?: string;
	/** Live player values — passed by slots mounted inside the player. */
	playerContext?: PluginUiPlayerContext;
	/** Ambient values of the mount point (e.g. metadataId) forwarded to actions and surfaces. */
	params?: Record<string, string>;
	/** Route prefixes where this slot must not render (e.g. `["/player"]`). */
	excludePaths?: string[];
}

/**
 * Renders every enabled plugin's contribution to a named slot. The host knows
 * nothing about specific plugins — contribution shape comes entirely from the
 * aggregated ui.json manifest.
 */
export function PluginSlotHost({ name, variant, buttonClassName, playerContext, params, excludePaths }: PluginSlotHostProps) {
	const resolvedVariant = variant ?? SLOT_VARIANTS[name];
	const { contributions } = usePluginSlots(name);
	const { data: manifest } = usePluginUiManifest();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { openDialog } = usePluginDialogController();

	if (excludePaths?.some((prefix) => pathname.startsWith(prefix))) return null;

	if (contributions.length === 0) return null;

	const runAction = (pluginId: string, action: PluginSlotAction) => {
		switch (action.type) {
			case "page": {
				const page = manifest?.plugins[pluginId]?.pages?.find((candidate) => candidate.id === action.page);
				if (!page) return;

				detach(
					navigate({
						to: "/plugins/$pluginId/page/$pagePath",
						params: { pluginId, pagePath: page.path },
						search: { ...params, ...action.params },
					}),
				);

				return;
			}
			case "dialog":
				openDialog({ pluginId, dialog: action.dialog, params: { ...params, ...action.params }, player: playerContext });

				return;
			case "navigate":
				detach(navigate({ href: action.href }));

				return;
			case "external":
				window.open(action.href, "_blank", "noopener");

				return;
			default:
				return;
		}
	};

	if (resolvedVariant === "menu-items") {
		return (
			<>
				{contributions.map((contribution, index) => {
					const key = `${contribution.pluginId}:${index}`;
					const label = resolvePluginText(contribution.label, contribution.defaultLocale);
					if (contribution.element) {
						return (
							<PluginSlotBoundary key={key} pluginId={contribution.pluginId}>
								<PluginSurface pluginId={contribution.pluginId} tag={contribution.element.tag} player={playerContext} params={params} />
							</PluginSlotBoundary>
						);
					}

					const Icon = getPluginIcon(contribution.icon);

					return (
						<PluginSlotBoundary key={key} pluginId={contribution.pluginId}>
							<DropdownMenuItem
								className="gap-3 rounded-xl px-4 py-3 text-sm hover:cursor-pointer hover:bg-muted"
								onClick={() => contribution.action && runAction(contribution.pluginId, contribution.action)}
							>
								<Icon className="size-4 text-muted-foreground" />
								<span>{label}</span>
							</DropdownMenuItem>
						</PluginSlotBoundary>
					);
				})}
			</>
		);
	}

	if (resolvedVariant === "admin-sidebar-links") {
		return (
			<>
				{contributions.map((contribution, index) => {
					const key = `${contribution.pluginId}:${index}`;
					const label = resolvePluginText(contribution.label, contribution.defaultLocale);
					if (contribution.element) {
						return (
							<PluginSlotBoundary key={key} pluginId={contribution.pluginId}>
								<SidebarMenuSubItem>
									<PluginSurface pluginId={contribution.pluginId} tag={contribution.element.tag} player={playerContext} params={params} />
								</SidebarMenuSubItem>
							</PluginSlotBoundary>
						);
					}

					const Icon = getPluginIcon(contribution.icon);

					return (
						<PluginSlotBoundary key={key} pluginId={contribution.pluginId}>
							<SidebarMenuSubItem>
								<SidebarMenuSubButton onClick={() => contribution.action && runAction(contribution.pluginId, contribution.action)}>
									<Icon className="size-3.5 shrink-0 text-muted-foreground" />
									<span className="truncate">{label}</span>
								</SidebarMenuSubButton>
							</SidebarMenuSubItem>
						</PluginSlotBoundary>
					);
				})}
			</>
		);
	}

	const items = (
		<>
			{contributions.map((contribution, index) => {
				const key = `${contribution.pluginId}:${index}`;
				const label = resolvePluginText(contribution.label, contribution.defaultLocale);
				if (contribution.element) {
					return (
						<PluginSlotBoundary key={key} pluginId={contribution.pluginId}>
							<PluginSurface
								pluginId={contribution.pluginId}
								tag={contribution.element.tag}
								player={playerContext}
								params={params}
								className={buttonClassName}
							/>
						</PluginSlotBoundary>
					);
				}

				const Icon = getPluginIcon(contribution.icon);

				return (
					<PluginSlotBoundary key={key} pluginId={contribution.pluginId}>
						<Button
							variant="outline"
							size={contribution.iconOnly ? "icon" : "default"}
							className={buttonClassName}
							aria-label={label}
							onClick={() => contribution.action && runAction(contribution.pluginId, contribution.action)}
						>
							<Icon className="size-5" aria-hidden="true" />
							{contribution.iconOnly ? null : label}
						</Button>
					</PluginSlotBoundary>
				);
			})}
		</>
	);

	if (resolvedVariant === "floating") {
		return <div className="fixed right-4 bottom-24 z-40 flex flex-col items-end gap-2 sm:right-6 xl:bottom-6">{items}</div>;
	}

	// Full-width inline sections (e.g. dashboard rows) — element contributions
	// stack vertically; button contributions make no sense here and are skipped.
	if (resolvedVariant === "sections") {
		return (
			<div className="flex flex-col gap-10">
				{contributions.map((contribution, index) => {
					if (!contribution.element) return null;

					const key = `${contribution.pluginId}:${index}`;

					return (
						<PluginSlotBoundary key={key} pluginId={contribution.pluginId}>
							<PluginSurface pluginId={contribution.pluginId} tag={contribution.element.tag} player={playerContext} params={params} />
						</PluginSlotBoundary>
					);
				})}
			</div>
		);
	}

	return items;
}
