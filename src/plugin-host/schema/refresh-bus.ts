/**
 * Cross-surface refresh bus for declarative schemas.
 *
 * A mutation in one surface (e.g. saving a report in a detail dialog) bumps the
 * bus; every mounted schema surface re-runs its data sources. This keeps sibling
 * surfaces consistent without coupling them.
 */
const listeners = new Set<(origin: object) => void>();

/** `origin` identifies the surface that changed data; it refreshes itself. */
export function bumpSchemaRefresh(origin: object): void {
	for (const listener of listeners) listener(origin);
}

export function subscribeSchemaRefresh(listener: (origin: object) => void): () => void {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}
