/** Availability state a search-extending plugin reports for one title. */
export type PluginSearchItemState = "available" | "pending" | "approved" | "in_progress" | "rejected" | "none";

/** A title already in the request pipeline must not be requested again. */
export function isPluginSearchItemRequested(state: PluginSearchItemState): boolean {
	return state === "pending" || state === "approved" || state === "in_progress";
}

/** Only a missing or previously rejected title can be requested. */
export function isPluginSearchItemRequestable(state: PluginSearchItemState): boolean {
	return state === "none" || state === "rejected";
}
