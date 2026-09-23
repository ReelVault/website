import { cn } from "cn";
import { ListTree, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { WorkerOperation } from "reelvault-sdk";
import { useAdminOperationJobs } from "@/client/hooks/use-admin-jobs";
import { AppErrorState } from "@/components/app-states";
import {
	FullscreenDialog,
	FullscreenDialogContent,
	FullscreenDialogDescription,
	FullscreenDialogHeader,
	FullscreenDialogTitle,
} from "@/components/fullscreen-dialog";
import { SimplePagination } from "@/components/simple-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { OperationFilterBar } from "./operations/operation-filter-bar";
import { OperationItemRow } from "./operations/operation-item-row";
import { formatDate, getWorkerMeta, WORKER_ITEMS_PAGE_SIZE } from "./worker-utils";

interface WorkerOperationDialogProps {
	operation: WorkerOperation | null;
	workerTimeouts: Map<string, number>;
	isOpen: boolean;
	onClose: () => void;
	onRefresh?: () => void;
}

export function WorkerOperationDialog({ operation, workerTimeouts, isOpen, onClose, onRefresh }: WorkerOperationDialogProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce({ value: searchQuery, delay: 300 });
	const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "running" | "completed" | "failed" | "cancelled">("all");
	const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set());

	const { items, summary, totalPages, total, isLoading, isError, refetch, query } = useAdminOperationJobs(
		operation?.id,
		{
			page: currentPage,
			limit: WORKER_ITEMS_PAGE_SIZE,
			status: statusFilter === "all" ? undefined : statusFilter,
			search: debouncedSearch || undefined,
		},
		isOpen,
	);

	const toggleExpand = (id: string) => {
		setExpandedItemIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}

			return next;
		});
	};

	const handleRefresh = () => {
		detach(refetch());
		onRefresh?.();
	};

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setCurrentPage(1);
	};

	const handleStatusFilterChange = (status: typeof statusFilter) => {
		setStatusFilter(status);
		setCurrentPage(1);
	};

	if (!operation) return null;

	const meta = getWorkerMeta(operation.type);

	return (
		<FullscreenDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<FullscreenDialogContent className="flex max-h-[90vh] w-[95vw] max-w-5xl flex-col overflow-hidden border-border/60 bg-card p-6 shadow-2xl">
				{/* Dialog Header */}
				<FullscreenDialogHeader className="border-border/50 border-b pb-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-3">
							<div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
								<ListTree className="size-5" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<FullscreenDialogTitle className="font-bold text-base text-foreground tracking-tight">{meta.title}</FullscreenDialogTitle>
									<Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
										{operation.type}
									</Badge>
									<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
										{m.admin_worker_jobs_total({ count: summary.total })}
									</Badge>
								</div>
								<FullscreenDialogDescription className="mt-0.5 font-mono text-muted-foreground text-xs">
									{m.admin_worker_operation_id_line({
										id: operation.id,
										created: formatDate(operation.createdAt),
									})}
								</FullscreenDialogDescription>
							</div>
						</div>

						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleRefresh}
							disabled={isLoading}
							className="h-8 shrink-0 gap-1.5 border-border/60 text-muted-foreground text-xs hover:bg-secondary hover:text-foreground"
						>
							<RotateCcw className={cn("size-3.5", isLoading && "animate-spin text-primary")} />
							<span>{m.common_refresh()}</span>
						</Button>
					</div>

					{/* Search & Filter Bar */}
					<OperationFilterBar
						searchQuery={searchQuery}
						onSearchChange={handleSearchChange}
						statusFilter={statusFilter}
						onStatusFilterChange={handleStatusFilterChange}
						summary={summary}
					/>
				</FullscreenDialogHeader>

				{/* Dialog Content List */}
				<div className="flex flex-1 flex-col gap-4 overflow-y-auto py-3 pr-1">
					{isLoading && (
						<div className="flex flex-col gap-2.5">
							<Skeleton className="h-12 w-full rounded-lg" />
							<Skeleton className="h-12 w-full rounded-lg" />
							<Skeleton className="h-12 w-full rounded-lg" />
							<Skeleton className="h-12 w-full rounded-lg" />
						</div>
					)}

					{!isLoading && isError && <AppErrorState error={query.error} onRetry={() => detach(refetch())} />}

					{!(isLoading || isError) && items.length === 0 && (
						<div className="flex flex-col items-center justify-center rounded-xl border border-border/70 border-dashed bg-card/30 p-10 text-center">
							<p className="font-medium text-foreground text-xs">{m.admin_worker_no_matching_jobs()}</p>
							<p className="mt-0.5 text-[11px] text-muted-foreground">
								{total === 0 ? m.admin_worker_no_registered_items() : m.admin_worker_no_jobs_match()}
							</p>
						</div>
					)}

					{!(isLoading || isError) && items.length > 0 && (
						<div className="flex flex-col gap-3">
							<div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
								<Table>
									<TableHeader>
										<TableRow className="border-border/60 border-b bg-muted/40 hover:bg-muted/40">
											<TableHead className="w-8" />
											<TableHead className="font-semibold text-foreground text-xs">{m.admin_workers_worker_type()}</TableHead>
											<TableHead className="font-semibold text-foreground text-xs">{m.common_status()}</TableHead>
											<TableHead className="font-semibold text-foreground text-xs">{m.admin_worker_stage_attempt()}</TableHead>
											<TableHead className="font-semibold text-foreground text-xs">{m.components_duration_label()}</TableHead>
											<TableHead className="w-24 text-right" />
										</TableRow>
									</TableHeader>
									<TableBody className="divide-y divide-border/40">
										{items.map((item) => (
											<OperationItemRow
												key={item.id}
												item={item}
												timeoutMs={workerTimeouts.get(item.workerId)}
												isExpanded={expandedItemIds.has(item.id)}
												onToggleExpand={() => toggleExpand(item.id)}
											/>
										))}
									</TableBody>
								</Table>
							</div>

							{totalPages > 1 && (
								<div className="pt-2">
									<SimplePagination
										variant="admin"
										currentPage={currentPage}
										totalPages={totalPages}
										isLoading={isLoading}
										onPageChange={setCurrentPage}
									/>
								</div>
							)}
						</div>
					)}
				</div>
			</FullscreenDialogContent>
		</FullscreenDialog>
	);
}
