/**
 * Cross-surface refresh bus for declarative schemas.
 *
 * A mutation in one surface (e.g. saving a report in a detail dialog) bumps the
 * bus; every mounted schema surface re-runs its data sources. This keeps sibling
 * surfaces consistent without coupling them.
 */
const listeners = new Set<() => void>();

export function bumpSchemaRefresh(): void {
	for (const listener of listeners) listener();
}

export function subscribeSchemaRefresh(listener: () => void): () => void {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}
