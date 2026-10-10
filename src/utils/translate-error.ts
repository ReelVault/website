import { m } from "@/paraglide/messages";

export type MessageParams = Record<string, string | number | boolean | null | undefined>;

type CatalogMessage = (inputs?: MessageParams) => string | null;

/**
 * True when every named parameter is present. A message that needs parameters returns null without them,
 * so the caller's fallback shows instead of a sentence with blanks (a code can arrive without its parameters,
 * for example a stored plugin error).
 */
function hasParams(inputs: MessageParams | undefined, names: readonly string[]): inputs is MessageParams {
	return inputs !== undefined && names.every((name) => inputs[name] !== undefined && inputs[name] !== null);
}

/**
 * Explicit index over catalog messages reachable as runtime string codes:
 * `DomainError.code` values and category fallbacks from the server, plus the
 * media-file audit reasons. Anything else falls back to the raw code — same
 * contract as before. Named `m.*` references (not `Object.entries(m)`) keep
 * the bundler tree-shaking the rest of the paraglide catalog out of the eager
 * client chunk.
 */
const dynamicMessages = {
	admin_live_active_streams: (inputs) => m.admin_live_active_streams({ viewers: String(inputs?.viewers ?? "") }),
	admin_live_no_streams: () => m.admin_live_no_streams(),
	// Reasons a playback session can end with (the server's stream reason codes, hyphens normalized).
	inactivity_timeout: () => m.admin_live_end_reason_inactivity_timeout(),
	reservation_deadline: () => m.admin_live_end_reason_reservation_deadline(),
	shutdown: () => m.admin_live_end_reason_shutdown(),
	client_release: () => m.admin_live_end_reason_client_release(),
	client_release_all: () => m.admin_live_end_reason_client_release_all(),
	superseded_by_same_title: () => m.admin_live_end_reason_superseded(),
	admin_terminated: () => m.admin_live_end_reason_admin_terminated(),
	admin_settings_invalid_value: (inputs) =>
		m.admin_settings_invalid_value({ key: String(inputs?.key ?? ""), min: String(inputs?.min ?? ""), max: String(inputs?.max ?? "") }),
	admin_settings_unknown_key: (inputs) => m.admin_settings_unknown_key({ key: String(inputs?.key ?? "") }),
	auth_email_registered: () => m.auth_email_registered(),
	auth_invalid_credentials: () => m.auth_invalid_credentials(),
	auth_invalid_current_password: () => m.auth_invalid_current_password(),
	auth_invalid_email: () => m.auth_invalid_email(),
	auth_request_rejected: () => m.auth_request_rejected(),
	auth_two_factor_required: () => m.auth_two_factor_required(),
	auth_two_factor_requires_admin: () => m.auth_two_factor_requires_admin(),
	auth_user_banned: () => m.auth_user_banned(),
	auth_weak_password: () => m.auth_weak_password(),
	conflict: () => m.conflict(),
	database_restore_blocked_active_streams: (inputs) =>
		m.database_restore_blocked_active_streams({ activeStreams: String(inputs?.activeStreams ?? "") }),
	database_backup_invalid: () => m.database_backup_invalid(),
	database_backup_failed: () => m.database_backup_failed(),
	database_backup_upload_disabled: () => m.database_backup_upload_disabled(),
	subtitle_invalid_upload: () => m.subtitle_invalid_upload(),
	plugin_subtitle_provider_disabled: () => m.plugin_subtitle_provider_disabled(),
	validation_invalid_cursor: () => m.validation_invalid_cursor(),
	validation_cursor_not_supported: () => m.validation_cursor_not_supported(),
	validation_fields_too_long: (inputs) => m.validation_fields_too_long({ max: String(inputs?.max ?? "") }),
	validation_fields_too_many: (inputs) => m.validation_fields_too_many({ max: String(inputs?.max ?? "") }),
	validation_fields_too_deep: (inputs) => m.validation_fields_too_deep({ max: String(inputs?.max ?? "") }),
	validation_filter_too_many_values: (inputs) => m.validation_filter_too_many_values({ max: String(inputs?.max ?? "") }),
	download_empty_output: () => m.download_empty_output(),
	download_failed: () => m.download_failed(),
	download_ffmpeg_failed: () => m.download_ffmpeg_failed(),
	download_media_missing: () => m.download_media_missing(),
	library_path_missing: () => m.library_path_missing(),
	library_watcher_error: () => m.library_watcher_error(),
	library_watch_failed: () => m.library_watch_failed(),
	library_errors_check_not_found: () => m.library_errors_check_not_found(),
	download_source_not_mp4: () => m.download_source_not_mp4(),
	download_storage_limit: () => m.download_storage_limit(),
	downloads_disabled: () => m.downloads_disabled(),
	downloads_duration_unknown: () => m.downloads_duration_unknown(),
	downloads_in_progress: () => m.downloads_in_progress(),
	downloads_media_file_required: () => m.downloads_media_file_required(),
	downloads_no_media_file: () => m.downloads_no_media_file(),
	downloads_not_retryable: () => m.downloads_not_retryable(),
	downloads_queue_full: () => m.downloads_queue_full(),
	downloads_quota_exceeded: () => m.downloads_quota_exceeded(),
	downloads_season_exceeds_quota: () => m.downloads_season_exceeds_quota(),
	episode_mismatch: (inputs) =>
		m.episode_mismatch({
			recognizedEpisode: String(inputs?.recognizedEpisode ?? ""),
			assignedEpisode: String(inputs?.assignedEpisode ?? ""),
		}),
	forbidden: () => m.forbidden(),
	internal: () => m.internal(),
	library_invalid_metadata_language: () => m.library_invalid_metadata_language(),
	library_name_conflict: () => m.library_name_conflict(),
	library_path_conflict: () => m.library_path_conflict(),
	library_path_not_found: () => m.library_path_not_found(),
	low_confidence: (inputs) => m.low_confidence({ percent: String(inputs?.percent ?? "") }),
	media_decode_failed: () => m.media_decode_failed(),
	media_file_missing: () => m.media_file_missing(),
	media_probe_failed: () => m.media_probe_failed(),
	media_probe_no_data: () => m.media_probe_no_data(),
	not_found: () => m.not_found(),
	network_rate_limit_override_invalid: (inputs) =>
		m.network_rate_limit_override_invalid({ malformed: String(inputs?.malformed ?? ""), untunable: String(inputs?.untunable ?? "") }),
	plugin_load_failed: () => m.plugin_load_failed(),
	plugin_manifest_invalid: () => m.plugin_manifest_invalid(),
	plugin_repository_unavailable: () => m.plugin_repository_unavailable(),
	plugin_server_too_old: () => m.plugin_server_too_old(),
	profile_name_conflict: () => m.profile_name_conflict(),
	profile_pin_invalid: (inputs) =>
		inputs?.attemptsRemaining === undefined
			? m.profile_pin_invalid()
			: m.profile_pin_invalid_attempts({ attempts: String(inputs.attemptsRemaining) }),
	profile_pin_locked: (inputs) =>
		m.profile_pin_locked({ minutes: String(Math.max(1, Math.ceil(Number(inputs?.retryAfterSeconds ?? 0) / 60))) }),
	rate_limit_exceeded: (inputs) => m.rate_limit_exceeded({ retryAfterSeconds: String(inputs?.retryAfterSeconds ?? "") }),
	remote_access_bind_external: (inputs) => m.remote_access_bind_external({ bindHost: String(inputs?.bindHost ?? "") }),
	remote_access_bind_loopback: () => m.remote_access_bind_loopback(),
	remote_access_https_disabled: () => m.remote_access_https_disabled(),
	remote_access_https_enabled: () => m.remote_access_https_enabled(),
	remote_access_https_no_public_url: () => m.remote_access_https_no_public_url(),
	remote_access_public_url_missing: () => m.remote_access_public_url_missing(),
	remote_access_public_url_set: (inputs) => m.remote_access_public_url_set({ publicUrl: String(inputs?.publicUrl ?? "") }),
	remote_access_reachable_failed: () => m.remote_access_reachable_failed(),
	remote_access_reachable_not_configured: () => m.remote_access_reachable_not_configured(),
	remote_access_reachable_ok: () => m.remote_access_reachable_ok(),
	remote_access_trusted_proxy_missing: () => m.remote_access_trusted_proxy_missing(),
	remote_access_trusted_proxy_set: (inputs) => m.remote_access_trusted_proxy_set({ count: String(inputs?.count ?? "") }),
	request_timeout: () => m.request_timeout(),
	scan_reason_no_metadata_match: () => m.scan_reason_no_metadata_match(),
	scan_reason_probe_failed: () => m.scan_reason_probe_failed(),
	scan_reason_recognition_failed: () => m.scan_reason_recognition_failed(),
	scan_reason_type_mismatch: () => m.scan_reason_type_mismatch(),
	season_mismatch: (inputs) =>
		m.season_mismatch({
			recognizedSeason: String(inputs?.recognizedSeason ?? ""),
			assignedSeason: String(inputs?.assignedSeason ?? ""),
		}),
	stream_creation_throttled: (inputs) => m.stream_creation_throttled({ retryAfterSeconds: String(inputs?.retryAfterSeconds ?? "") }),
	stream_limit_reached: (inputs) => m.stream_limit_reached({ limit: String(inputs?.limit ?? "") }),
	sequel_mismatch: (inputs) =>
		m.sequel_mismatch({
			recognizedTitle: String(inputs?.recognizedTitle ?? ""),
			assignedTitle: String(inputs?.assignedTitle ?? ""),
		}),
	timeout: () => m.timeout(),
	title_mismatch: (inputs) =>
		m.title_mismatch({
			recognizedTitle: String(inputs?.recognizedTitle ?? ""),
			assignedTitle: String(inputs?.assignedTitle ?? ""),
		}),
	too_many_requests: () => m.too_many_requests(),
	unauthorized: () => m.unauthorized(),
	update_check_failed: () => m.update_check_failed(),
	update_checksum_mismatch: () => m.update_checksum_mismatch(),
	update_database_integrity_failed: () => m.update_database_integrity_failed(),
	update_install_failed: () => m.update_install_failed(),
	update_rollback_failed: () => m.update_rollback_failed(),
	update_blocked_active_streams: (inputs) => m.update_blocked_active_streams({ activeStreams: String(inputs?.activeStreams ?? "") }),
	update_not_cancellable: () => m.update_not_cancellable(),
	update_not_running: () => m.update_not_running(),
	validation: () => m.validation(),
	year_mismatch: (inputs) =>
		m.year_mismatch({
			recognizedYear: String(inputs?.recognizedYear ?? ""),
			assignedYear: String(inputs?.assignedYear ?? ""),
			diff: String(inputs?.diff ?? ""),
		}),
	plugin_manifest_not_object: () => m.plugin_manifest_not_object(),
	plugin_field_not_object: (inputs) => (hasParams(inputs, ["field"]) ? m.plugin_field_not_object({ field: String(inputs.field) }) : null),
	plugin_field_not_array: (inputs) => (hasParams(inputs, ["field"]) ? m.plugin_field_not_array({ field: String(inputs.field) }) : null),
	plugin_field_not_string: (inputs) => (hasParams(inputs, ["field"]) ? m.plugin_field_not_string({ field: String(inputs.field) }) : null),
	plugin_field_empty: (inputs) => (hasParams(inputs, ["field"]) ? m.plugin_field_empty({ field: String(inputs.field) }) : null),
	plugin_field_path_invalid: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_field_path_invalid({ field: String(inputs.field) }) : null,
	plugin_field_path_escapes: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_field_path_escapes({ field: String(inputs.field) }) : null,
	plugin_field_duplicates: (inputs) => (hasParams(inputs, ["field"]) ? m.plugin_field_duplicates({ field: String(inputs.field) }) : null),
	plugin_id_invalid: (inputs) => (hasParams(inputs, ["id"]) ? m.plugin_id_invalid({ id: String(inputs.id) }) : null),
	plugin_capabilities_empty: () => m.plugin_capabilities_empty(),
	plugin_capability_unsupported: (inputs) =>
		hasParams(inputs, ["capability"]) ? m.plugin_capability_unsupported({ capability: String(inputs.capability) }) : null,
	plugin_capability_undeclared: (inputs) =>
		hasParams(inputs, ["capability"]) ? m.plugin_capability_undeclared({ capability: String(inputs.capability) }) : null,
	plugin_min_server_version_invalid: (inputs) =>
		hasParams(inputs, ["value"]) ? m.plugin_min_server_version_invalid({ value: String(inputs.value) }) : null,
	plugin_csp_directive_unsupported: (inputs) =>
		hasParams(inputs, ["directive"]) ? m.plugin_csp_directive_unsupported({ directive: String(inputs.directive) }) : null,
	plugin_csp_source_invalid: (inputs) =>
		hasParams(inputs, ["directive", "source"])
			? m.plugin_csp_source_invalid({ directive: String(inputs.directive), source: String(inputs.source) })
			: null,
	plugin_csp_too_many_sources: (inputs) => (hasParams(inputs, ["max"]) ? m.plugin_csp_too_many_sources({ max: String(inputs.max) }) : null),
	plugin_config_not_object: () => m.plugin_config_not_object(),
	plugin_manifest_missing: () => m.plugin_manifest_missing(),
	plugin_ui_manifest_not_object: () => m.plugin_ui_manifest_not_object(),
	plugin_ui_field_not_object: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_field_not_object({ field: String(inputs.field) }) : null,
	plugin_ui_field_not_array: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_field_not_array({ field: String(inputs.field) }) : null,
	plugin_ui_string_array_invalid: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_string_array_invalid({ field: String(inputs.field) }) : null,
	plugin_ui_field_empty: (inputs) => (hasParams(inputs, ["field"]) ? m.plugin_ui_field_empty({ field: String(inputs.field) }) : null),
	plugin_ui_field_invalid: (inputs) => (hasParams(inputs, ["field"]) ? m.plugin_ui_field_invalid({ field: String(inputs.field) }) : null),
	plugin_ui_field_unsupported: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_field_unsupported({ field: String(inputs.field) }) : null,
	plugin_ui_entry_not_object: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_entry_not_object({ field: String(inputs.field) }) : null,
	plugin_ui_duplicate_id: (inputs) =>
		hasParams(inputs, ["field", "id"]) ? m.plugin_ui_duplicate_id({ field: String(inputs.field), id: String(inputs.id) }) : null,
	plugin_ui_too_many_fields: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_too_many_fields({ field: String(inputs.field) }) : null,
	plugin_ui_nesting_too_deep: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_nesting_too_deep({ field: String(inputs.field) }) : null,
	plugin_ui_too_many_nodes: (inputs) => (hasParams(inputs, ["field"]) ? m.plugin_ui_too_many_nodes({ field: String(inputs.field) }) : null),
	plugin_ui_url_invalid: (inputs) => (hasParams(inputs, ["field"]) ? m.plugin_ui_url_invalid({ field: String(inputs.field) }) : null),
	plugin_ui_path_invalid: (inputs) => (hasParams(inputs, ["field"]) ? m.plugin_ui_path_invalid({ field: String(inputs.field) }) : null),
	plugin_ui_schema_ref_missing: (inputs) =>
		hasParams(inputs, ["field", "ref"]) ? m.plugin_ui_schema_ref_missing({ field: String(inputs.field), ref: String(inputs.ref) }) : null,
	plugin_ui_element_tag_invalid: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_element_tag_invalid({ field: String(inputs.field) }) : null,
	plugin_ui_element_source_invalid: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_element_source_invalid({ field: String(inputs.field) }) : null,
	plugin_ui_page_path_invalid: (inputs) =>
		hasParams(inputs, ["page"]) ? m.plugin_ui_page_path_invalid({ page: String(inputs.page) }) : null,
	plugin_ui_page_nav_invalid: (inputs) =>
		hasParams(inputs, ["page"]) ? m.plugin_ui_page_nav_invalid({ page: String(inputs.page) }) : null,
	plugin_ui_dialog_size_invalid: (inputs) =>
		hasParams(inputs, ["dialog"]) ? m.plugin_ui_dialog_size_invalid({ dialog: String(inputs.dialog) }) : null,
	plugin_ui_tab_host_unsupported: (inputs) =>
		hasParams(inputs, ["host"]) ? m.plugin_ui_tab_host_unsupported({ host: String(inputs.host) }) : null,
	plugin_ui_tab_host_mismatch: (inputs) =>
		hasParams(inputs, ["tab", "host"]) ? m.plugin_ui_tab_host_mismatch({ tab: String(inputs.tab), host: String(inputs.host) }) : null,
	plugin_ui_page_unknown: (inputs) => (hasParams(inputs, ["page"]) ? m.plugin_ui_page_unknown({ page: String(inputs.page) }) : null),
	plugin_ui_dialog_unknown: (inputs) =>
		hasParams(inputs, ["dialog"]) ? m.plugin_ui_dialog_unknown({ dialog: String(inputs.dialog) }) : null,
	plugin_ui_slot_unsupported: (inputs) =>
		hasParams(inputs, ["slot"]) ? m.plugin_ui_slot_unsupported({ slot: String(inputs.slot) }) : null,
	plugin_ui_slot_entry_ambiguous: (inputs) =>
		hasParams(inputs, ["slot"]) ? m.plugin_ui_slot_entry_ambiguous({ slot: String(inputs.slot) }) : null,
	plugin_ui_action_type_missing: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_action_type_missing({ field: String(inputs.field) }) : null,
	plugin_ui_action_type_unsupported: (inputs) =>
		hasParams(inputs, ["field", "type"])
			? m.plugin_ui_action_type_unsupported({ field: String(inputs.field), type: String(inputs.type) })
			: null,
	plugin_ui_data_too_many_sources: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_data_too_many_sources({ field: String(inputs.field) }) : null,
	plugin_ui_option_value_invalid: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_option_value_invalid({ field: String(inputs.field) }) : null,
	plugin_ui_characters_unsupported: (inputs) =>
		hasParams(inputs, ["field", "value"])
			? m.plugin_ui_characters_unsupported({ field: String(inputs.field), value: String(inputs.value) })
			: null,
	plugin_ui_locale_text_invalid: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_locale_text_invalid({ field: String(inputs.field) }) : null,
	plugin_ui_field_not_string: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_field_not_string({ field: String(inputs.field) }) : null,
	plugin_ui_field_path_invalid: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_field_path_invalid({ field: String(inputs.field) }) : null,
	plugin_ui_field_path_escapes: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_field_path_escapes({ field: String(inputs.field) }) : null,
	plugin_ui_field_duplicates: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_ui_field_duplicates({ field: String(inputs.field) }) : null,
	auth_not_allowed: () => m.auth_not_allowed(),
	auth_not_found: () => m.auth_not_found(),
	auth_provider_failed: () => m.auth_provider_failed(),
	plugin_blobs_storage_failed: () => m.plugin_blobs_storage_failed(),
	file_wait_timeout: () => m.file_wait_timeout(),
	plugin_ui_level_invalid: (inputs) => (hasParams(inputs, ["field"]) ? m.plugin_ui_level_invalid({ field: String(inputs.field) }) : null),
	metadata_providers_unknown: (inputs) =>
		hasParams(inputs, ["providers"]) ? m.metadata_providers_unknown({ providers: String(inputs.providers) }) : null,
	plugin_blobs_quota_exceeded: (inputs) =>
		hasParams(inputs, ["maxBytes"]) ? m.plugin_blobs_quota_exceeded({ maxBytes: String(inputs.maxBytes) }) : null,
	plugin_job_invalid: (inputs) => (hasParams(inputs, ["plugin"]) ? m.plugin_job_invalid({ plugin: String(inputs.plugin) }) : null),
	plugin_job_name_required: () => m.plugin_job_name_required(),
	plugin_job_handler_missing: (inputs) =>
		hasParams(inputs, ["plugin", "job"]) ? m.plugin_job_handler_missing({ plugin: String(inputs.plugin), job: String(inputs.job) }) : null,
	media_file_not_found: () => m.media_file_not_found(),
	provider_search_id_incomplete: () => m.provider_search_id_incomplete(),
	provider_search_query_missing: () => m.provider_search_query_missing(),
	provider_unavailable: (inputs) =>
		hasParams(inputs, ["provider"]) ? m.provider_unavailable({ provider: String(inputs.provider) }) : null,
	plugin_catalog_not_json: () => m.plugin_catalog_not_json(),
	plugin_catalog_not_object: () => m.plugin_catalog_not_object(),
	plugin_catalog_field_not_array: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_catalog_field_not_array({ field: String(inputs.field) }) : null,
	plugin_catalog_too_many_plugins: (inputs) =>
		hasParams(inputs, ["max"]) ? m.plugin_catalog_too_many_plugins({ max: String(inputs.max) }) : null,
	plugin_catalog_api_version_unsupported: (inputs) =>
		hasParams(inputs, ["version", "expected"])
			? m.plugin_catalog_api_version_unsupported({ version: String(inputs.version), expected: String(inputs.expected) })
			: null,
	plugin_catalog_field_invalid: (inputs) =>
		hasParams(inputs, ["field"]) ? m.plugin_catalog_field_invalid({ field: String(inputs.field) }) : null,
	plugin_catalog_entry_not_object: (inputs) =>
		hasParams(inputs, ["index"]) ? m.plugin_catalog_entry_not_object({ index: String(inputs.index) }) : null,
	plugin_catalog_entry_invalid: (inputs) =>
		hasParams(inputs, ["index", "field"])
			? m.plugin_catalog_entry_invalid({ index: String(inputs.index), field: String(inputs.field) })
			: null,
	plugin_catalog_id_invalid: (inputs) =>
		hasParams(inputs, ["index"]) ? m.plugin_catalog_id_invalid({ index: String(inputs.index) }) : null,
	plugin_catalog_category_invalid: (inputs) =>
		hasParams(inputs, ["index", "categories"])
			? m.plugin_catalog_category_invalid({ index: String(inputs.index), categories: String(inputs.categories) })
			: null,
	plugin_catalog_versions_not_array: (inputs) =>
		hasParams(inputs, ["index"]) ? m.plugin_catalog_versions_not_array({ index: String(inputs.index) }) : null,
	plugin_catalog_versions_too_many: (inputs) =>
		hasParams(inputs, ["index", "max"])
			? m.plugin_catalog_versions_too_many({ index: String(inputs.index), max: String(inputs.max) })
			: null,
	plugin_catalog_version_entry_invalid: (inputs) =>
		hasParams(inputs, ["index"]) ? m.plugin_catalog_version_entry_invalid({ index: String(inputs.index) }) : null,
	plugin_catalog_version_duplicate: (inputs) =>
		hasParams(inputs, ["index", "version"])
			? m.plugin_catalog_version_duplicate({ index: String(inputs.index), version: String(inputs.version) })
			: null,
	plugin_repository_url_invalid: () => m.plugin_repository_url_invalid(),
	plugin_repository_not_found: () => m.plugin_repository_not_found(),
	plugin_repository_save_failed: () => m.plugin_repository_save_failed(),
	plugin_not_in_repository: (inputs) =>
		hasParams(inputs, ["plugin"]) ? m.plugin_not_in_repository({ plugin: String(inputs.plugin) }) : null,
	plugin_not_installed: (inputs) => (hasParams(inputs, ["plugin"]) ? m.plugin_not_installed({ plugin: String(inputs.plugin) }) : null),
	plugin_repository_fetch_failed: (inputs) =>
		hasParams(inputs, ["status"]) ? m.plugin_repository_fetch_failed({ status: String(inputs.status) }) : null,
	plugin_repository_too_large: () => m.plugin_repository_too_large(),
	plugin_download_failed: () => m.plugin_download_failed(),
	plugin_download_failed_http: (inputs) =>
		hasParams(inputs, ["status"]) ? m.plugin_download_failed_http({ status: String(inputs.status) }) : null,
	plugin_download_empty: () => m.plugin_download_empty(),
	plugin_package_too_large: (inputs) =>
		hasParams(inputs, ["maxBytes"]) ? m.plugin_package_too_large({ maxBytes: String(inputs.maxBytes) }) : null,
	plugin_package_unpacked_too_large: () => m.plugin_package_unpacked_too_large(),
	plugin_checksum_mismatch: () => m.plugin_checksum_mismatch(),
	plugin_archive_format_unsupported: () => m.plugin_archive_format_unsupported(),
	plugin_package_path_unsafe: (inputs) =>
		hasParams(inputs, ["path"]) ? m.plugin_package_path_unsafe({ path: String(inputs.path) }) : null,
	plugin_package_symlink_invalid: (inputs) =>
		hasParams(inputs, ["path"]) ? m.plugin_package_symlink_invalid({ path: String(inputs.path) }) : null,
	plugin_package_entry_unsupported: (inputs) =>
		hasParams(inputs, ["path"]) ? m.plugin_package_entry_unsupported({ path: String(inputs.path) }) : null,
	plugin_archive_truncated: () => m.plugin_archive_truncated(),
	plugin_archive_invalid: () => m.plugin_archive_invalid(),
	plugin_entry_missing: () => m.plugin_entry_missing(),
	plugin_ui_manifest_invalid: () => m.plugin_ui_manifest_invalid(),
	plugin_version_downgrade: (inputs) =>
		hasParams(inputs, ["installed", "version"])
			? m.plugin_version_downgrade({ installed: String(inputs.installed), version: String(inputs.version) })
			: null,
	plugin_scheduled_task_invalid: () => m.plugin_scheduled_task_invalid(),
	plugin_job_duplicate: (inputs) => (hasParams(inputs, ["job"]) ? m.plugin_job_duplicate({ job: String(inputs.job) }) : null),
	plugin_route_duplicate: (inputs) =>
		hasParams(inputs, ["method", "path"]) ? m.plugin_route_duplicate({ method: String(inputs.method), path: String(inputs.path) }) : null,
	plugin_scheduled_task_failed: (inputs) =>
		hasParams(inputs, ["plugin"]) ? m.plugin_scheduled_task_failed({ plugin: String(inputs.plugin) }) : null,
	plugin_job_not_registered: (inputs) => (hasParams(inputs, ["job"]) ? m.plugin_job_not_registered({ job: String(inputs.job) }) : null),
	plugin_scope_not_bound: () => m.plugin_scope_not_bound(),
	plugin_lockfile_invalid: () => m.plugin_lockfile_invalid(),
	plugin_already_installed: (inputs) =>
		hasParams(inputs, ["plugin"]) ? m.plugin_already_installed({ plugin: String(inputs.plugin) }) : null,
	plugin_lockfile_entry_unsafe: (inputs) =>
		hasParams(inputs, ["plugin"]) ? m.plugin_lockfile_entry_unsafe({ plugin: String(inputs.plugin) }) : null,
	plugin_directory_escape: (inputs) =>
		hasParams(inputs, ["plugin"]) ? m.plugin_directory_escape({ plugin: String(inputs.plugin) }) : null,
	plugin_config_too_large: (inputs) =>
		hasParams(inputs, ["maxBytes"]) ? m.plugin_config_too_large({ maxBytes: String(inputs.maxBytes) }) : null,
	plugin_config_directory_invalid: () => m.plugin_config_directory_invalid(),
	plugin_manifest_changed: () => m.plugin_manifest_changed(),
	plugin_integrity_mismatch: (inputs) =>
		hasParams(inputs, ["plugin"]) ? m.plugin_integrity_mismatch({ plugin: String(inputs.plugin) }) : null,
	plugin_source_missing: () => m.plugin_source_missing(),
	plugin_source_overlaps_plugins_directory: () => m.plugin_source_overlaps_plugins_directory(),
	plugin_export_missing: (inputs) => (hasParams(inputs, ["plugin"]) ? m.plugin_export_missing({ plugin: String(inputs.plugin) }) : null),
	plugin_export_invalid: (inputs) => (hasParams(inputs, ["plugin"]) ? m.plugin_export_invalid({ plugin: String(inputs.plugin) }) : null),
	plugin_already_registered: (inputs) =>
		hasParams(inputs, ["plugin"]) ? m.plugin_already_registered({ plugin: String(inputs.plugin) }) : null,
	plugin_state_invalid: (inputs) => (hasParams(inputs, ["plugin"]) ? m.plugin_state_invalid({ plugin: String(inputs.plugin) }) : null),
	plugin_element_conflict: (inputs) =>
		hasParams(inputs, ["plugin", "otherPlugin", "tag"])
			? m.plugin_element_conflict({ plugin: String(inputs.plugin), otherPlugin: String(inputs.otherPlugin), tag: String(inputs.tag) })
			: null,
	plugin_not_registered: (inputs) => (hasParams(inputs, ["plugin"]) ? m.plugin_not_registered({ plugin: String(inputs.plugin) }) : null),
	plugin_entity_conflict: (inputs) =>
		hasParams(inputs, ["id", "plugin"]) ? m.plugin_entity_conflict({ id: String(inputs.id), plugin: String(inputs.plugin) }) : null,
	plugin_entity_invalid: () => m.plugin_entity_invalid(),
	plugin_entity_duplicate: (inputs) => (hasParams(inputs, ["id"]) ? m.plugin_entity_duplicate({ id: String(inputs.id) }) : null),
	plugin_not_found: () => m.plugin_not_found(),
	plugin_access_policy_id_required: () => m.plugin_access_policy_id_required(),
	plugin_access_policy_duplicate: (inputs) =>
		hasParams(inputs, ["policy"]) ? m.plugin_access_policy_duplicate({ policy: String(inputs.policy) }) : null,
	plugin_artifact_candidate_invalid: () => m.plugin_artifact_candidate_invalid(),
	plugin_route_conflict: (inputs) =>
		hasParams(inputs, ["method", "path"]) ? m.plugin_route_conflict({ method: String(inputs.method), path: String(inputs.path) }) : null,
	plugin_route_response_invalid: () => m.plugin_route_response_invalid(),
	plugin_route_response_schema: () => m.plugin_route_response_schema(),
	plugin_route_method_unsupported: () => m.plugin_route_method_unsupported(),
	plugin_registration_limit_analyzers: () => m.plugin_registration_limit_analyzers(),
	plugin_registration_limit_jobs: () => m.plugin_registration_limit_jobs(),
	plugin_registration_limit_providers: () => m.plugin_registration_limit_providers(),
	plugin_registration_limit_routes: () => m.plugin_registration_limit_routes(),
	plugin_registration_limit_scheduled_tasks: () => m.plugin_registration_limit_scheduled_tasks(),
	plugin_registration_limit_subtitle_providers: () => m.plugin_registration_limit_subtitle_providers(),
	plugin_route_access_invalid: () => m.plugin_route_access_invalid(),
	plugin_route_handler_missing: () => m.plugin_route_handler_missing(),
	plugin_route_path_invalid: () => m.plugin_route_path_invalid(),
	plugin_route_not_found: () => m.plugin_route_not_found(),
	plugin_route_forbidden: () => m.plugin_route_forbidden(),
	plugin_route_request_invalid: () => m.plugin_route_request_invalid(),
	auth_required: () => m.auth_required(),
	logs_file_not_found: () => m.logs_file_not_found(),
	logs_read_failed: () => m.logs_read_failed(),
	logs_delete_failed: () => m.logs_delete_failed(),
	auth_setup_user_missing: () => m.auth_setup_user_missing(),
	metadata_provider_not_found: () => m.metadata_provider_not_found(),
	metadata_provider_not_linked: () => m.metadata_provider_not_linked(),
	metadata_create_failed: () => m.metadata_create_failed(),
	metadata_merge_type_mismatch: () => m.metadata_merge_type_mismatch(),
	metadata_not_found: () => m.metadata_not_found(),
	library_path_required: () => m.library_path_required(),
	media_file_marker_range_invalid: () => m.media_file_marker_range_invalid(),
	media_file_path_required: () => m.media_file_path_required(),
	media_file_disabled: () => m.media_file_disabled(),
	downloads_create_failed: () => m.downloads_create_failed(),
	person_not_found: () => m.person_not_found(),
	season_not_found: () => m.season_not_found(),
	episode_not_found: () => m.episode_not_found(),
	profile_not_found: () => m.profile_not_found(),
	profile_not_owned: () => m.profile_not_owned(),
	images_not_found: () => m.images_not_found(),
	images_save_failed: () => m.images_save_failed(),
	images_download_failed: () => m.images_download_failed(),
	images_format_unrecognized: () => m.images_format_unrecognized(),
	images_optimized_invalid: () => m.images_optimized_invalid(),
	images_unsupported_format: () => m.images_unsupported_format(),
	image_write_failed: () => m.image_write_failed(),
	images_processing_kind_unknown: () => m.images_processing_kind_unknown(),
	notifications_create_failed: () => m.notifications_create_failed(),
	worker_operation_create_failed: () => m.worker_operation_create_failed(),
	worker_enqueue_failed: () => m.worker_enqueue_failed(),
	worker_operation_not_found: () => m.worker_operation_not_found(),
	worker_operation_cancelled: () => m.worker_operation_cancelled(),
	worker_dependency_invalid: () => m.worker_dependency_invalid(),
	worker_dependency_self: () => m.worker_dependency_self(),
	worker_dependency_not_found: () => m.worker_dependency_not_found(),
	worker_dependency_other_operation: () => m.worker_dependency_other_operation(),
	worker_operation_not_cancelled: () => m.worker_operation_not_cancelled(),
	worker_nothing_to_resume: () => m.worker_nothing_to_resume(),
	worker_not_found: () => m.worker_not_found(),
	worker_already_registered: () => m.worker_already_registered(),
	worker_runtime_unavailable: () => m.worker_runtime_unavailable(),
	worker_manual_task_active: () => m.worker_manual_task_active(),
	worker_schedule_time_invalid: () => m.worker_schedule_time_invalid(),
	worker_schedule_day_invalid: () => m.worker_schedule_day_invalid(),
	worker_schedule_interval_invalid: () => m.worker_schedule_interval_invalid(),
	worker_operation_conflict: () => m.worker_operation_conflict(),
	worker_cron_invalid: (inputs) =>
		hasParams(inputs, ["expression"]) ? m.worker_cron_invalid({ expression: String(inputs.expression) }) : null,
	ffmpeg_timeout: () => m.ffmpeg_timeout(),
	media_tools_missing: (inputs) => (hasParams(inputs, ["tools"]) ? m.media_tools_missing({ tools: String(inputs.tools) }) : null),
	subtitle_not_found: () => m.subtitle_not_found(),
	subtitle_source_invalid: () => m.subtitle_source_invalid(),
	subtitle_type_mismatch: () => m.subtitle_type_mismatch(),
	sidecar_path_outside_library: () => m.sidecar_path_outside_library(),
	sidecar_path_invalid: () => m.sidecar_path_invalid(),
	sidecar_document_too_large: (inputs) =>
		hasParams(inputs, ["maxMb"]) ? m.sidecar_document_too_large({ maxMb: String(inputs.maxMb) }) : null,
	stream_session_exists: () => m.stream_session_exists(),
	stream_session_not_found: () => m.stream_session_not_found(),
	stream_session_released: () => m.stream_session_released(),
	stream_start_failed: () => m.stream_start_failed(),
	stream_segment_removed: () => m.stream_segment_removed(),
	stream_segment_name_invalid: () => m.stream_segment_name_invalid(),
	stream_segment_obsolete: () => m.stream_segment_obsolete(),
	stream_segment_not_found: () => m.stream_segment_not_found(),
	stream_not_ready: () => m.stream_not_ready(),
	stream_idempotency_conflict: () => m.stream_idempotency_conflict(),
	stream_id_invalid: () => m.stream_id_invalid(),
	stream_session_expired: () => m.stream_session_expired(),
	stream_session_not_owned: () => m.stream_session_not_owned(),
} satisfies Record<string, CatalogMessage>;

