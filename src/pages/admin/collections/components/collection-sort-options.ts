import type { CollectionSortMode, MetadataSorting } from "@reelvault/sdk";
import { m } from "@/paraglide/messages";

export const COLLECTION_SORT_OPTIONS: Array<{
	value: CollectionSortMode;
	readonly label: string;
	readonly description: string;
}> = [
	{
		value: "release_date",
		get label() {
			return m.admin_collections_release_date_sort();
		},
		get description() {
			return m.admin_collections_oldest_to_newest();
		},
	},
	{
		value: "manual",
		get label() {
			return m.admin_collections_manual_order();
		},
		get description() {
			return m.admin_collections_manual_order_description();
		},
	},
	{
		value: "alphabetical",
		get label() {
			return m.admin_collections_alphabetical_order();
		},
		get description() {
			return m.admin_collections_sorted_by_name();
		},
	},
	{
		value: "recently_added",
		get label() {
			return m.admin_media_sort_recently_added();
		},
		get description() {
			return m.admin_collections_newest_first_description();
		},
	},
];

export const COLLECTION_SORT_LABELS: Record<CollectionSortMode, string> = {
	get release_date() {
		return m.admin_collections_release_date_sort();
	},
	get manual() {
		return m.admin_collections_manual_order();
	},
	get alphabetical() {
		return m.admin_collections_alphabetical_order();
	},
	get recently_added() {
		return m.admin_media_sort_recently_added();
	},
};

export function getCollectionSortConfig(mode: CollectionSortMode): {
	sortBy: NonNullable<MetadataSorting["sortBy"]>;
	sortOrder: "asc" | "desc";
} {
	if (mode === "manual") return { sortBy: "collectionOrder", sortOrder: "asc" };

	if (mode === "alphabetical") return { sortBy: "title", sortOrder: "asc" };

	if (mode === "recently_added") return { sortBy: "createdAt", sortOrder: "desc" };

	return { sortBy: "releaseDate", sortOrder: "asc" };
}
