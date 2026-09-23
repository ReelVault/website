import { Download, Puzzle, RefreshCcw } from "lucide-react";
import type { PluginCatalogEntry } from "@reelvault/sdk";
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
		<article className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-[border-color,background-color,color,box-shadow] hover:border-primary/40 hover:shadow-md">
			<div>
				<div className="mb-4 flex items-start justify-between gap-3">
					<div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
						{entry.iconUrl ? (
							<img src={entry.iconUrl} alt="" className="size-full object-contain p-1.5" loading="lazy" />
						) : (
							<Puzzle className="size-5" />
						)}
					</div>
					<Badge
						variant={hasUpdate ? "default" : "outline"}
						className={hasUpdate ? "gap-1 bg-primary/15 text-primary" : "text-[11px] text-muted-foreground"}
					>
						{statusLabel}
					</Badge>
				</div>

				<div className="flex flex-col gap-1">
					<div className="flex flex-wrap items-center gap-2">
						<h3 className="font-bold text-base text-foreground tracking-tight">{entry.name}</h3>
						<Badge variant="outline" className="font-mono text-[10px]">
							{m.common_version_badge({ version: entry.version })}
						</Badge>
					</div>
					<p className="font-mono text-[11px] text-muted-foreground">{entry.repositoryName}</p>
				</div>

				{entry.description && <p className="mt-3 line-clamp-2 min-h-8 text-muted-foreground text-xs">{entry.description}</p>}

				<div className="mt-4 flex flex-wrap gap-2 text-[11px]">
					<Badge variant="secondary" className="gap-1 font-normal">
						{pluginCatalogCategoryLabel(entry.category)}
					</Badge>
					{entry.installedVersion && isInstalled && (
						<Badge variant="secondary" className="gap-1 font-normal">
							{m.admin_plugins_catalog_installed_version({ version: entry.installedVersion })}
						</Badge>
					)}
				</div>
			</div>

			<div className="mt-6 flex items-center justify-between border-border/60 border-t pt-4">
				<Button
					variant="ghost"
					size="sm"
					className="gap-1 text-muted-foreground text-xs hover:text-foreground"
					onClick={() => onOpenDetails(entry)}
				>
					{m.admin_plugins_catalog_details()}
				</Button>
				<Button
					variant={isInstalled ? "outline" : "default"}
					size="sm"
					disabled={isBusy || isInstalled}
					onClick={() => onOpenDetails(entry)}
					className="gap-1.5 text-xs"
				>
					{hasUpdate ? <RefreshCcw className="size-3.5" /> : <Download className="size-3.5" />}
					{actionLabel}
				</Button>
			</div>
		</article>
	);
}
