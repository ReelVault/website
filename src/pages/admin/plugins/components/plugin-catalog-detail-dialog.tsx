import { cn } from "cn";
import { AlertTriangle, ChevronDown, Download, ExternalLink, Puzzle, RefreshCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import type { PluginCatalogEntry, PluginCatalogVersion } from "reelvault-sdk";
import { ConfirmAction } from "@/components/confirm-action";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { m } from "@/paraglide/messages";
import { formatDateTime } from "@/utils/format-utils";
import { pluginCatalogCategoryLabel } from "./plugin-catalog-card";

interface PluginCatalogDetailDialogProps {
	entry: PluginCatalogEntry | null;
	isBusy: boolean;
	onClose: () => void;
	onInstall: (entry: PluginCatalogEntry, version?: string) => void;
	onUninstall: (pluginId: string) => void;
}

interface PluginVersionRowProps {
	version: PluginCatalogVersion;
	isLatest: boolean;
	isInstalled: boolean;
	isBusy: boolean;
	onInstall: (version: string) => void;
}

function PluginVersionRow({ version, isLatest, isInstalled, isBusy, onInstall }: PluginVersionRowProps) {
	const [expanded, setExpanded] = useState(false);

	return (
		<Collapsible open={expanded}>
			<CollapsibleTrigger
				type="button"
				onClick={() => setExpanded((value) => !value)}
				className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/40"
			>
				<ChevronDown className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", !expanded && "-rotate-90")} />
				<span className="font-mono text-xs">{m.common_version_badge({ version: version.version })}</span>
				{version.date && <span className="text-[11px] text-muted-foreground">{formatDateTime(version.date)}</span>}
				{isLatest && (
					<Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
						{m.admin_plugins_catalog_version_latest()}
					</Badge>
				)}
				{isInstalled && (
					<Badge variant="outline" className="px-1.5 py-0 text-[10px]">
						{m.admin_plugins_catalog_version_installed()}
					</Badge>
				)}
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="flex flex-col gap-2 px-3 pb-3 pl-8">
					{version.changelog && <p className="wrap-break-word whitespace-pre-line text-muted-foreground text-xs">{version.changelog}</p>}
					{!isInstalled && (
						<Button
							variant="outline"
							size="sm"
							disabled={isBusy}
							onClick={() => onInstall(version.version)}
							className="gap-1.5 self-start text-xs"
						>
							<Download className="size-3.5" />
							{m.admin_plugins_catalog_version_install()}
						</Button>
					)}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export function PluginCatalogDetailDialog({ entry, isBusy, onClose, onInstall, onUninstall }: PluginCatalogDetailDialogProps) {
	const isOpen = entry !== null;
	const isInstalled = entry?.status === "installed";
	const hasUpdate = entry?.status === "update-available";

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				{entry && (
					<>
						<DialogHeader>
							<div className="flex items-start gap-3">
								<div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
									{entry.iconUrl ? (
										<img src={entry.iconUrl} alt="" className="size-full object-contain p-1.5" />
									) : (
										<Puzzle className="size-5" />
									)}
								</div>
								<div className="flex flex-col gap-1">
									<DialogTitle className="text-left">{entry.name}</DialogTitle>
									<DialogDescription className="text-left">
										{entry.installedVersion ? `${m.admin_plugins_catalog_installed_label({ version: entry.installedVersion })} · ` : ""}
										{m.admin_plugins_catalog_installed_version({ version: entry.version })}
										{m.common_dot_separator()}
										{entry.repositoryName}
									</DialogDescription>
								</div>
							</div>
						</DialogHeader>

						<div className="flex flex-col gap-4">
							{entry.description && <p className="text-muted-foreground text-sm">{entry.description}</p>}

							<div className="flex flex-wrap gap-2">
								<Badge variant="secondary">{pluginCatalogCategoryLabel(entry.category)}</Badge>
								{entry.homepage && (
									<a
										href={entry.homepage}
										target="_blank"
										rel="noreferrer"
										className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-6 gap-1 px-2 text-xs")}
									>
										<ExternalLink className="size-3" />
										{m.admin_plugins_catalog_homepage()}
									</a>
								)}
							</div>

							{entry.changelog && (
								<section className="rounded-lg border bg-muted/40 p-3">
									<h4 className="font-semibold text-xs">{m.admin_plugins_catalog_changelog()}</h4>
									<p className="wrap-break-word mt-1 whitespace-pre-line text-muted-foreground text-xs">{entry.changelog}</p>
								</section>
							)}

							{(entry.versions?.length ?? 0) > 0 && (
								<section>
									<h4 className="font-semibold text-xs">{m.admin_plugins_catalog_revision_history()}</h4>
									<div className="mt-1.5 divide-y divide-border/60 rounded-lg border bg-muted/20">
										{entry.versions?.map((version) => (
											<PluginVersionRow
												key={version.version}
												version={version}
												isLatest={version.version === entry.version}
												isInstalled={version.version === entry.installedVersion}
												isBusy={isBusy}
												onInstall={(target) => onInstall(entry, target)}
											/>
										))}
									</div>
								</section>
							)}

							<section>
								<h4 className="font-semibold text-xs">{m.admin_plugins_catalog_capabilities()}</h4>
								<div className="mt-1.5 flex flex-wrap gap-1.5">
									{(entry.capabilities ?? []).map((capability) => (
										<Badge key={capability} variant="outline" className="font-mono text-[10px]">
											{capability}
										</Badge>
									))}
									{(entry.capabilities?.length ?? 0) === 0 && <span className="text-muted-foreground text-xs">{m.common_none()}</span>}
								</div>
							</section>

							<div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-700 text-xs dark:text-amber-400">
								<AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
								<span>{m.admin_plugins_catalog_trust_warning()}</span>
							</div>
						</div>

						<DialogFooter className="gap-2 sm:justify-between">
							{isInstalled ? (
								<ConfirmAction
									trigger={
										<Button
											variant="outline"
											size="sm"
											disabled={isBusy}
											className="gap-1.5 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive"
										>
											<Trash2 className="size-3.5" />
											{m.admin_plugins_catalog_uninstall()}
										</Button>
									}
									title={m.admin_plugins_catalog_uninstall_confirm_title({ name: entry.name })}
									description={m.admin_plugins_catalog_uninstall_confirm_description()}
									confirmLabel={m.admin_plugins_catalog_uninstall()}
									onConfirm={() => onUninstall(entry.id)}
								/>
							) : (
								<Button variant="default" size="sm" disabled={isBusy} onClick={() => onInstall(entry)} className="gap-1.5 text-xs">
									{hasUpdate ? <RefreshCcw className="size-3.5" /> : <Download className="size-3.5" />}
									{hasUpdate ? m.admin_plugins_catalog_update() : m.admin_plugins_catalog_install()}
								</Button>
							)}
							<Button variant="ghost" size="sm" onClick={onClose}>
								{m.common_close()}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
