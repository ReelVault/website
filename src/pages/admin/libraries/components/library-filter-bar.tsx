import { Clapperboard } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdminSearch } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

export type LibraryTypeFilter = "all" | "movies" | "tv_shows";

interface LibraryFilterBarProps {
	typeFilter: LibraryTypeFilter;
	onTypeFilterChange: (type: LibraryTypeFilter) => void;
	search: string;
	onSearchChange: (search: string) => void;
	totalCount: number;
	movieCount: number;
	tvCount: number;
}

export function LibraryFilterBar({
	typeFilter,
	onTypeFilterChange,
	search,
	onSearchChange,
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
					<span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-[11px] text-muted-foreground">{totalCount}</span>
				</ToggleGroupItem>
				<ToggleGroupItem value="movies" aria-label={m.admin_libraries_filter_movies()} className="gap-1.5 px-3">
					<Clapperboard className="size-3.5 text-primary" />
					<span>{m.web_watchlist_stats_movies()}</span>
					<span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-[11px] text-muted-foreground">{movieCount}</span>
				</ToggleGroupItem>
				<ToggleGroupItem value="tv_shows" aria-label={m.admin_libraries_filter_series()} className="gap-1.5 px-3">
					<span>{m.web_watchlist_stats_series()}</span>
					<span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-[11px] text-muted-foreground">{tvCount}</span>
				</ToggleGroupItem>
			</ToggleGroup>

			<AdminSearch
				value={search}
				onChange={onSearchChange}
				placeholder={m.admin_libraries_search_by_name_or_path()}
				className="w-full sm:max-w-xs"
			/>
		</div>
	);
}
