import { RefreshCw } from "lucide-react";
import type { AdminMediaFileSortBy } from "@/client/hooks/use-admin-media";
import { AsyncButton } from "@/components/async-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminSearch } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

export type SortOrder = "asc" | "desc";

export type SortOptionValue = `${AdminMediaFileSortBy}:${SortOrder}`;

export const SORT_OPTIONS: ReadonlyArray<{ value: SortOptionValue; label: string }> = [
	{ value: "updatedAt:desc", label: m.admin_media_sort_recently_updated() },
	{ value: "createdAt:desc", label: m.admin_media_sort_recently_added() },
	{ value: "fileName:asc", label: m.admin_media_sort_name_az() },
	{ value: "size:desc", label: m.admin_media_largest_files() },
	{ value: "size:asc", label: m.admin_media_sort_smallest() },
];

export function isSortOptionValue(value: string): value is SortOptionValue {
	return SORT_OPTIONS.some((option) => option.value === value);
}

interface MediaSearchSortBarProps {
	viewMode: "all" | "audit";
	searchQuery: string;
	onSearchChange: (value: string) => void;
	sortOption: SortOptionValue;
	onSortChange: (value: string | null) => void;
	isRefreshingAll: boolean;
	onRefreshAll: () => void;
}

export function MediaSearchSortBar({
	viewMode,
	searchQuery,
	onSearchChange,
	sortOption,
	onSortChange,
	isRefreshingAll,
	onRefreshAll,
}: MediaSearchSortBarProps) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			{viewMode === "all" && (
				<>
					<AdminSearch
						value={searchQuery}
						onChange={onSearchChange}
						placeholder={m.admin_media_search_by_file_path_id()}
						className="w-full sm:max-w-xs"
					/>
					<Select value={sortOption} onValueChange={onSortChange}>
						<SelectTrigger className="w-full min-w-0 bg-card text-xs sm:w-52 sm:flex-none" aria-label={m.admin_media_file_sorting()}>
							<SelectValue placeholder={m.web_library_sorting_label()} />
						</SelectTrigger>
						<SelectContent>
							{SORT_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</>
			)}
			<AsyncButton
				type="button"
				variant="outline"
				size="default"
				isPending={isRefreshingAll}
				pendingLabel="Zlecanie…"
				onClick={onRefreshAll}
				className="gap-2 shadow-xs"
			>
				<RefreshCw className="size-4" />
				<span>{m.admin_media_refresh_all()}</span>
			</AsyncButton>
		</div>
	);
}
