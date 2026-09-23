import type { LibraryWithRelations, MetadataStorageMode } from "reelvault-sdk";
import { m } from "@/paraglide/messages";

export function getPathStats(_lib: LibraryWithRelations, path: LibraryWithRelations["paths"][number]) {
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
