import { CalendarRange, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { m } from "@/paraglide/messages";
import { FilterRangeSliders } from "./filter-range-sliders";
import { FilterSortSelects } from "./filter-sort-selects";
import type { LibraryRatingFilter, LibrarySortBy, LibrarySortOrder, LibraryWatchedFilter } from "./use-library-logic";

export function FilterAdvancedSection({
	range,
	setRange,
	yearRange,
	sortBy,
	setSortBy,
	sortOrder,
	setSortOrder,
	durationRange,
	setDurationRange,
	durationBounds,
	watchedStatus,
	setWatchedStatus,
	userRating,
	setUserRating,
}: {
	range: [number, number];
	setRange: (value: [number, number]) => void;
	yearRange: { min: number; max: number };
	sortBy: LibrarySortBy;
	setSortBy: (value: LibrarySortBy) => void;
	sortOrder: LibrarySortOrder;
	setSortOrder: (value: LibrarySortOrder) => void;
	durationRange: [number, number];
	setDurationRange: (value: [number, number]) => void;
	durationBounds: { min: number; max: number };
	watchedStatus: LibraryWatchedFilter;
	setWatchedStatus: (value: LibraryWatchedFilter) => void;
	userRating: LibraryRatingFilter;
	setUserRating: (value: LibraryRatingFilter) => void;
}) {
	const handleReset = () => {
		setRange([yearRange.min, yearRange.max]);
		setDurationRange([durationBounds.min, durationBounds.max]);
		setWatchedStatus("all");
		setUserRating("all");
		setSortBy("title");
		setSortOrder("asc");
	};

	return (
		<div className="border-border border-t pt-5">
			<div className="mb-5 flex items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<CalendarRange className="size-4 shrink-0 text-primary" aria-hidden="true" />
					<p className="font-semibold text-sm">{m.web_advanced_filters()}</p>
				</div>
				<Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={handleReset}>
					<RotateCcw data-icon="inline-start" aria-hidden="true" />
					{m.web_filters_reset()}
				</Button>
			</div>

			<FieldGroup className="gap-5">
				<FilterSortSelects
					sortBy={sortBy}
					setSortBy={setSortBy}
					sortOrder={sortOrder}
					setSortOrder={setSortOrder}
					watchedStatus={watchedStatus}
					setWatchedStatus={setWatchedStatus}
					userRating={userRating}
					setUserRating={setUserRating}
				/>

				<FilterRangeSliders
					range={range}
					setRange={setRange}
					yearRange={yearRange}
					durationRange={durationRange}
					setDurationRange={setDurationRange}
					durationBounds={durationBounds}
				/>
			</FieldGroup>
		</div>
	);
}
