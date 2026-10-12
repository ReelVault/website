import type { PluginAdminStatus } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import {
	AlertTriangle,
	Info,
	MoreVertical,
	PauseCircle,
	PlayCircle,
	Puzzle,
	RefreshCw,
	ShieldCheck,
	Sliders,
	Trash2,
	XCircle,
} from "lucide-react";
import { ConfirmAction } from "@/components/confirm-action";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { m } from "@/paraglide/messages";
import { formatDate } from "@/utils/format-utils";
import { translateCode } from "@/utils/translate-error";

/** The translated text for the failure's code; the generic load failure when the website has no message for it. */
function pluginErrorText(plugin: PluginAdminStatus): string | undefined {
	return plugin.errorCode ? translateCode(plugin.errorCode, m.plugin_load_failed()) : undefined;
}

interface PluginCardProps {
	plugin: PluginAdminStatus;
	isBusy: boolean;
	/** Present when the plugin exists in a catalog repository — opens the details dialog with its version history. */
	onOpenDetails?: () => void;
	/** Present for installed plugins without a catalog entry (side-loaded archives). */
	onUninstall?: (() => void) | undefined;
	onEnable: (id: string) => void;
	onDisable: (id: string) => void;
	onReload: (id: string) => void;
	/** Present for installed plugins: allows or refuses the CSP sources the manifest declares. */
	onSetCsp?: ((id: string, enabled: boolean) => void) | undefined;
	/** Present for installed plugins: keeps the installed version, so the catalog offers no update. */
	onSetPinned?: ((id: string, pinned: boolean) => void) | undefined;
	/** Present when the card can be selected for a bulk action. */
	selected?: boolean;
	onToggleSelect?: (() => void) | undefined;
}

