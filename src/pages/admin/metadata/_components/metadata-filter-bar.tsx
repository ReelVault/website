import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { ADMIN_METADATA_SORTS, type AdminMetadataSort, type AdminMetadataTypeFilter } from "@/client/hooks/use-admin-metadata";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdminSearch } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

export type MediaFilter = "all" | "low_confidence" | "with_media" | "without_media" | "missing_translation";

function isValidMediaFilter(val: unknown): val is MediaFilter {
	return val === "all" || val === "low_confidence" || val === "with_media" || val === "without_media" || val === "missing_translation";
}

const SORT_LABELS: Record<AdminMetadataSort, () => string> = {
	recent: () => m.admin_metadata_sort_recent(),
	title: () => m.admin_metadata_sort_by_title(),
	year: () => m.admin_metadata_sort_year(),
	worstMatch: () => m.admin_metadata_sort_worst_match(),
};

const TYPE_LABELS: Record<AdminMetadataTypeFilter | "all", () => string> = {
	all: () => m.admin_metadata_type_all(),
	movie: () => m.common_movie_word(),
	tv_show: () => m.web_watchlist_stats_series(),
};

const ADMIN_METADATA_SORT_OPTIONS: readonly AdminMetadataSort[] = ["recent", "title", "year", "worstMatch"];

export function isAdminMetadataSort(value: unknown): value is AdminMetadataSort {
	return typeof value === "string" && Object.hasOwn(ADMIN_METADATA_SORTS, value);
}

export function isAdminMetadataType(value: unknown): value is AdminMetadataTypeFilter {
	return value === "movie" || value === "tv_show";
}

interface MetadataFilterBarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	mediaFilter: MediaFilter;
	onFilterChange: (value: MediaFilter) => void;
	typeFilter: AdminMetadataTypeFilter | undefined;
	onTypeChange: (value: AdminMetadataTypeFilter | undefined) => void;
	sort: AdminMetadataSort;
	onSortChange: (value: AdminMetadataSort) => void;
}

export function MetadataFilterBar({
	searchQuery,
	onSearchChange,
	mediaFilter,
	onFilterChange,
	typeFilter,
	onTypeChange,
	sort,
	onSortChange,
}: MetadataFilterBarProps) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex w-full flex-col gap-2 sm:max-w-xl sm:flex-row sm:items-center">
				<AdminSearch
					value={searchQuery}
					onChange={onSearchChange}
					placeholder={m.admin_metadata_filter_placeholder()}
					className="w-full sm:max-w-xs"
				/>
				<Select value={typeFilter ?? "all"} onValueChange={(value) => onTypeChange(isAdminMetadataType(value) ? value : undefined)}>
					<SelectTrigger className="h-10 w-full sm:h-9 sm:w-32" aria-label={m.admin_metadata_type_filter_label()}>
						<SelectValue>{TYPE_LABELS[typeFilter ?? "all"]()}</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="all">{TYPE_LABELS.all()}</SelectItem>
							<SelectItem value="movie">{TYPE_LABELS.movie()}</SelectItem>
							<SelectItem value="tv_show">{TYPE_LABELS.tv_show()}</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
				<Select value={sort} onValueChange={(value) => isAdminMetadataSort(value) && onSortChange(value)}>
					<SelectTrigger className="h-10 w-full sm:h-9 sm:w-44" aria-label={m.admin_metadata_sort_label()}>
						<SelectValue>{SORT_LABELS[sort]()}</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{ADMIN_METADATA_SORT_OPTIONS.map((option) => (
								<SelectItem key={option} value={option}>
									{SORT_LABELS[option]()}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center gap-2">
				<span className="text-muted-foreground text-xs">{m.admin_metadata_filter_label()}</span>
				<ToggleGroup
					multiple={false}
					value={[mediaFilter]}
					onValueChange={(val) => {
						const first = val[0];
						if (isValidMediaFilter(first)) {
							onFilterChange(first);
						}
					}}
					variant="outline"
					size="sm"
					className="flex-wrap"
				>
					<ToggleGroupItem value="all" className="text-xs">
						{m.common_all()}
					</ToggleGroupItem>
					<ToggleGroupItem value="low_confidence" className="gap-1 text-xs">
						<AlertTriangle className="size-3 text-warning" />
						{m.admin_metadata_low_recognition()}
					</ToggleGroupItem>
					<ToggleGroupItem value="missing_translation" className="gap-1 text-xs">
						<AlertTriangle className="size-3 text-warning" />
						{m.admin_metadata_fallback_chip()}
					</ToggleGroupItem>
					<ToggleGroupItem value="with_media" className="gap-1 text-xs">
						<CheckCircle2 className="size-3 text-success" />
						{m.admin_metadata_with_files_chip()}
					</ToggleGroupItem>
					<ToggleGroupItem value="without_media" className="gap-1 text-xs">
						<AlertTriangle className="size-3 text-destructive" />
						{m.admin_metadata_orphan_chip()}
					</ToggleGroupItem>
				</ToggleGroup>
			</div>
		</div>
	);
}
