import type { AdminCacheStats } from "@reelvault/sdk";
import { cn } from "cn";
import { HardDrive, MemoryStick, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminCacheStats, usePurgeImageCache } from "@/client/hooks/use-admin-cache-stats";
import { AppErrorState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SkeletonList } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatMemory } from "../../dashboard/components/dashboard-utils";

const DISK_ROWS: Array<{ key: keyof AdminCacheStats["disk"]; label: string; description: string }> = [
	{ key: "transcodes", label: m.admin_resources_cache_transcodes(), description: m.admin_resources_cache_transcodes_desc() },
	{ key: "images", label: m.admin_resources_cache_images(), description: m.admin_resources_cache_images_desc() },
	{ key: "subtitles", label: m.admin_nav_subtitles(), description: m.admin_resources_downloaded_subtitles() },
];

function HitRateBadge({ hitRate }: { hitRate: number | null }) {
	if (hitRate === null) return <span className="text-muted-foreground text-xs">{m.common_no_value()}</span>;

	const percent = Math.round(hitRate * 100);

	return (
		<div className="flex min-w-20 flex-1 items-center gap-2">
			<Progress value={percent} size="sm" className="min-w-0 flex-1" />
			<span className="text-foreground font-mono text-xs tabular-nums">{m.common_percent_value({ value: percent })}</span>
		</div>
	);
}

export function ResourceCacheStats() {
	const { data, isPending, isError, error, isFetching, refetch } = useAdminCacheStats();
	const purgeImageCache = usePurgeImageCache();
	const memoryCaches = [...(data?.memory ?? [])];

	let statsBody: ReactNode;
	if (isPending) {
		statsBody = <SkeletonList count={3} itemClassName="h-12 rounded-xl" className="flex flex-col gap-3" />;
	} else if (isError) {
		statsBody = <AppErrorState title={m.admin_resources_failed_to_fetch_stats()} error={error} onRetry={() => detach(refetch)} />;
	} else {
		statsBody = (
			<div className="flex flex-col gap-7">
				<div className="flex flex-col gap-3">
					<div className="text-muted-foreground flex items-center gap-2">
						<HardDrive className="text-primary size-4" aria-hidden="true" />
						<p className="text-xs font-medium">{m.admin_resources_on_disk()}</p>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						{DISK_ROWS.map((row) => {
							const stats = data.disk[row.key];

							return (
								<div
									key={row.key}
									className="border-border/70 bg-muted/20 hover:bg-muted/35 flex min-h-28 flex-col justify-between gap-4 rounded-lg border p-4 transition-colors"
								>
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<p className="text-foreground text-sm font-medium">{row.label}</p>
											<p className="text-muted-foreground mt-1 text-xs leading-relaxed">{row.description}</p>
										</div>
										<span className="text-primary shrink-0 font-mono text-sm font-bold tabular-nums">{formatMemory(stats.bytes)}</span>
									</div>
									<p className="border-border/60 text-muted-foreground border-t pt-2 text-xs tabular-nums">
										{m.admin_resources_files_label()} {stats.files}
									</p>
								</div>
							);
						})}
					</div>
					<div className="border-border/70 bg-muted/20 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
						<p className="text-muted-foreground max-w-md text-xs">{m.admin_resources_clear_image_cache_desc()}</p>
						<Button size="sm" variant="outline" disabled={purgeImageCache.isPending} onClick={() => purgeImageCache.mutate()}>
							{m.admin_resources_clear_image_cache()}
						</Button>
					</div>
				</div>

				<div className="flex flex-col gap-3">
					<div className="text-muted-foreground flex items-center gap-2">
						<MemoryStick className="text-primary size-4" aria-hidden="true" />
						<p className="text-xs font-medium">{m.admin_resources_in_memory()}</p>
					</div>
					{memoryCaches.length === 0 ? (
						<p className="border-border/70 bg-muted/20 text-muted-foreground rounded-lg border px-4 py-3 text-sm">
							{m.admin_resources_no_memory_caches()}
						</p>
					) : (
						<div className="grid gap-3 sm:grid-cols-2">
							{memoryCaches.map((cache) => (
								<div
									key={cache.name}
									className="border-border/70 bg-muted/20 hover:bg-muted/35 flex min-h-20 items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-colors"
								>
									<div className="min-w-0">
										<p className="text-foreground truncate font-mono text-xs font-medium">{cache.name}</p>
										<p className="text-muted-foreground mt-1 text-xs tabular-nums">
											{cache.entries}
											{cache.maxSize !== null ? ` / ${cache.maxSize}` : ""} {m.admin_resources_cache_entries_word()}
										</p>
										<p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
											{m.admin_resources_cache_hits_misses({ hits: cache.hits, misses: cache.misses })}
										</p>
									</div>
									<HitRateBadge hitRate={cache.hitRate} />
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<AdminSection
			title={m.admin_server_cache()}
			description={m.admin_resources_cache_stats_description()}
			actions={
				<Button variant="outline" size="sm" onClick={() => detach(refetch)} disabled={isFetching}>
					<RefreshCw className={cn("size-3.5", { "animate-spin": isFetching })} />
				</Button>
			}
		>
			{statsBody}
		</AdminSection>
	);
}
