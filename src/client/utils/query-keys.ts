import type { MetadataType } from "reelvault-sdk";

export const metadataKeys = {
	all: ["metadata"] as const,
	byId: (id: string) => [...metadataKeys.all, id] as const,
	details: (id: string) => [...metadataKeys.all, "details", id] as const,
	detailsView: (id: string) => [...metadataKeys.all, "details-view", id] as const,
	related: (id: string) => [...metadataKeys.all, "related", id] as const,
	watchlist: (ids: readonly string[]) => [...metadataKeys.all, "watchlist", ids.toSorted()] as const,
	similarByActor: (id?: string) => [...metadataKeys.all, "similar_by_actor", id] as const,
	collection: (id?: string, sortBy?: string, sortOrder?: string) => [...metadataKeys.all, "collection", id, sortBy, sortOrder] as const,
	collectionOrder: (collectionId: string, sortBy?: string, sortOrder?: string) =>
		[...metadataKeys.all, "collection-order", collectionId, sortBy, sortOrder] as const,
	person: (id: string) => [...metadataKeys.all, "person", id] as const,
	popular: (limit: number) => [...metadataKeys.all, "popular", limit] as const,
	recentlyAdded: (limit: number, type?: MetadataType) =>
		type ? ([...metadataKeys.all, "recently-added", limit, type] as const) : ([...metadataKeys.all, "recently-added", limit] as const),
	search: (query: string) => [...metadataKeys.all, "search", query] as const,
	reassignSearch: (mediaType?: string, search?: string) => [...metadataKeys.all, "reassign-search", mediaType, search] as const,
	library: (libraryId: string, type: string, limit: number, filters: object, scope: "ui" | "filtered") =>
		[...metadataKeys.all, "library", libraryId, type, limit, filters, scope] as const,
	admin: (page: number, limit: number, title: string, hasMediaFiles?: boolean, lowConfidence?: boolean, missingTranslation?: boolean) =>
		[...metadataKeys.all, "admin", { page, limit, title, hasMediaFiles, lowConfidence, missingTranslation }] as const,
	adminAll: () => [...metadataKeys.all, "admin"] as const,
	mergeCandidates: (type: string, search?: string) => [...metadataKeys.all, "merge-candidates", type, search] as const,
	adminEditor: (id: string) => [...metadataKeys.all, "admin-edit", id] as const,
	imageOptions: (id: string, type: string) => [...metadataKeys.all, id, "image-options", type] as const,
};

export const adminSettingsKeys = {
	all: ["admin", "settings"] as const,
	list: () => [...adminSettingsKeys.all, "list"] as const,
};

export const libraryKeys = {
	all: ["libraries"] as const,
	list: (type: "movies" | "tv_shows") => [...libraryKeys.all, type] as const,
	detail: (id: string) => [...libraryKeys.all, "detail", id] as const,
	ignoreAssets: (id: string) => [...libraryKeys.all, "ignored-assets", id] as const,
	scanFindings: (id: string) => [...libraryKeys.all, "scan-findings", id] as const,
	admin: () => [...libraryKeys.all, "admin"] as const,
};

export const watchlistKeys = {
	all: ["watchlist"] as const,
	items: () => [...watchlistKeys.all, "items"] as const,
	status: (metadataId: string) => [...watchlistKeys.all, "status", metadataId] as const,
};

export const playbackSessionKeys = {
	all: ["playback-sessions"] as const,
	playbackView: (id: string) => [...playbackSessionKeys.all, "view-composite", id] as const,
	mine: () => ["me", "playback-sessions", "mine"] as const,
	diagnostics: (sessionId: string) => [...playbackSessionKeys.all, sessionId, "diagnostics"] as const,
	transcodeProgress: (sessionId: string) => [...playbackSessionKeys.all, sessionId, "transcode-progress"] as const,
};