let messageCatalog: Map<string, CatalogMessage> | null = null;

/** Lazily builds a runtime index over the dynamically reachable messages. */
function getCatalog(): Map<string, CatalogMessage> {
	messageCatalog ??= new Map(Object.entries(dynamicMessages));

	return messageCatalog;
}

/**
 * Runtime lookup for message codes that arrive as strings (server error codes,
 * warning payloads). Returns the raw code when no message exists — same
 * contract the old `t()` had.
 */
export function translateByKey(code: string, params?: MessageParams): string {
	const normalizedCode = code.replace(/[.-]/g, "_").toLowerCase();
	return getCatalog().get(normalizedCode)?.(params) ?? code;
}

function isMessageParamValue(value: unknown): value is MessageParams[string] {
	return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null;
}

function normalizeParams(params: unknown): MessageParams | undefined {
	if (params && typeof params === "object") {
		return Object.fromEntries(
			Object.entries(params).filter((entry): entry is [string, MessageParams[string]] => isMessageParamValue(entry[1])),
		);
	}

	return undefined;
}

/**
 * The text for a stored or reported error code; the fallback when the website has no message for it,
 * or when the code needs parameters that were not given.
 */
export function translateCode(code: string | null | undefined, fallback: string, params?: MessageParams): string {
	if (!code) return fallback;

	const translated = translateByKey(code, params);

	return translated === code ? fallback : translated;
}

/** Best-effort human message for any thrown value; always returns something. */
export function translateError(error: unknown, fallback: string): string {
	if (error && typeof error === "object") {
		const candidate = error as { code?: unknown; params?: unknown };
		if (typeof candidate.code === "string") {
			const translated = translateByKey(candidate.code, normalizeParams(candidate.params));
			if (translated !== candidate.code) return translated;
		}
	}

	if (error instanceof Error && error.message) return error.message;

	return fallback;
}
