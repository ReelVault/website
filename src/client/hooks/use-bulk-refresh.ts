import type { BulkDeleteResult, BulkRefreshResult } from "@reelvault/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { m } from "@/paraglide/messages";
import { activeStreamsBlocking } from "@/utils/stream-block";
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

/** The ids a delete held back because streams play them, and the number of those streams. */
export interface BulkDeleteStreamBlock {
	ids: string[];
	activeStreams: number;
}

interface UseBulkDeleteOptions {
	send: (ids: string[], force: boolean) => Promise<BulkDeleteResult>;
	invalidationKeys: ReadonlyArray<readonly unknown[]>;
	successMessage: (count: number) => string;
}

/**
 * Deletes the selected ids in requests of at most 50, one after another. When the stream guard holds a request back, the
 * ids not yet deleted wait in `streamBlock` until the admin confirms the delete anyway (`force`).
 */
export function useBulkDelete({ send, invalidationKeys, successMessage }: UseBulkDeleteOptions) {
	const queryClient = useQueryClient();
	const [streamBlock, setStreamBlock] = useState<BulkDeleteStreamBlock | null>(null);

	const mutation = useMutation({
		mutationFn: async ({ ids, force }: { ids: string[]; force: boolean }) => {
			const outcome: { succeeded: number; failed: number; held?: BulkDeleteStreamBlock | undefined } = { succeeded: 0, failed: 0 };
			const chunks = chunkIds(ids);
			for (const [index, chunk] of chunks.entries()) {
				try {
					const { results } = await send(chunk, force);
					for (const result of results) {
						if (result.ok) outcome.succeeded += 1;
						else outcome.failed += 1;
					}
				} catch (error) {
					const activeStreams = activeStreamsBlocking(error);
					if (activeStreams === null || force) throw error;

					return { ...outcome, held: { ids: chunks.slice(index).flat(), activeStreams } };
				}
			}

			return outcome;
		},
		onSuccess: async ({ succeeded, failed, held }) => {
			await Promise.all(invalidationKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
			if (held) setStreamBlock(held);
			if (failed > 0) toast.error(m.admin_bulk_delete_partial({ succeeded, failed }));
			else if (succeeded > 0) toast.success(successMessage(succeeded));
		},
		onError: (error) => {
			toastError(m.admin_bulk_delete_failed(), error);
		},
	});

	return {
		isPending: mutation.isPending,
		deleteItems: (ids: string[]) => mutation.mutate({ ids, force: false }),
		streamBlock,
		confirmStreamBlock: () => {
			const block = streamBlock;
			setStreamBlock(null);
			if (block) mutation.mutate({ ids: block.ids, force: true });
		},
		dismissStreamBlock: () => setStreamBlock(null),
	};
}