export const mePlaybackKeys = {
	all: ["me", "playback"] as const,
	suggestions: (metadataId: string) => [...mePlaybackKeys.all, "suggestions", metadataId] as const,
	suggestionsAll: () => [...mePlaybackKeys.all, "suggestions"] as const,
	progress: (metadataId: string) => [...mePlaybackKeys.all, "progress", metadataId] as const,
	progressAll: () => [...mePlaybackKeys.all, "progress"] as const,
	streamPrefs: (mediaFileId: string) => [...mePlaybackKeys.all, "stream-prefs", mediaFileId] as const,
	continueWatching: () => [...mePlaybackKeys.all, "continue-watching"] as const,
};

export const subtitleKeys = {
	all: ["subtitles"] as const,
	list: (mediaFileId: string) => [...subtitleKeys.all, mediaFileId] as const,
	content: (subtitleId: string | undefined) => [...subtitleKeys.all, "content", subtitleId] as const,
	admin: (params: { page: number; limit: number; mediaFileId?: string; language?: string }) =>
		[...subtitleKeys.all, "admin", params] as const,
	adminDetail: (id: string) => [...subtitleKeys.all, "admin", id] as const,
	providers: () => [...subtitleKeys.all, "providers"] as const,
};

export const authKeys = {
	all: ["auth"] as const,
	me: () => [...authKeys.all, "me"] as const,
	sessions: () => [...authKeys.all, "sessions"] as const,
};

