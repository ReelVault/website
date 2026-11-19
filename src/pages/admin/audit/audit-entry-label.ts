import { m } from "@/paraglide/messages";

const RESOURCE_TYPE_LABELS: Record<string, () => string> = {
	api_key: () => m.audit_resource_api_key(),
	collection: () => m.audit_resource_collection(),
	collection_order: () => m.audit_resource_collection_order(),
	database_backup: () => m.audit_resource_database_backup(),
	database_restore: () => m.audit_resource_database_restore(),
	library: () => m.audit_resource_library(),
	library_errors_check: () => m.audit_resource_library_errors_check(),
	library_scan: () => m.audit_resource_library_scan(),
	log_file: () => m.audit_resource_log_file(),
	log_files_cleanup: () => m.audit_resource_log_files_cleanup(),
	media_file: () => m.audit_resource_media_file(),
	media_file_audit: () => m.audit_resource_media_file_audit(),
	media_file_reassign: () => m.audit_resource_media_file_reassign(),
	media_file_refresh: () => m.audit_resource_media_file_refresh(),
	media_files_refresh_all: () => m.audit_resource_media_files_refresh_all(),
	media_markers: () => m.audit_resource_media_markers(),
	metadata: () => m.audit_resource_metadata(),
	metadata_image: () => m.audit_resource_metadata_image(),
	metadata_image_upload: () => m.audit_resource_metadata_image_upload(),
	metadata_link_provider: () => m.audit_resource_metadata_link_provider(),
	metadata_merge: () => m.audit_resource_metadata_merge(),
	metadata_orphans: () => m.audit_resource_metadata_orphans(),
	metadata_provider_configuration: () => m.audit_resource_metadata_provider_configuration(),
	metadata_provider_configuration_order: () => m.audit_resource_metadata_provider_configuration_order(),
	metadata_refresh: () => m.audit_resource_metadata_refresh(),
	metadata_refresh_all: () => m.audit_resource_metadata_refresh_all(),
	metadata_refresh_batch: () => m.audit_resource_metadata_refresh_batch(),
	metadata_rematch: () => m.audit_resource_metadata_rematch(),
	plugin: () => m.audit_resource_plugin(),
	plugin_catalog_install: () => m.audit_resource_plugin_catalog_install(),
	plugin_config: () => m.audit_resource_plugin_config(),
	plugin_repository: () => m.audit_resource_plugin_repository(),
	plugins: () => m.audit_resource_plugins(),
	plugin_ui_settings: () => m.audit_resource_plugin_ui_settings(),
	plugin_upload_install: () => m.audit_resource_plugin_upload_install(),
	profile: () => m.audit_resource_profile(),
	stream_session: () => m.audit_resource_stream_session(),
	system: () => m.audit_resource_system(),
	system_settings: () => m.audit_resource_system_settings(),
	trickplay: () => m.audit_resource_trickplay(),
	user: () => m.audit_resource_user(),
	user_session: () => m.audit_resource_user_session(),
	worker_category_run: () => m.audit_resource_worker_category_run(),
	worker_history: () => m.audit_resource_worker_history(),
	worker_item: () => m.audit_resource_worker_item(),
	worker_operation: () => m.audit_resource_worker_operation(),
	worker_operation_batch: () => m.audit_resource_worker_operation_batch(),
	worker_queue: () => m.audit_resource_worker_queue(),
	worker_run: () => m.audit_resource_worker_run(),
	worker_schedule: () => m.audit_resource_worker_schedule(),
	worker_triggers: () => m.audit_resource_worker_triggers(),
};

/** A readable name for an audit resource type; a type this client does not know shows its identifier. */
export function auditResourceTypeLabel(type: string): string {
	return RESOURCE_TYPE_LABELS[type]?.() ?? type;
}

const ACTION_LABELS: Record<string, () => string> = {
	create: () => m.audit_action_create(),
	update: () => m.audit_action_update(),
	delete: () => m.audit_action_delete(),
};

export function auditActionLabel(action: string): string {
	return ACTION_LABELS[action]?.() ?? action;
}

/** One line describing an audit entry, shared by the audit log and the dashboard feed. */
export function auditEntryLabel(entry: {
	summary?: string | null;
	resourceType?: string;
	resourceName?: string | null;
	resourceId?: string | null;
	actorUserId?: string | null;
}): string {
	if (entry.summary) return entry.summary;

	const type = entry.resourceType === undefined ? m.audit_resource_unknown() : auditResourceTypeLabel(entry.resourceType);
	if (entry.resourceName) return `${type}: ${entry.resourceName}`;

	// Raw ids are long UUIDs — the row stays scannable with the short form.
	if (entry.resourceId) return `${type} / ${entry.resourceId.slice(0, 8)}`;

	if (entry.actorUserId) return m.admin_dashboard_action_by_user({ actorId: entry.actorUserId.slice(0, 8) });

	return m.admin_dashboard_action_by_system();
}
