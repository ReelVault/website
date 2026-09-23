import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { m } from "@/paraglide/messages";
import type { LibraryRatingFilter, LibrarySortBy, LibrarySortOrder, LibraryWatchedFilter } from "./use-library-logic";

const LIBRARY_SORT_BY_VALUES: readonly LibrarySortBy[] = ["title", "sortTitle", "releaseDate", "popularity", "createdAt", "updatedAt"];
const LIBRARY_SORT_ORDER_VALUES: readonly LibrarySortOrder[] = ["asc", "desc"];
const LIBRARY_WATCHED_VALUES: readonly LibraryWatchedFilter[] = ["all", "watched", "unwatched", "in_progress"];
const LIBRARY_RATING_VALUES: readonly LibraryRatingFilter[] = ["all", "liked", "disliked", "unrated"];

const isOneOf = <T extends string>(values: readonly T[], value: unknown): value is T => values.some((candidate) => candidate === value);

interface FilterSortSelectsProps {
	sortBy: LibrarySortBy;
	setSortBy: (value: LibrarySortBy) => void;
	sortOrder: LibrarySortOrder;
	setSortOrder: (value: LibrarySortOrder) => void;
	watchedStatus: LibraryWatchedFilter;
	setWatchedStatus: (value: LibraryWatchedFilter) => void;
	userRating: LibraryRatingFilter;
	setUserRating: (value: LibraryRatingFilter) => void;
}

export function FilterSortSelects({
	sortBy,
	setSortBy,
	sortOrder,
	setSortOrder,
	watchedStatus,
	setWatchedStatus,
	userRating,
	setUserRating,
}: FilterSortSelectsProps) {
	return (
		<>
			<div className="grid gap-5 sm:grid-cols-2">
				<Field>
					<FieldLabel htmlFor="library-sort-by">{m.web_library_sorting_label()}</FieldLabel>
					<Select
						value={sortBy}
						onValueChange={(value) => {
							if (isOneOf(LIBRARY_SORT_BY_VALUES, value)) setSortBy(value);
						}}
					>
						<SelectTrigger id="library-sort-by" className="h-10 w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="title">{m.admin_analytics_title_column()}</SelectItem>
								<SelectItem value="sortTitle">{m.web_title_custom_order()}</SelectItem>
								<SelectItem value="releaseDate">{m.common_release_year()}</SelectItem>
								<SelectItem value="popularity">{m.admin_metadata_popularity()}</SelectItem>
								<SelectItem value="createdAt">{m.admin_media_sort_recently_added()}</SelectItem>
								<SelectItem value="updatedAt">{m.admin_media_sort_recently_updated()}</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
					<FieldDescription>{m.web_select_sort_criterion()}</FieldDescription>
				</Field>
				<Field>
					<FieldLabel htmlFor="library-sort-order">{m.web_sort_order_label()}</FieldLabel>
					<Select
						value={sortOrder}
						onValueChange={(value) => {
							if (isOneOf(LIBRARY_SORT_ORDER_VALUES, value)) setSortOrder(value);
						}}
					>
						<SelectTrigger id="library-sort-order" className="h-10 w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="asc">{m.web_ascending()}</SelectItem>
								<SelectItem value="desc">{m.web_descending()}</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
					<FieldDescription>{m.web_sort_az_hint()}</FieldDescription>
				</Field>
			</div>

			<div className="grid gap-5 sm:grid-cols-2">
				<Field>
					<FieldLabel htmlFor="library-watched-status">{m.web_watch_status_label()}</FieldLabel>
					<Select
						value={watchedStatus}
						onValueChange={(value) => {
							if (isOneOf(LIBRARY_WATCHED_VALUES, value)) setWatchedStatus(value);
						}}
					>
						<SelectTrigger id="library-watched-status" className="h-10 w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="all">{m.common_all()}</SelectItem>
								<SelectItem value="unwatched">{m.web_watched_status_unwatched()}</SelectItem>
								<SelectItem value="in_progress">{m.web_watched_status_in_progress()}</SelectItem>
								<SelectItem value="watched">{m.web_watched_status_watched()}</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
					<FieldDescription>{m.web_profile_history_note()}</FieldDescription>
				</Field>
				<Field>
					<FieldLabel htmlFor="library-user-rating">{m.web_my_rating()}</FieldLabel>
					<Select
						value={userRating}
						onValueChange={(value) => {
							if (isOneOf(LIBRARY_RATING_VALUES, value)) setUserRating(value);
						}}
					>
						<SelectTrigger id="library-user-rating" className="h-10 w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="all">{m.common_all()}</SelectItem>
								<SelectItem value="liked">{m.web_rating_liked()}</SelectItem>
								<SelectItem value="disliked">{m.web_rating_disliked()}</SelectItem>
								<SelectItem value="unrated">{m.web_no_rating()}</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
					<FieldDescription>{m.web_filter_custom_rating()}</FieldDescription>
				</Field>
			</div>
		</>
	);
}
