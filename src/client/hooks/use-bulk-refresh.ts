import type { BulkRefreshResult } from "@reelvault/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";

/** Most ids one bulk refresh request carries; the server answers a larger request with a validation error. */
const BULK_REFRESH_CHUNK_SIZE = 50;

function chunkIds(ids: readonly string[]): string[][] {
	const chunks: string[][] = [];
	for (let start = 0; start < ids.length; start += BULK_REFRESH_CHUNK_SIZE) {
		chunks.push(ids.slice(start, start + BULK_REFRESH_CHUNK_SIZE));
	}

	return chunks;
}

interface UseBulkRefreshOptions {
	send: (ids: string[]) => Promise<BulkRefreshResult>;
	invalidationKeys: ReadonlyArray<readonly unknown[]>;
	successMessage: (count: number) => string;
}

/**
 * Refreshes the selected ids in requests of at most 50, one request after another. A request that fails stops
 * the run; otherwise the toast counts the ids that succeeded and the ones that failed.
 */
export function useBulkRefresh({ send, invalidationKeys, successMessage }: UseBulkRefreshOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (ids: string[]) => {
			const outcome = { succeeded: 0, failed: 0 };
			for (const chunk of chunkIds(ids)) {
				const { results } = await send(chunk);
				for (const result of results) {
					if (result.ok) outcome.succeeded += 1;
					else outcome.failed += 1;
				}
			}

			return outcome;
		},
		onSuccess: async ({ succeeded, failed }) => {
			await Promise.all(invalidationKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
			if (failed === 0) toast.success(successMessage(succeeded));
			else toast.error(m.admin_bulk_refresh_partial({ succeeded, failed }));
		},
		onError: (error) => {
			toastError(m.admin_bulk_refresh_failed(), error);
		},
	});
}
