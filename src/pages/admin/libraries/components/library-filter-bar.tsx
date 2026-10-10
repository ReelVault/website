import { Clapperboard } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdminSearch } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

export type LibraryTypeFilter = "all" | "movies" | "tv_shows";

export const LIBRARY_SORT_OPTIONS = ["name", "newest", "files", "size"] as const;

export type LibrarySortOption = (typeof LIBRARY_SORT_OPTIONS)[number];

const SORT_LABELS: Record<LibrarySortOption, () => string> = {
	name: () => m.admin_libraries_sort_name(),
	newest: () => m.admin_libraries_sort_newest(),
	files: () => m.admin_libraries_sort_files(),
	size: () => m.admin_libraries_sort_size(),
};

const isSortOption = (value: unknown): value is LibrarySortOption => typeof value === "string" && Object.hasOwn(SORT_LABELS, value);

interface LibraryFilterBarProps {
	typeFilter: LibraryTypeFilter;
	onTypeFilterChange: (type: LibraryTypeFilter) => void;
	search: string;
	onSearchChange: (search: string) => void;
	sort: LibrarySortOption;
	onSortChange: (sort: LibrarySortOption) => void;
	totalCount: number;
	movieCount: number;
	tvCount: number;
}

export function LibraryFilterBar({
	typeFilter,
	onTypeFilterChange,
	search,
	onSearchChange,
	sort,
	onSortChange,
	totalCount,
	movieCount,
	tvCount,
}: LibraryFilterBarProps) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<ToggleGroup
				multiple={false}
				value={[typeFilter]}
				onValueChange={(val) => {
					const selected = val[0];
					if (selected === "all" || selected === "movies" || selected === "tv_shows") {
						onTypeFilterChange(selected);
					}
				}}
				variant="outline"
				size="sm"
				className="justify-start"
			>
				<ToggleGroupItem value="all" aria-label={m.admin_libraries_filter_all()} className="gap-1.5 px-3">
					<span>{m.common_all()}</span>
					<span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-muted-foreground text-xs">{totalCount}</span>
				</ToggleGroupItem>
				<ToggleGroupItem value="movies" aria-label={m.admin_libraries_filter_movies()} className="gap-1.5 px-3">
					<Clapperboard className="size-3.5 text-primary" />
					<span>{m.web_watchlist_stats_movies()}</span>
					<span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-muted-foreground text-xs">{movieCount}</span>
				</ToggleGroupItem>
				<ToggleGroupItem value="tv_shows" aria-label={m.admin_libraries_filter_series()} className="gap-1.5 px-3">
					<span>{m.web_watchlist_stats_series()}</span>
					<span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-muted-foreground text-xs">{tvCount}</span>
				</ToggleGroupItem>
			</ToggleGroup>

			<div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row sm:items-center">
				<AdminSearch
					value={search}
					onChange={onSearchChange}
					placeholder={m.admin_libraries_search_by_name_or_path()}
					className="w-full sm:max-w-xs"
				/>
				<Select value={sort} onValueChange={(value) => isSortOption(value) && onSortChange(value)}>
					<SelectTrigger className="h-9 w-full sm:w-40" aria-label={m.admin_libraries_sort_label()}>
						<SelectValue>{SORT_LABELS[sort]()}</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{LIBRARY_SORT_OPTIONS.map((option) => (
								<SelectItem key={option} value={option}>
									{SORT_LABELS[option]()}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
