import { SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useOverlayHistory } from "@/hooks/use-overlay-history";
import { m } from "@/paraglide/messages";
import { FilterAdvancedSection } from "./filter-advanced-section";
import { SearchInput } from "./search-input";
import type { LibraryRatingFilter, LibrarySortBy, LibrarySortOrder, LibraryWatchedFilter } from "./use-library-logic";

export function LibraryFilterSection(props: {
	searchTerm: string;
	setSearchTerm: (value: string) => void;
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
	const { searchTerm, setSearchTerm } = props;
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
	useOverlayHistory(isMobileFiltersOpen, () => setIsMobileFiltersOpen(false));
	const sectionRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
			if (e.target instanceof Node && sectionRef.current?.contains(e.target)) return;

			if (e.target instanceof Node && document.querySelector("[role=listbox]")?.contains(e.target)) return;

			setShowAdvanced(false);
		};

		if (showAdvanced) {
			document.addEventListener("mousedown", handleOutsideClick);
			document.addEventListener("touchstart", handleOutsideClick, { passive: true });
		}

		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
			document.removeEventListener("touchstart", handleOutsideClick);
		};
	}, [showAdvanced, setShowAdvanced]);

	const filterContent = (
		<FilterAdvancedSection
			range={props.range}
			setRange={props.setRange}
			yearRange={props.yearRange}
			sortBy={props.sortBy}
			setSortBy={props.setSortBy}
			sortOrder={props.sortOrder}
			setSortOrder={props.setSortOrder}
			durationRange={props.durationRange}
			setDurationRange={props.setDurationRange}
			durationBounds={props.durationBounds}
			watchedStatus={props.watchedStatus}
			setWatchedStatus={props.setWatchedStatus}
			userRating={props.userRating}
			setUserRating={props.setUserRating}
		/>
	);

	return (
		<div ref={sectionRef} className="relative mx-auto max-w-4xl px-4 sm:px-6">
			<div className="cinema-surface p-3 sm:p-4">
				<div className="flex flex-col gap-4">
					<SearchInput value={searchTerm} onChange={setSearchTerm} />

					<div className="flex items-center justify-between gap-3">
						<Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
							<SheetTrigger
								className="lg:hidden"
								render={<Button variant="outline" className="min-h-11 gap-2" onClick={() => setShowAdvanced(true)} />}
							>
								<SlidersHorizontal data-icon="inline-start" aria-hidden="true" />
								{m.web_open_filters()}
							</SheetTrigger>
							<SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl lg:hidden">
								<SheetHeader>
									<SheetTitle>{m.web_filters_heading()}</SheetTitle>
									<SheetDescription>{m.web_sort_year_range_hint()}</SheetDescription>
								</SheetHeader>
								<div className="px-4 pb-4">{filterContent}</div>
							</SheetContent>
						</Sheet>

						<Button
							variant={showAdvanced ? "default" : "outline"}
							onClick={() => setShowAdvanced(!showAdvanced)}
							className="hidden min-h-11 gap-2 lg:inline-flex"
						>
							<SlidersHorizontal data-icon="inline-start" aria-hidden="true" />
							{showAdvanced ? m.web_hide_filters() : m.web_advanced_filters()}
						</Button>
						<p className="text-muted-foreground text-sm">{m.web_results_auto_update()}</p>
					</div>

					<Collapsible open={showAdvanced}>
						<CollapsibleContent className="hidden overflow-hidden lg:block">{filterContent}</CollapsibleContent>
					</Collapsible>
				</div>
			</div>
		</div>
	);
}
