import type { LibraryWithRelations, MetadataStorageMode } from "@reelvault/sdk";
import { m } from "@/paraglide/messages";

/** Files in a library; the list endpoint sends `totalMediaFiles`, older payloads only `mediaFileCount`. */
export function fileCountOf(lib: LibraryWithRelations): number {
	return lib.totalMediaFiles ?? lib.mediaFileCount ?? 0;
}

export function getPathStats(path: LibraryWithRelations["paths"][number]) {
	if (path.totalSize !== undefined && path.fileCount !== undefined) {
		return { count: path.fileCount, size: path.totalSize };
	}

	if (path.size !== undefined && path.fileCount !== undefined) {
		return { count: path.fileCount, size: path.size };
	}

	return { count: path.fileCount ?? 0, size: path.totalSize ?? path.size ?? 0 };
}

export function formatStorageMode(mode?: MetadataStorageMode | null) {
	if (mode === "database") return m.admin_libraries_mode_database();

	if (mode === "sidecar") return m.admin_libraries_mode_sidecar();

	if (mode === "database_and_sidecar") return m.admin_libraries_mode_both();

	return null;
}

export const PATH_SORT_OPTIONS = ["path-asc", "path-desc", "size-desc"] as const;

export type PathSortOption = (typeof PATH_SORT_OPTIONS)[number];

/** Source directories of one library in the chosen order. The input array is not modified. */
export function sortLibraryPaths(lib: LibraryWithRelations, sort: PathSortOption): LibraryWithRelations["paths"] {
	return lib.paths.toSorted((left, right) => {
		if (sort === "size-desc") return getPathStats(right).size - getPathStats(left).size;

		const order = left.path.localeCompare(right.path);
		return sort === "path-desc" ? -order : order;
	});
}
