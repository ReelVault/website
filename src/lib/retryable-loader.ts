/**
 * Caches one in-flight load, but forgets a rejected result so a later retry can
 * actually re-run the loader. The previous `??=` cache kept a rejected dynamic
 * import forever, making a route impossible to recover without a full reload.
 */
export function createRetryableLoader<T>(load: () => Promise<T>): () => Promise<T> {
	let pending: Promise<T> | undefined;

	return () => {
		pending ??= (async () => {
			try {
				return await load();
			} catch (error: unknown) {
				pending = undefined;
				throw error;
			}
		})();

		return pending;
	};
}
