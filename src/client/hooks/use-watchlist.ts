import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { watchlistFields } from "../utils/fields";
import { metadataKeys, watchlistKeys } from "../utils/query-keys";
import { useMetadataWatchlist } from "./use-metadata-queries";

export const watchlistQueryOptions = () =>
	queryOptions({
		queryKey: watchlistKeys.items(),
		queryFn: () => reelvault.me.getWatchlist({ fields: watchlistFields }),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 30,
	});

export function useWatchlist() {
	const watchlistQuery = useQuery(watchlistQueryOptions());

	const watchlist = watchlistQuery.data ?? { data: [], total: 0, page: 1, limit: 0, totalPages: 0 };
	const metadataIds = watchlist.data.map((item) => item.metadataId);
	const metadataQuery = useMetadataWatchlist(metadataIds);

	return {
		watchlist,
		metadata: metadataQuery.data?.data ?? [],
		isLoading: watchlistQuery.isLoading || metadataQuery.isLoading,
		error: watchlistQuery.error ?? metadataQuery.error,
		refetch: async () => {
			await Promise.all([watchlistQuery.refetch(), metadataQuery.refetch()]);
		},
	};
}

export type WatchlistItem = ReturnType<typeof useWatchlist>["metadata"][number];

// --- Batchowany status watchlisty ---
// Cards (library grid, rails, collections) mount at once and each
// pushes its id into a set; the first queryFn after a 25 ms window fires ONE request
// batched (GET /me/watchlist/statuses), and the result feeds every per-card
// queryFn. Result: 1 request for a full grid instead of N.

const BATCH_WINDOW_MS = 25;
const BATCH_MAX_IDS = 500;

let pendingStatusIds = new Set<string>();
let statusBatchPromise: Promise<Map<string, boolean>> | null = null;

/** Clears the module-level batch state on logout / profile switch. */
export function resetWatchlistBatch(): void {
	pendingStatusIds = new Set();
	statusBatchPromise = null;
}

async function fetchStatusBatch(ids: string[]): Promise<Map<string, boolean>> {
	if (ids.length === 0) return new Map();

	const response = await reelvault.me.getWatchlistStatuses(ids);

	return new Map(response.statuses.map((status) => [status.metadataId, status.inWatchlist]));
}

/** Chunk oversized batches instead of silently dropping the overflow (cards defaulted to false). */
async function fetchStatusBatches(ids: string[]): Promise<Map<string, boolean>> {
	const merged = new Map<string, boolean>();
	for (let index = 0; index < ids.length; index += BATCH_MAX_IDS) {
		const part = await fetchStatusBatch(ids.slice(index, index + BATCH_MAX_IDS));
		for (const [metadataId, inWatchlist] of part) merged.set(metadataId, inWatchlist);
	}

	return merged;
}

function scheduleStatusBatch(): Promise<Map<string, boolean>> {
	if (statusBatchPromise) return statusBatchPromise;

	statusBatchPromise = new Promise<Map<string, boolean>>((resolve) => {
		setTimeout(() => {
			const ids = [...pendingStatusIds];
			pendingStatusIds = new Set();
			statusBatchPromise = null;
			// Resolving with the inner promise adopts its state, so rejections keep
			// propagating to every waiter exactly as before.
			resolve(fetchStatusBatches(ids));
		}, BATCH_WINDOW_MS);
	});

	return statusBatchPromise;
}

export function useIsOnWatchlist(metadataId: string) {
	// Server-owned boolean (GET /me/watchlist/statuses batch / GET /me/watchlist/:id) —
	// fetching the whole watchlist and matching client-side misses items beyond the page limit.
	const query = useQuery({
		queryKey: watchlistKeys.status(metadataId),
		queryFn: async () => {
			pendingStatusIds.add(metadataId);
			const statuses = await scheduleStatusBatch();

			return { inWatchlist: statuses.get(metadataId) ?? false };
		},
		enabled: Boolean(metadataId),
		staleTime: 30_000,
		select: (response) => response.inWatchlist,
	});

	return {
		isOnWatchlist: query.data ?? false,
		isLoading: query.isLoading,
	};
}

export function useWatchlistToggle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (metadataId: string) => reelvault.me.toggleWatchlist(metadataId),
		onSettled: async (_, __, metadataId) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: watchlistKeys.items() }),
				queryClient.invalidateQueries({ queryKey: watchlistKeys.status(metadataId) }),
				// The details view keeps userState.inWatchlist from the composite.
				queryClient.invalidateQueries({ queryKey: metadataKeys.detailsView(metadataId) }),
			]);
		},
		onError: (error) => toastError(m.components_metadata_card_list_update_failed(), error),
	});
}
