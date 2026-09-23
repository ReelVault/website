import { cn } from "cn";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { m } from "@/paraglide/messages";

type StatusFilterType = "all" | "pending" | "running" | "completed" | "failed" | "cancelled";

interface OperationFilterBarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	statusFilter: StatusFilterType;
	onStatusFilterChange: (status: StatusFilterType) => void;
	summary: {
		total: number;
		running: number;
		pending: number;
		completed: number;
		failed: number;
	};
}

export function OperationFilterBar({ searchQuery, onSearchChange, statusFilter, onStatusFilterChange, summary }: OperationFilterBarProps) {
	const filterTabs = [
		{ value: "all", label: m.common_all(), count: summary.total },
		{ value: "running", label: m.admin_worker_running_badge(), count: summary.running },
		{ value: "pending", label: m.admin_workers_queued(), count: summary.pending },
		{ value: "completed", label: m.admin_worker_finished(), count: summary.completed },
		{ value: "failed", label: m.admin_worker_error(), count: summary.failed },
	] as const;

	return (
		<div className="flex flex-wrap items-center justify-between gap-2.5 pt-3">
			<div className="relative flex-1 sm:max-w-xs">
				<Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="text"
					placeholder={m.admin_workers_scheduled_filters_placeholder()}
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="h-8 bg-background/60 pl-8 text-xs"
				/>
			</div>

			<div className="flex flex-wrap items-center gap-1">
				{filterTabs.map((f) => (
					<button
						key={f.value}
						type="button"
						onClick={() => onStatusFilterChange(f.value)}
						className={cn(
							"inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-[11px] transition-[border-color,background-color,color,box-shadow]",
							statusFilter === f.value
								? "bg-secondary text-foreground shadow-xs"
								: "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
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
