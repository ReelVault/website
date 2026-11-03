import type { Query } from "@tanstack/react-query";

interface PollWhileOptions<TData> {
	/** Gate outside the data shape (e.g. an autoRefresh flag). */
	enabled?: boolean | undefined;
	/** Polling continues only while this holds over the latest data. */
	isActive: (data: TData | undefined) => boolean;
	/** Interval while active. */
	activeMs: number;
	/** Interval once inactive; `false` (default) stops polling entirely. */
	idleMs?: number | false | undefined;
	/**
	 * Stop after this many consecutive failures. A status endpoint that keeps
	 * returning 404/500 must not be hammered forever; the next user action or
	 * realtime event can restart the query.
	 */
	stopAfterFailures?: number | undefined;
}

/**
 * Builds a `refetchInterval` for status-driven polling: fast while `isActive`
 * holds over the latest data, backing off (or stopping) otherwise. Replaces
 * the hand-rolled closures every admin/download poll used to copy-paste.
 */
export function pollWhile<TData>(options: PollWhileOptions<TData>) {
	return (query: Query<TData>): number | false => {
		if (options.enabled === false) return false;

		if (options.stopAfterFailures !== undefined && query.state.fetchFailureCount >= options.stopAfterFailures) return false;

		return options.isActive(query.state.data) ? options.activeMs : (options.idleMs ?? false);
	};
}
