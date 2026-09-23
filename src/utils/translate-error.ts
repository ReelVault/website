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
	auth_invalid_credentials: () => m.auth_invalid_credentials(),
	conflict: () => m.conflict(),
	episode_mismatch: (inputs) =>
		m.episode_mismatch({
			recognizedEpisode: String(inputs?.recognizedEpisode ?? ""),
			assignedEpisode: String(inputs?.assignedEpisode ?? ""),
		}),
	forbidden: () => m.forbidden(),
	internal: () => m.internal(),
	library_name_conflict: () => m.library_name_conflict(),
	library_path_conflict: () => m.library_path_conflict(),
	library_path_not_found: () => m.library_path_not_found(),
	low_confidence: (inputs) => m.low_confidence({ percent: String(inputs?.percent ?? "") }),
	not_found: () => m.not_found(),
	profile_name_conflict: () => m.profile_name_conflict(),
	profile_pin_invalid: () => m.profile_pin_invalid(),
	request_timeout: () => m.request_timeout(),
	scan_reason_no_metadata_match: () => m.scan_reason_no_metadata_match(),
	scan_reason_recognition_failed: () => m.scan_reason_recognition_failed(),
	scan_reason_type_mismatch: () => m.scan_reason_type_mismatch(),
	season_mismatch: (inputs) =>
		m.season_mismatch({
			recognizedSeason: String(inputs?.recognizedSeason ?? ""),
			assignedSeason: String(inputs?.assignedSeason ?? ""),
		}),
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