export function PluginCard({
	plugin,
	isBusy,
	onOpenDetails,
	onUninstall,
	onEnable,
	onDisable,
	onReload,
	onSetCsp,
	onSetPinned,
	selected = false,
	onToggleSelect,
}: PluginCardProps) {
	const isEnabled = plugin.state === "enabled";
	const isFailed = plugin.state === "failed" || Boolean(plugin.errorCode);

	let statusVariant: "error" | "success" | "idle";
	if (isFailed) {
		statusVariant = "error";
	} else if (isEnabled) {
		statusVariant = "success";
	} else {
		statusVariant = "idle";
	}

	return (
		<article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md">
			{/* Identity: icon, name and the state the plugin is in */}
			<div className="flex items-start gap-3">
				<div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<Puzzle className="size-6" />
				</div>
				<div className="min-w-0 flex-1">
					<h3 className="truncate font-semibold text-foreground text-lg leading-tight">{plugin.name}</h3>
					<p className="truncate font-mono text-muted-foreground text-xs">{m.common_id_label({ id: plugin.id })}</p>
				</div>
				<StatusBadge status={statusVariant} label={plugin.state} />
			</div>

			<div className="flex flex-wrap items-center gap-1.5">
				<Badge variant="outline" font="mono">
					{m.common_version_badge({ version: plugin.version })}
				</Badge>
				{plugin.updateAvailable && <Badge>{m.admin_plugins_update_available()}</Badge>}
				{plugin.integrityOk === false && (
					<Badge variant="destructive">
						<AlertTriangle className="size-3" />
						{m.admin_plugins_integrity_mismatch()}
					</Badge>
				)}
			</div>

			{plugin.description && <p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">{plugin.description}</p>}

			{/* Counters: what the plugin contributes */}
			<dl className="grid grid-cols-3 gap-2 text-sm">
				<div className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2">
					<dt className="truncate text-muted-foreground text-xs">{m.common_providers_label()}</dt>
					<dd className="font-semibold tabular-nums">{plugin.providers}</dd>
				</div>
				<div className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2">
					<dt className="truncate text-muted-foreground text-xs">{m.common_subtitles()}</dt>
					<dd className="font-semibold tabular-nums">{plugin.subtitleProviders}</dd>
				</div>
				<div className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2">
					<dt className="truncate text-muted-foreground text-xs">{m.admin_plugins_jobs_label()}</dt>
					<dd className="font-semibold tabular-nums">{plugin.jobs}</dd>
				</div>
			</dl>

			{plugin.capabilities.length > 0 && (
				<div className="flex flex-col gap-1.5">
					<span className="text-muted-foreground text-xs">{m.admin_plugins_capabilities_label()}</span>
					<div className="flex flex-wrap gap-1.5">
						{plugin.capabilities.map((capability) => (
							<Badge key={capability} variant="outline" font="mono">
								{capability}
							</Badge>
						))}
					</div>
				</div>
			)}

			{plugin.installedAt && plugin.source && (
				<p className="wrap-break-word text-muted-foreground text-xs">
					{m.admin_plugins_installed_on({ date: formatDate(plugin.installedAt), source: plugin.source })}
				</p>
			)}

			{/* Configuration read error */}
			{plugin.configReadError && (
				<div className="flex items-start gap-1.5 rounded-lg border border-warning/30 bg-warning/10 p-3 text-warning text-xs">
					<AlertTriangle className="mt-px size-3.5 shrink-0" />
					<span>{m.admin_plugins_config_unreadable()}</span>
				</div>
			)}

			{/* Error Banner */}
			{plugin.errorCode && (
				<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive text-xs">
					<div className="flex items-center gap-1.5 font-bold">
						<XCircle className="size-3.5 shrink-0" />
						<span>{m.admin_plugins_loading_error({ failurePhase: plugin.failurePhase ?? "runtime" })}</span>
					</div>
					<p className="wrap-break-word mt-1 font-mono text-xs">{pluginErrorText(plugin)}</p>
				</div>
			)}

			{/* Actions: configuration and the state change stay in view, the rest sits in the menu */}
			<div className="mt-auto flex flex-wrap items-center gap-2 border-border/60 border-t pt-4">
				<Button
					variant="outline"
					size="sm"
					nativeButton={false}
					render={<Link to="/admin/plugins/$id" params={{ id: encodeURIComponent(plugin.id) }} />}
					title={m.admin_plugins_configure_hint()}
				>
					<Sliders className="size-3.5" />
					{m.player_settings_word()}
				</Button>

				{isEnabled ? (
					<ConfirmAction
						trigger={
							<Button variant="destructive-outline" size="sm" disabled={isBusy}>
								<PauseCircle className="size-3.5" />
								{m.admin_plugins_disable()}
							</Button>
						}
						title={m.admin_plugins_disable_confirm({ name: plugin.name })}
						description={m.admin_plugins_disable_notice()}
						confirmLabel={m.admin_plugins_disable()}
						onConfirm={() => onDisable(plugin.id)}
					/>
				) : (
					<Button variant="default" size="sm" disabled={isBusy} onClick={() => onEnable(plugin.id)}>
						<PlayCircle className="size-3.5" />
						{m.admin_plugins_enable()}
					</Button>
				)}

				<div className="ml-auto flex items-center gap-2">
					{onToggleSelect && (
						<label className="flex cursor-pointer items-center gap-1.5 text-xs">
							<input type="checkbox" checked={selected} onChange={onToggleSelect} className="size-4 accent-primary" />
							{m.admin_plugins_select()}
						</label>
					)}

					{onUninstall && (
						<ConfirmAction
							trigger={
								<Button
									variant="destructive-ghost"
									size="icon-sm"
									disabled={isBusy}
									aria-label={m.admin_plugins_catalog_uninstall()}
									title={m.admin_plugins_catalog_uninstall()}
								>
									<Trash2 className="size-3.5" />
								</Button>
							}
							title={m.admin_plugins_catalog_uninstall_confirm_title({ name: plugin.name })}
							description={m.admin_plugins_catalog_uninstall_confirm_description()}
							confirmLabel={m.admin_plugins_catalog_uninstall()}
							onConfirm={onUninstall}
						/>
					)}

					<DropdownMenu>
						<DropdownMenuTrigger render={<Button variant="outline" size="icon-sm" disabled={isBusy} aria-label={m.common_actions()} />}>
							<MoreVertical className="size-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							{onSetPinned && plugin.pinned !== undefined && (
								<DropdownMenuItem
									disabled={isBusy}
									title={m.admin_plugins_pin_hint()}
									onClick={() => onSetPinned(plugin.id, plugin.pinned !== true)}
								>
									{plugin.pinned ? m.admin_plugins_unpin() : m.admin_plugins_pin()}
								</DropdownMenuItem>
							)}

							{onSetCsp && plugin.cspDisabled !== undefined && (
								<DropdownMenuItem
									disabled={isBusy}
									title={m.admin_plugins_csp_hint()}
									onClick={() => onSetCsp(plugin.id, plugin.cspDisabled === true)}
								>
									<ShieldCheck className="size-4" />
									{plugin.cspDisabled ? m.admin_plugins_csp_allow() : m.admin_plugins_csp_refuse()}
								</DropdownMenuItem>
							)}

							{onOpenDetails && (
								<DropdownMenuItem disabled={isBusy} onClick={onOpenDetails}>
									<Info className="size-4" />
									{m.admin_plugins_catalog_details()}
								</DropdownMenuItem>
							)}

							<DropdownMenuItem disabled={isBusy} onClick={() => onReload(plugin.id)}>
								<RefreshCw className="size-4" />
								{m.admin_plugins_reload()}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</article>
	);
}
