import { cn } from "cn";
import { HardDrive, MemoryStick, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import type { AdminCacheStats } from "reelvault-sdk";
import { useAdminCacheStats } from "@/client/hooks/use-admin-cache-stats";
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
			<Progress value={percent} className="h-1.5 min-w-0 flex-1" />
			<span className="font-mono text-[11px] text-foreground tabular-nums">{m.common_percent_value({ value: percent })}</span>
		</div>
	);
}

export function ResourceCacheStats() {
	const { data, isPending, isError, error, isFetching, refetch } = useAdminCacheStats();
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
					<div className="flex items-center gap-2 text-muted-foreground">
						<HardDrive className="size-4 text-primary" aria-hidden="true" />
						<p className="font-medium text-[11px] uppercase tracking-wider">{m.admin_resources_on_disk()}</p>
					</div>
					<div className="grid gap-3 md:grid-cols-3">
						{DISK_ROWS.map((row) => {
							const stats = data.disk[row.key];

							return (
								<div
									key={row.key}
									className="flex min-h-28 flex-col justify-between gap-4 rounded-lg border border-border/70 bg-muted/20 p-4 transition-colors hover:bg-muted/35"
								>
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<p className="font-medium text-foreground text-sm">{row.label}</p>
											<p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{row.description}</p>
										</div>
										<span className="shrink-0 font-bold font-mono text-primary text-sm tabular-nums">{formatMemory(stats.bytes)}</span>
									</div>
									<p className="border-border/60 border-t pt-2 text-muted-foreground text-xs tabular-nums">
										{m.admin_resources_files_label()} {stats.files}
									</p>
								</div>
							);
						})}
					</div>
				</div>

				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-2 text-muted-foreground">
						<MemoryStick className="size-4 text-primary" aria-hidden="true" />
						<p className="font-medium text-[11px] uppercase tracking-wider">{m.admin_resources_in_memory()}</p>
					</div>
					{memoryCaches.length === 0 ? (
						<p className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-muted-foreground text-sm">
							{m.admin_resources_no_memory_caches()}
						</p>
					) : (
						<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
							{memoryCaches.map((cache) => (
								<div
									key={cache.name}
									className="flex min-h-20 items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/35"
								>
									<div className="min-w-0">
										<p className="truncate font-medium font-mono text-foreground text-xs">{cache.name}</p>
										<p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
											{cache.entries}
											{cache.maxSize !== null ? ` / ${cache.maxSize}` : ""} {m.admin_resources_cache_entries_word()}
										</p>
										<p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
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
				<Button variant="outline" onClick={() => detach(refetch)} disabled={isFetching}>
					<RefreshCw className={cn("size-4", { "animate-spin": isFetching })} />
				</Button>
			}
		>
			{statsBody}
		</AdminSection>
	);
}
