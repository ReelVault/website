import { Link } from "@tanstack/react-router";
import { Info, PauseCircle, PlayCircle, Puzzle, RefreshCw, Sliders, XCircle } from "lucide-react";
import type { PluginRuntimeStatus } from "@reelvault/sdk";
import { ConfirmAction } from "@/components/confirm-action";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface PluginCardProps {
	plugin: PluginRuntimeStatus;
	isBusy: boolean;
	/** Present when the plugin exists in a catalog repository — opens the details dialog with its version history. */
	onOpenDetails?: () => void;
	onEnable: (id: string) => void;
	onDisable: (id: string) => void;
	onReload: (id: string) => void;
}

export function PluginCard({ plugin, isBusy, onOpenDetails, onEnable, onDisable, onReload }: PluginCardProps) {
	const isEnabled = plugin.state === "enabled";
	const isFailed = plugin.state === "failed" || Boolean(plugin.error);

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
						<Badge variant="outline" className="font-mono text-[10px]">
							{m.common_version_badge({ version: plugin.version })}
						</Badge>
					</div>
					<p className="font-mono text-[11px] text-muted-foreground">{m.common_id_label({ id: plugin.id })}</p>
				</div>

				{/* Description */}
				{plugin.description && <p className="mt-3 line-clamp-2 text-muted-foreground text-xs">{plugin.description}</p>}

				{/* Stats / Capabilities */}
				<div className="mt-4 flex flex-wrap gap-2 text-[11px]">
					<Badge variant="secondary" className="gap-1 font-normal">
						<span>{m.common_providers_label()}</span>
						<strong className="font-semibold">{plugin.providers}</strong>
					</Badge>
					<Badge variant="secondary" className="gap-1 font-normal">
						<span>{m.common_subtitles()}</span>
						<strong className="font-semibold">{plugin.subtitleProviders}</strong>
					</Badge>
					<Badge variant="secondary" className="gap-1 font-normal">
						<span>{m.admin_plugins_jobs_label()}</span>
						<strong className="font-semibold">{plugin.jobs}</strong>
					</Badge>
				</div>

				{/* Error Banner */}
				{plugin.error && (
					<div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive text-xs">
						<div className="flex items-center gap-1.5 font-bold">
							<XCircle className="size-3.5 shrink-0" />
							<span>{m.admin_plugins_loading_error({ failurePhase: plugin.failurePhase ?? "runtime" })}</span>
						</div>
						<p className="wrap-break-word mt-1 font-mono text-[11px]">{plugin.error}</p>
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
						className="gap-1.5 text-xs hover:text-primary"
						title={m.admin_plugins_configure_hint()}
					>
						<Sliders className="size-3.5" />
						{m.player_settings_word()}
					</Button>

					{onOpenDetails && (
						<Button variant="outline" size="sm" disabled={isBusy} onClick={onOpenDetails} className="gap-1.5 text-xs hover:text-primary">
							<Info className="size-3.5" />
							{m.admin_plugins_catalog_details()}
						</Button>
					)}

					{isEnabled ? (
						<ConfirmAction
							trigger={
								<Button
									variant="outline"
									size="sm"
									disabled={isBusy}
									className="gap-1.5 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive"
								>
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
						<Button variant="default" size="sm" disabled={isBusy} onClick={() => onEnable(plugin.id)} className="gap-1.5 text-xs">
							<PlayCircle className="size-3.5" />
							{m.admin_plugins_enable()}
						</Button>
					)}
				</div>

				<Button
					variant="ghost"
					size="sm"
					disabled={isBusy}
					onClick={() => onReload(plugin.id)}
					className="gap-1 text-muted-foreground text-xs hover:text-foreground"
				>
					<RefreshCw className="size-3" />
					{m.admin_plugins_reload()}
				</Button>
			</div>
		</article>
	);
}
