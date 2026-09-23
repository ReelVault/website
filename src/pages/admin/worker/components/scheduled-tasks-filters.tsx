import { cn } from "cn";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { m } from "@/paraglide/messages";

interface ScheduledTasksFiltersProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	categoryFilter: string;
	onCategoryFilterChange: (filter: string) => void;
	totalCount: number;
	scheduledCount: number;
	activeCount: number;
}

export function ScheduledTasksFilters({
	searchQuery,
	onSearchChange,
	categoryFilter,
	onCategoryFilterChange,
	totalCount,
	scheduledCount,
	activeCount,
}: ScheduledTasksFiltersProps) {
	const filterButtons = [
		{ id: "all", label: m.common_all(), count: totalCount },
		{ id: "scheduled", label: m.admin_workers_scheduled_filter(), count: scheduledCount },
		{ id: "active", label: m.admin_workers_active_now(), count: activeCount },
	] as const;

	return (
		<div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/40 p-3.5 sm:flex-row sm:items-center sm:justify-between">
			<div className="relative flex-1 sm:max-w-md">
				<Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="text"
					placeholder={m.admin_workers_jobs_search_placeholder()}
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="h-8.5 bg-background/60 pr-3 pl-8 text-xs"
				/>
			</div>

			{/* Quick status filters */}
			<div className="flex flex-wrap items-center gap-1.5">
				{filterButtons.map((f) => (
					<button
						key={f.id}
						type="button"
						onClick={() => onCategoryFilterChange(f.id)}
						className={cn(
							"inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 font-medium text-xs transition-[border-color,background-color,color,box-shadow]",
							categoryFilter === f.id
								? "border-border bg-secondary text-foreground shadow-xs"
								: "border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground",
						)}
					>
						<span>{f.label}</span>
						<span className="font-mono text-[10px] opacity-80">{m.admin_worker_filter_count({ count: f.count })}</span>
					</button>
				))}
			</div>
		</div>
	);
}
