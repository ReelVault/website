import { m } from "@/paraglide/messages";

export type MessageParams = Record<string, string | number | boolean | null | undefined>;

type CatalogMessage = (inputs?: MessageParams) => string;

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
	downloads_disabled: () => m.downloads_disabled(),
	downloads_duration_unknown: () => m.downloads_duration_unknown(),
	downloads_in_progress: () => m.downloads_in_progress(),
	downloads_media_file_required: () => m.downloads_media_file_required(),
	downloads_quota_exceeded: () => m.downloads_quota_exceeded(),
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
	not_found: () => m.not_found(),
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
	const normalizedCode = code.replace(/\./g, "_").toLowerCase();
	const message = getCatalog().get(normalizedCode);

	return message ? message(params) : code;
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
