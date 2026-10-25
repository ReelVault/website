import type { PluginCatalogEntry, PluginCatalogVersion } from "@reelvault/sdk";
import { cn } from "cn";
import { AlertTriangle, ChevronDown, Download, ExternalLink, Puzzle, RefreshCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmAction } from "@/components/confirm-action";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { m } from "@/paraglide/messages";
import { formatDateTime } from "@/utils/format-utils";
import { pluginCatalogCategoryLabel } from "./plugin-catalog-card";

interface PluginCatalogDetailProps {
	entry: PluginCatalogEntry;
	isBusy: boolean;
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
			<CollapsibleTrigger type="button" variant="row" onClick={() => setExpanded((value) => !value)}>
				<span className="font-mono text-sm font-semibold">{m.common_version_badge({ version: version.version })}</span>
				{version.date && <span className="text-muted-foreground text-sm">{formatDateTime(version.date)}</span>}
				{isLatest && (
					<Badge variant="secondary" size="count">
						{m.admin_plugins_catalog_version_latest()}
					</Badge>
				)}
				{isInstalled && (
					<Badge variant="outline" size="count">
						{m.admin_plugins_catalog_version_installed()}
					</Badge>
				)}
				<ChevronDown className={cn("text-muted-foreground ml-auto size-4 shrink-0 transition-transform", !expanded && "-rotate-90")} />
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="flex flex-col gap-3 px-4 pb-4">
					{version.changelog && <p className="text-muted-foreground text-sm wrap-break-word whitespace-pre-line">{version.changelog}</p>}
					{!isInstalled && (
						<Button variant="outline" size="sm" disabled={isBusy} onClick={() => onInstall(version.version)} className="self-start">
							<Download className="size-3.5" />
							{m.admin_plugins_catalog_version_install()}
						</Button>
					)}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

/** The full catalog entry of one plugin: what it is, its changelog, every version and what it can do, with install or uninstall. */
export function PluginCatalogDetail({ entry, isBusy, onInstall, onUninstall }: PluginCatalogDetailProps) {
	const isInstalled = entry.status === "installed";
	const hasUpdate = entry.status === "update-available";

	return (
		<div className="flex flex-col gap-8">
			<header className="flex items-start gap-4">
				<div className="bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl">
					{entry.iconUrl ? <img src={entry.iconUrl} alt="" className="size-full object-contain p-2" /> : <Puzzle className="size-6" />}
				</div>
				<div className="flex min-w-0 flex-col gap-1.5">
					<h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{entry.name}</h1>
					<p className="text-muted-foreground text-sm">
						{entry.installedVersion ? `${m.admin_plugins_catalog_installed_label({ version: entry.installedVersion })} · ` : ""}
						{m.admin_plugins_catalog_installed_version({ version: entry.version })}
						{m.common_dot_separator()}
						{entry.repositoryName}
					</p>
				</div>
			</header>

			<section className="flex flex-col gap-4">
				{entry.description && <p className="text-muted-foreground text-base leading-relaxed">{entry.description}</p>}

				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="secondary">{pluginCatalogCategoryLabel(entry.category)}</Badge>
					{entry.homepage && (
						<a
							href={entry.homepage}
							target="_blank"
							rel="noreferrer"
							className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 gap-1.5 px-2 text-sm")}
						>
							<ExternalLink className="size-3.5" />
							{m.admin_plugins_catalog_homepage()}
						</a>
					)}
				</div>
			</section>

			{entry.changelog && (
				<section className="bg-muted/40 rounded-xl border p-4">
					<h2 className="text-sm font-semibold">{m.admin_plugins_catalog_changelog()}</h2>
					<p className="text-muted-foreground mt-2 text-sm wrap-break-word whitespace-pre-line">{entry.changelog}</p>
				</section>
			)}

			{(entry.versions?.length ?? 0) > 0 && (
				<section className="flex flex-col gap-2">
					<h2 className="text-sm font-semibold">{m.admin_plugins_catalog_revision_history()}</h2>
					<div className="divide-border/60 bg-muted/20 divide-y overflow-hidden rounded-xl border">
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

			<section className="flex flex-col gap-2">
				<h2 className="text-sm font-semibold">{m.admin_plugins_catalog_capabilities()}</h2>
				<div className="flex flex-wrap gap-1.5">
					{(entry.capabilities ?? []).map((capability) => (
						<Badge key={capability} variant="outline" font="mono">
							{capability}
						</Badge>
					))}
					{(entry.capabilities?.length ?? 0) === 0 && <span className="text-muted-foreground text-sm">{m.common_none()}</span>}
				</div>
			</section>

			<div className="border-warning/30 bg-warning/10 text-warning flex items-start gap-2 rounded-xl border p-4 text-sm">
				<AlertTriangle className="mt-0.5 size-4 shrink-0" />
				<span>{m.admin_plugins_catalog_trust_warning()}</span>
			</div>

			<div className="border-border/60 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
				{isInstalled ? (
					<ConfirmAction
						trigger={
							<Button variant="destructive-outline" disabled={isBusy}>
								<Trash2 className="size-4" />
								{m.admin_plugins_catalog_uninstall()}
							</Button>
						}
						title={m.admin_plugins_catalog_uninstall_confirm_title({ name: entry.name })}
						description={m.admin_plugins_catalog_uninstall_confirm_description()}
						confirmLabel={m.admin_plugins_catalog_uninstall()}
						onConfirm={() => onUninstall(entry.id)}
					/>
				) : (
					<Button variant="default" disabled={isBusy} onClick={() => onInstall(entry)}>
						{hasUpdate ? <RefreshCcw className="size-4" /> : <Download className="size-4" />}
						{hasUpdate ? m.admin_plugins_catalog_update() : m.admin_plugins_catalog_install()}
					</Button>
				)}
			</div>
		</div>
	);
}
