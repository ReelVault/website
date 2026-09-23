import type { MetadataStorageMode } from "@reelvault/sdk";
import { m } from "@/paraglide/messages";

export interface PathField {
	id: string;
	value: string;
	metadataStorageMode?: MetadataStorageMode;
}

let nextPathId = 0;

export const createPathField = (value = "", metadataStorageMode?: MetadataStorageMode): PathField => ({
	id: `path-${nextPathId++}`,
	value,
	metadataStorageMode,
});

export const STORAGE_MODE_LABELS: Record<string, string> = {
	get default() {
		return m.admin_libraries_default_mode_per_config();
	},
	get database() {
		return m.admin_libraries_database_recommended();
	},
	get sidecar() {
		return m.admin_libraries_sidecar_mode();
	},
	get database_and_sidecar() {
		return m.admin_libraries_db_and_sidecar_mode();
	},
};