export const notificationKeys = {
	all: ["notifications"] as const,
	list: (unreadOnly: boolean) => [...notificationKeys.all, "list", unreadOnly] as const,
	unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

export const genreKeys = {
	all: ["genres"] as const,
	list: () => [...genreKeys.all, "list"] as const,
	detail: (id: string) => [...genreKeys.all, "detail", id] as const,
	metadata: (id: string, params?: { page?: number; limit?: number }) =>
		params ? ([...genreKeys.all, "metadata", id, params] as const) : ([...genreKeys.all, "metadata", id] as const),
};

export const keywordKeys = {
	all: ["keywords"] as const,
	detail: (id: string) => [...keywordKeys.all, "detail", id] as const,
	metadata: (id: string, params?: { page?: number; limit?: number }) =>
		params ? ([...keywordKeys.all, "metadata", id, params] as const) : ([...keywordKeys.all, "metadata", id] as const),
};

export const collectionKeys = {
	all: ["collections"] as const,
	page: (page: number, limit: number) => [...collectionKeys.all, page, limit] as const,
	detail: (id: string) => [...collectionKeys.all, "detail", id] as const,
};

export const companyKeys = {
	all: ["companies"] as const,
	list: () => [...companyKeys.all, "list"] as const,
	detail: (id: string) => [...companyKeys.all, "detail", id] as const,
	metadata: (id: string, params?: { page?: number; limit?: number }) =>
		params ? ([...companyKeys.all, "metadata", id, params] as const) : ([...companyKeys.all, "metadata", id] as const),
};

export const profileKeys = {
	all: ["profiles"] as const,
	adminUserProfiles: (userId: string) => ["admin", "users", userId, "profiles"] as const,
	adminUserProfilePreferences: (userId: string, profileId: string) =>
		[...profileKeys.adminUserProfiles(userId), profileId, "preferences"] as const,
	preferences: (profileId: string) => [...profileKeys.all, profileId, "preferences"] as const,
};

export const mediaKeys = {
	all: ["media"] as const,
	file: (id: string) => ["media", id] as const,
	files: () => ["media-files"] as const,
	byMetadata: (metadataId: string | null | undefined) => ["media-files", "by-metadata", metadataId] as const,
	byEpisode: (episodeId: string | null | undefined) => ["media-files", "by-episode", episodeId] as const,
	artifacts: (mediaFileId?: string) => ["media-files", mediaFileId, "artifacts"] as const,
	artifactContent: (mediaFileId?: string, artifactId?: string) => ["media-files", mediaFileId, "artifacts", artifactId, "vtt"] as const,
	markers: (mediaFileId: string) => ["media-files", mediaFileId, "markers"] as const,
	adminFiles: (params?: { page?: number; limit?: number; fileName?: string; sortBy?: string; sortOrder?: string }) =>
		params ? (["admin", "media-files", params] as const) : (["admin", "media-files"] as const),
	adminFile: (id: string) => ["admin", "media-file", id] as const,
	adminByMetadata: (metadataId: string) => ["admin", "media-files", "by-metadata", metadataId] as const,
	detailsModal: (params: { metadataId?: string; episodeId?: string }) => ["media-files", "details-modal", params] as const,
	audit: (operationId?: string) => ["admin", "media-files", "audit", operationId ?? "none"] as const,
};

export const pluginKeys = {
	all: ["plugins"] as const,
	list: () => [...pluginKeys.all, "list"] as const,
	uiManifest: () => [...pluginKeys.all, "ui-manifest"] as const,
	catalog: () => [...pluginKeys.all, "catalog"] as const,
	repositories: () => [...pluginKeys.all, "repositories"] as const,
	playbackPreRoll: (pluginId: string, mediaFileId: string) => [...pluginKeys.all, "pre-roll", pluginId, mediaFileId] as const,
	search: (pluginId: string, term: string) => [...pluginKeys.all, "search", pluginId, term] as const,
};

export const adminKeys = {
	all: ["admin"] as const,
	usersAll: () => [...adminKeys.all, "users"] as const,
	users: (search: string, params?: { page?: number; limit?: number }) => {
		const base = [...adminKeys.all, "users", search] as const;

		return params ? ([...base, params] as const) : base;
	},
	user: (userId: string) => [...adminKeys.all, "user", userId] as const,
	userFull: (userId?: string) => [...adminKeys.all, "users", userId, "full"] as const,
	plugins: () => [...adminKeys.all, "plugins"] as const,
	pluginConfig: (pluginId: string) => [...adminKeys.plugins(), pluginId, "config"] as const,
	workerOperations: (params?: { page?: number; limit?: number; status?: string }) =>
		params ? ([...adminKeys.all, "worker-operations", params] as const) : ([...adminKeys.all, "worker-operations"] as const),
	workerOperation: (operationId: string) => [...adminKeys.all, "worker-operation", operationId] as const,
	workers: () => [...adminKeys.all, "workers"] as const,
	processes: () => [...adminKeys.all, "processes"] as const,
	workerOperationJobs: (operationId: string, params?: { page?: number; limit?: number; status?: string; search?: string }) =>
		params
			? ([...adminKeys.all, "worker-operation-jobs", operationId, params] as const)
			: ([...adminKeys.all, "worker-operation-jobs", operationId] as const),
	workerOperationJobsPrefix: () => [...adminKeys.all, "worker-operation-jobs"] as const,
	stats: () => [...adminKeys.all, "stats"] as const,
	cacheStats: () => [...adminKeys.all, "cache-stats"] as const,
	logFiles: () => [...adminKeys.all, "log-files"] as const,
	logsAll: ["admin-logs"] as const,
	logs: (params: object) => ["admin-logs", params] as const,
	audit: (params: object) => ["admin-audit", params] as const,
	filesystemBrowse: (path?: string) => [...adminKeys.all, "filesystem", "browse", path] as const,
	workerOperationPrefix: () => [...adminKeys.all, "worker-operation"] as const,
	userPrefix: (userId: string) => [...adminKeys.all, "users", userId] as const,
	genres: (search?: string, params?: { page?: number; limit?: number }) => {
		const base = search ? (["admin-genres", search] as const) : (["admin-genres"] as const);

		return params ? ([...base, params] as const) : base;
	},
	keywords: (search?: string, params?: { page?: number; limit?: number }) => {
		const base = search ? (["admin-keywords", search] as const) : (["admin-keywords"] as const);

		return params ? ([...base, params] as const) : base;
	},
	people: (search?: string, params?: { page?: number; limit?: number }) => {
		const base = search ? (["admin-people", search] as const) : (["admin-people"] as const);

		return params ? ([...base, params] as const) : base;
	},
	collections: (search?: string) => (search ? (["admin-collections", search] as const) : (["admin-collections"] as const)),
	collectionDetail: (id: string) => [...adminKeys.collections(), id] as const,
	companies: (search?: string, params?: { page?: number; limit?: number }) => {
		const base = search ? (["admin-companies", search] as const) : (["admin-companies"] as const);

		return params ? ([...base, params] as const) : base;
	},
	resources: () => [...adminKeys.all, "resources"] as const,
	trickplayStats: () => [...adminKeys.all, "trickplay", "stats"] as const,
	ffmpegCapabilities: () => [...adminKeys.all, "ffmpeg-capabilities"] as const,
	analytics: (days?: number) => (days ? ([...adminKeys.all, "analytics", days] as const) : ([...adminKeys.all, "analytics"] as const)),
	liveActivity: () => [...adminKeys.all, "live-activity"] as const,
	backups: () => [...adminKeys.all, "database", "backups"] as const,
	metadataProviders: () => [...adminKeys.all, "metadata-providers"] as const,
	mediaMarkers: () => [...adminKeys.all, "media-markers"] as const,
	remoteAccessDiagnostics: () => [...adminKeys.all, "network", "remote-access"] as const,
};

export const providersKeys = {
	all: ["providers"] as const,
	search: (mediaType: string, query: { title: string; year?: number; providerId?: string; externalId?: string }) =>
		[
			...providersKeys.all,
			"search",
			mediaType,
			query.title,
			query.year ?? null,
			query.providerId ?? null,
			query.externalId ?? null,
		] as const,
	configurations: () => [...providersKeys.all, "configurations"] as const,
};

export const watchedHistoryKeys = {
	all: ["watched-history"] as const,
	/** Prefix for every history-list variant (distinct from insights/wrapped). */
	listAll: () => [...watchedHistoryKeys.all, "list"] as const,
	list: (limit: number) => [...watchedHistoryKeys.listAll(), limit] as const,
	insights: (range: string) => [...watchedHistoryKeys.all, "insights", range] as const,
	wrapped: (year?: number) =>
		year ? ([...watchedHistoryKeys.all, "wrapped", year] as const) : ([...watchedHistoryKeys.all, "wrapped"] as const),
};

export const discoveryKeys = {
	all: ["discover"] as const,
	view: () => ["discover", "view"] as const,
};

export const setupKeys = {
	status: () => ["setup", "status"] as const,
};

export const episodeKeys = {
	all: ["episodes"] as const,
	bySeason: (seasonId: string | null, params?: { page?: number; limit?: number }) =>
		params ? ([...episodeKeys.all, seasonId, params] as const) : ([...episodeKeys.all, seasonId] as const),
	infinite: (seasonId: string | null, limit?: number) =>
		limit !== undefined
			? ([...episodeKeys.all, "infinite", seasonId, limit] as const)
			: ([...episodeKeys.all, "infinite", seasonId] as const),
	byMetadata: (metadataId: string, limit?: number) =>
		limit !== undefined
			? ([...episodeKeys.all, "metadata", metadataId, limit] as const)
			: ([...episodeKeys.all, "metadata", metadataId] as const),
};

export const seasonKeys = {
	all: ["seasons"] as const,
	byMetadata: (metadataId: string) => ["seasons", metadataId] as const,
};

export const personKeys = {
	all: ["person"] as const,
	detail: (personId: string) => ["person", personId] as const,
};

export const downloadKeys = {
	all: ["downloads"] as const,
	list: () => [...downloadKeys.all, "list"] as const,
	status: (jobId?: string | null) => [...downloadKeys.all, "status", jobId] as const,
	adminJobs: () => [...downloadKeys.all, "admin", "jobs"] as const,
};
