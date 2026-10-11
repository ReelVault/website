import type { PluginAdminStatus } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Info, PauseCircle, PlayCircle, Puzzle, RefreshCw, ShieldCheck, Sliders, Trash2, XCircle } from "lucide-react";
import { ConfirmAction } from "@/components/confirm-action";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
		<article className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-[border-color,background-color,color,box-shadow] hover:border-primary/40 hover:shadow-md">
			<div>
				{/* Top Row: Icon + State */}
				<div className="mb-4 flex items-start justify-between gap-3">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Puzzle className="size-5" />
					</div>
					<StatusBadge status={statusVariant} label={plugin.state} />
				</div>

				{/* Name & ID */}
				<div className="flex flex-col gap-1">
					<div className="flex flex-wrap items-center gap-2">
						<h3 className="font-bold text-base text-foreground tracking-tight">{plugin.name}</h3>
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
					<p className="font-mono text-muted-foreground text-xs">{m.common_id_label({ id: plugin.id })}</p>
				</div>

				{/* Description */}
				{plugin.description && <p className="mt-3 line-clamp-2 text-muted-foreground text-xs">{plugin.description}</p>}

				{/* Stats / Capabilities */}
				<div className="mt-4 flex flex-wrap gap-2 text-xs">
					<Badge weight="normal" variant="secondary">
						<span>{m.common_providers_label()}</span>
						<strong className="font-semibold">{plugin.providers}</strong>
					</Badge>
					<Badge weight="normal" variant="secondary">
						<span>{m.common_subtitles()}</span>
						<strong className="font-semibold">{plugin.subtitleProviders}</strong>
					</Badge>
					<Badge weight="normal" variant="secondary">
						<span>{m.admin_plugins_jobs_label()}</span>
						<strong className="font-semibold">{plugin.jobs}</strong>
					</Badge>
				</div>

				{/* Package details */}
				{(plugin.capabilities.length > 0 || (plugin.installedAt && plugin.source)) && (
					<div className="mt-3 flex flex-col gap-1 text-muted-foreground text-xs">
						{plugin.capabilities.length > 0 && (
							<p>
								<span className="font-medium text-foreground">{`${m.admin_plugins_capabilities_label()}: `}</span>
								<span className="font-mono">{plugin.capabilities.join(", ")}</span>
							</p>
						)}
						{plugin.installedAt && plugin.source && (
							<p>{m.admin_plugins_installed_on({ date: formatDate(plugin.installedAt), source: plugin.source })}</p>
						)}
					</div>
				)}

				{/* Configuration read error */}
				{plugin.configReadError && (
					<div className="mt-4 flex items-start gap-1.5 rounded-lg border border-warning/30 bg-warning/10 p-3 text-warning text-xs">
						<AlertTriangle className="mt-px size-3.5 shrink-0" />
						<span>{m.admin_plugins_config_unreadable()}</span>
					</div>
				)}

				{/* Error Banner */}
				{plugin.errorCode && (
					<div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive text-xs">
						<div className="flex items-center gap-1.5 font-bold">
							<XCircle className="size-3.5 shrink-0" />
							<span>{m.admin_plugins_loading_error({ failurePhase: plugin.failurePhase ?? "runtime" })}</span>
						</div>
						<p className="wrap-break-word mt-1 font-mono text-xs">{pluginErrorText(plugin)}</p>
					</div>
				)}
			</div>

			{/* Action Footer */}
			<div className="mt-6 flex items-center justify-between border-border/60 border-t pt-4">
				<div className="flex items-center gap-2">
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

					{onToggleSelect && (
						<label className="flex cursor-pointer items-center gap-1.5 text-xs">
							<input type="checkbox" checked={selected} onChange={onToggleSelect} className="size-4 accent-primary" />
							{m.admin_plugins_select()}
						</label>
					)}

					{onSetPinned && plugin.pinned !== undefined && (
						<Button
							variant="outline"
							size="sm"
							disabled={isBusy}
							onClick={() => onSetPinned(plugin.id, plugin.pinned !== true)}
							title={m.admin_plugins_pin_hint()}
						>
							{plugin.pinned ? m.admin_plugins_unpin() : m.admin_plugins_pin()}
						</Button>
					)}

					{onSetCsp && plugin.cspDisabled !== undefined && (
						<Button
							variant="outline"
							size="sm"
							disabled={isBusy}
							onClick={() => onSetCsp(plugin.id, plugin.cspDisabled === true)}
							title={m.admin_plugins_csp_hint()}
						>
							<ShieldCheck className="size-3.5" />
							{plugin.cspDisabled ? m.admin_plugins_csp_allow() : m.admin_plugins_csp_refuse()}
						</Button>
					)}

					{onOpenDetails && (
						<Button variant="outline" size="sm" disabled={isBusy} onClick={onOpenDetails}>
							<Info className="size-3.5" />
							{m.admin_plugins_catalog_details()}
						</Button>
					)}

					{onUninstall && (
						<ConfirmAction
							trigger={
								<Button variant="destructive-outline" size="sm" disabled={isBusy}>
									<Trash2 className="size-3.5" />
									{m.admin_plugins_catalog_uninstall()}
								</Button>
							}
							title={m.admin_plugins_catalog_uninstall_confirm_title({ name: plugin.name })}
							description={m.admin_plugins_catalog_uninstall_confirm_description()}
							confirmLabel={m.admin_plugins_catalog_uninstall()}
							onConfirm={onUninstall}
						/>
					)}

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
				</div>

				<Button tone="muted" variant="ghost" size="sm" disabled={isBusy} onClick={() => onReload(plugin.id)}>
					<RefreshCw className="size-3" />
					{m.admin_plugins_reload()}
				</Button>
			</div>
		</article>
	);
}
