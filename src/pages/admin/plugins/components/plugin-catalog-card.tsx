import type { PluginCatalogEntry } from "@reelvault/sdk";
import { Download, Puzzle, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

const CATEGORY_LABEL_KEYS = {
	metadata: m.admin_plugins_category_metadata,
	subtitles: m.admin_plugins_category_subtitles,
	automation: m.admin_plugins_category_automation,
	integrations: m.admin_plugins_category_integrations,
	ui: m.admin_plugins_category_ui,
	other: m.admin_plugins_category_other,
} as const;

export function pluginCatalogCategoryLabel(category: PluginCatalogEntry["category"]): string {
	return CATEGORY_LABEL_KEYS[category]();
}

interface PluginCatalogCardProps {
	entry: PluginCatalogEntry;
	isBusy: boolean;
	onOpenDetails: (entry: PluginCatalogEntry) => void;
}

export function PluginCatalogCard({ entry, isBusy, onOpenDetails }: PluginCatalogCardProps) {
	const isInstalled = entry.status === "installed";
	const hasUpdate = entry.status === "update-available";

	let statusLabel = m.admin_plugins_view_available();
	let actionLabel = m.admin_plugins_catalog_install();
	if (isInstalled) {
		statusLabel = m.admin_plugins_view_installed();
		actionLabel = m.admin_plugins_view_installed();
	} else if (hasUpdate) {
		statusLabel = m.admin_plugins_catalog_update_available();
		actionLabel = m.admin_plugins_catalog_update();
	}

	return (
		<article className="group border-border/80 bg-card hover:border-primary/40 flex flex-col justify-between rounded-xl border p-5 shadow-xs transition-[border-color,background-color,color,box-shadow] hover:shadow-md">
			<div>
				<div className="mb-4 flex items-start justify-between gap-3">
					<div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
						{entry.iconUrl ? (
							<img src={entry.iconUrl} alt="" className="size-full object-contain p-1.5" loading="lazy" />
						) : (
							<Puzzle className="size-5" />
						)}
					</div>
					<Badge variant={hasUpdate ? "primary" : "outline"} tone={hasUpdate ? "default" : "muted"}>
						{statusLabel}
					</Badge>
				</div>

				<div className="flex flex-col gap-1">
					<div className="flex flex-wrap items-center gap-2">
						<h3 className="text-foreground text-base font-bold tracking-tight">{entry.name}</h3>
						<Badge variant="outline" font="mono">
							{m.common_version_badge({ version: entry.version })}
						</Badge>
					</div>
					<p className="text-muted-foreground font-mono text-xs">{entry.repositoryName}</p>
				</div>

				{entry.description && <p className="text-muted-foreground mt-3 line-clamp-2 min-h-8 text-xs">{entry.description}</p>}

				<div className="mt-4 flex flex-wrap gap-2 text-xs">
					<Badge weight="normal" variant="secondary">
						{pluginCatalogCategoryLabel(entry.category)}
					</Badge>
					{entry.installedVersion && isInstalled && (
						<Badge weight="normal" variant="secondary">
							{m.admin_plugins_catalog_installed_version({ version: entry.installedVersion })}
						</Badge>
					)}
					{entry.minServerVersion && (
						<Badge weight="normal" variant="outline">
							{m.admin_plugins_catalog_min_server_version({ version: entry.minServerVersion })}
						</Badge>
					)}
				</div>
			</div>

			<div className="border-border/60 mt-6 flex items-center justify-between border-t pt-4">
				<Button tone="muted" variant="ghost" size="sm" onClick={() => onOpenDetails(entry)}>
					{m.admin_plugins_catalog_details()}
				</Button>
				<Button
					variant={isInstalled ? "outline" : "default"}
					size="sm"
					disabled={isBusy || isInstalled}
					onClick={() => onOpenDetails(entry)}
				>
					{hasUpdate ? <RefreshCcw className="size-3.5" /> : <Download className="size-3.5" />}
					{actionLabel}
				</Button>
			</div>
		</article>
	);
}
