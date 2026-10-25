import type { WorkerSummary } from "@reelvault/sdk";
import { cn } from "cn";
import { Cog, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { CATEGORY_NAMES } from "./scheduled-tasks-category-group";
import { WorkerQueueCard } from "./worker-queue-card";
import { getWorkerMeta } from "./worker-utils";

interface WorkerStatsGridProps {
	workerStats: WorkerSummary[];
	isLoading: boolean;
	isError: boolean;
}

/** Queue & pool cards with search + category filter, inside an AdminSection. */
export function WorkerStatsGrid({ workerStats, isLoading, isError }: WorkerStatsGridProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");

	const categorySet = new Set<string>();
	for (const ws of workerStats) {
		categorySet.add(ws.category);
	}

	const categories = [...categorySet];

	const query = searchQuery.trim().toLowerCase();

	const filteredStats = workerStats.filter((ws) => {
		const meta = getWorkerMeta(ws.id);
		const category = ws.category;
		if (categoryFilter !== "all" && category !== categoryFilter) {
			return false;
		}

		if (!query) return true;

		return ws.id.toLowerCase().includes(query) || ws.name.toLowerCase().includes(query) || meta.title.toLowerCase().includes(query);
	});

	return (
		<AdminSection
			title={m.admin_worker_queues_pools()}
			description={m.admin_worker_concurrency_config()}
			badge={
				<Badge variant="secondary" font="mono" size="count">
					{workerStats.length}
				</Badge>
			}
		>
			<div className="flex flex-col gap-4">
				{/* Search and Category Filter */}
				<div className="flex flex-wrap items-center justify-end gap-2">
					<div className="relative">
						<Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
						<Input
							leadingIcon
							type="text"
							placeholder={m.admin_workers_search_placeholder()}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-44"
						/>
					</div>

					{categories.length > 1 && (
						<div className="border-border/50 bg-card/40 flex items-center gap-1 rounded-lg border p-0.5">
							<button
								type="button"
								onClick={() => setCategoryFilter("all")}
								className={cn(
									"rounded-md px-2 py-1 text-xs font-medium transition-[border-color,background-color,color,box-shadow]",
									categoryFilter === "all" ? "bg-secondary text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
								)}
							>
								{m.common_all()}
							</button>
							{categories.map((cat) => (
								<button
									key={cat}
									type="button"
									onClick={() => setCategoryFilter(cat)}
									className={cn(
										"rounded-md px-2 py-1 text-xs font-medium transition-[border-color,background-color,color,box-shadow]",
										categoryFilter === cat ? "bg-secondary text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
									)}
								>
									{CATEGORY_NAMES[cat]?.title ?? cat}
								</button>
							))}
						</div>
					)}
				</div>

				{isLoading && <SkeletonGrid count={6} className="gap-3 sm:grid-cols-2 lg:grid-cols-3" itemClassName="h-28 w-full rounded-xl" />}

				{!(isLoading || isError) && filteredStats.length === 0 && (
					<div className="border-border/70 bg-card/30 flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
						<Cog className="text-muted-foreground mb-2 size-8" />
						<p className="text-foreground text-xs font-medium">{m.admin_worker_no_workers()}</p>
						<p className="text-muted-foreground mt-0.5 text-xs">{m.admin_worker_change_search_hint()}</p>
					</div>
				)}

				{/* Worker Queues Cards Grid */}
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{filteredStats.map((ws) => (
						<WorkerQueueCard key={ws.id} worker={ws} />
					))}
				</div>
			</div>
		</AdminSection>
	);
}
