import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	PluginDialogContribution,
	PluginLocalizedText,
	PluginPageContribution,
	PluginSlotContribution,
	PluginSlotName,
	PluginTabContribution,
	PluginTabHostName,
	PluginUiManifest,
	PluginUiManifestResponse,
} from "@reelvault/sdk/plugin";
import { useRealtimeEvent } from "@/client/hooks/use-realtime";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { getAppLocale } from "@/utils/locale";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { getReelVaultApiUrl, reelvault } from "../client";
import { pluginKeys } from "../utils/query-keys";

export type { PluginDialogContribution, PluginPageContribution, PluginSlotContribution, PluginTabContribution, PluginUiManifest };

/** Contribution types resolved with the owning plugin id and default locale by the host. */
export interface PluginLocaleHint {
	/** Locale the plugin falls back to when a localized text lacks the host locale. */
	defaultLocale?: string | undefined;
}

export type ResolvedPluginPage = PluginPageContribution & { pluginId: string } & PluginLocaleHint;

export type ResolvedPluginTab = Omit<PluginTabContribution, "page"> & { pluginId: string; page: ResolvedPluginPage } & PluginLocaleHint;

export type ResolvedPluginDialog = PluginDialogContribution & { pluginId: string } & PluginLocaleHint;

export type ResolvedPluginSlot = PluginSlotContribution & { pluginId: string } & PluginLocaleHint;

export function usePluginUiManifest() {
	return useQuery<PluginUiManifestResponse>({
		queryKey: pluginKeys.uiManifest(),
		queryFn: async () => await reelvault.plugins.getUiManifest(),
		staleTime: 300_000,
		refetchOnWindowFocus: false,
	});
}

/**
 * Resolves a plugin-provided label against the active locale, then the plugin's
 * declared default locale, then the first available translation.
 */
export function resolvePluginText(text: PluginLocalizedText, defaultLocale?: string, fallback = ""): string {
	if (typeof text === "string") return text;

	const locale = getAppLocale();

	return text[locale] ?? (defaultLocale ? text[defaultLocale] : undefined) ?? Object.values(text)[0] ?? fallback;
}

function collectPluginPages(plugins: Record<string, PluginUiManifest>): ResolvedPluginPage[] {
	const pages: ResolvedPluginPage[] = [];
	for (const [pluginId, manifest] of Object.entries(plugins)) {
		for (const page of manifest.pages ?? []) pages.push({ ...page, pluginId, defaultLocale: manifest.defaultLocale });
	}

	return pages.toSorted((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
}

export function usePluginPages() {
	const { data, isLoading, isError } = usePluginUiManifest();

	return { pages: collectPluginPages(data?.plugins ?? {}), isLoading, isError };
}

/** Pages advertised in a navigation surface (`user` navbar or `admin` sidebar). */
export function usePluginNavPages(target: "user" | "admin") {
	const { pages, isLoading, isError } = usePluginPages();

	return { pages: pages.filter((page) => page.nav === target), isLoading, isError };
}

export function usePluginSlots(slotName: PluginSlotName) {
	const { data, isLoading, isError } = usePluginUiManifest();

	const contributions: ResolvedPluginSlot[] = [];
	if (data?.plugins) {
		for (const [pluginId, manifest] of Object.entries(data.plugins)) {
			for (const contribution of manifest.slots?.[slotName] ?? []) {
				contributions.push({ pluginId, defaultLocale: manifest.defaultLocale, ...contribution });
			}
		}
	}

	return { contributions: contributions.toSorted((a, b) => (a.priority ?? 100) - (b.priority ?? 100)), isLoading, isError };
}

export function usePluginTabs(host: PluginTabHostName) {
	const { data, isLoading, isError } = usePluginUiManifest();

	const tabs: ResolvedPluginTab[] = [];
	if (data?.plugins) {
		for (const [pluginId, manifest] of Object.entries(data.plugins)) {
			const pageIndex = new Map(
				(manifest.pages ?? []).map((page) => [page.id, { ...page, pluginId, defaultLocale: manifest.defaultLocale }]),
			);
			for (const tab of manifest.tabs?.[host] ?? []) {
				const page = pageIndex.get(tab.page);
				if (page) tabs.push({ ...tab, pluginId, defaultLocale: manifest.defaultLocale, page });
			}
		}
	}

	return { tabs: tabs.toSorted((a, b) => (a.priority ?? 100) - (b.priority ?? 100)), isLoading, isError };
}

export function usePluginDialogs() {
	const { data } = usePluginUiManifest();

	const byId = new Map<string, ResolvedPluginDialog>();
	if (data?.plugins) {
		for (const [pluginId, manifest] of Object.entries(data.plugins)) {
			for (const dialog of manifest.dialogs ?? []) {
				byId.set(`${pluginId}:${dialog.id}`, { ...dialog, pluginId, defaultLocale: manifest.defaultLocale });
			}
		}
	}

	const getDialog = (pluginId: string, dialogId: string): ResolvedPluginDialog | undefined => byId.get(`${pluginId}:${dialogId}`);

	return { getDialog };
}

/** Resolves a plugin page by id within a plugin's manifest. */
export function findPluginPage(manifest: PluginUiManifest | undefined, pluginId: string, pageId: string): ResolvedPluginPage | undefined {
	const page = (manifest?.pages ?? []).find((candidate) => candidate.id === pageId);

	return page ? { ...page, pluginId } : undefined;
}

export function getPluginUiFileUrl(pluginId: string, filePath: string): string {
	const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

	return `${getReelVaultApiUrl()}/v1/plugins/ui/${pluginId}/${cleanPath}`;
}

/** One pre-play item served by a plugin's `playbackPreRoll` route. */
export interface PluginPreRollEntry {
	kind: "youtube";
	/** YouTube video key, embedded via youtube-nocookie. */
	key: string;
	/** Title of the movie/show the trailer belongs to. */
	title: string;
	trailerName?: string | undefined;
	imageUrl?: string | undefined;
	metadataId?: string | undefined;
}

const EMPTY_PRE_ROLL: PluginPreRollEntry[] = [];

/**
 * Pre-play content for the player (cinema mode): consults the UI manifest for a
 * plugin declaring `playbackPreRoll` and fetches its entries for this file.
 * An absent provider (plugin disabled or missing) means "no pre-roll" — the
 * player must start immediately without waiting for anything.
 */
export function usePlaybackPreRoll(mediaFileId: string | undefined) {
	const { data, isLoading } = usePluginUiManifest();

	// First enabled plugin declaring a pre-roll route. Recomputed per render —
	// the manifest map is tiny and useMemo trips the manual-memoization lint.
	let provider: { pluginId: string; endpoint: string } | null = null;
	for (const [pluginId, manifest] of Object.entries(data?.plugins ?? {})) {
		if (manifest.playbackPreRoll) {
			provider = { pluginId, endpoint: manifest.playbackPreRoll.endpoint };
			break;
		}
	}

	const query = useQuery({
		queryKey: pluginKeys.playbackPreRoll(provider?.pluginId ?? "", mediaFileId ?? ""),
		enabled: Boolean(mediaFileId) && provider !== null,
		queryFn: async (): Promise<PluginPreRollEntry[]> => {
			if (!(provider && mediaFileId)) return EMPTY_PRE_ROLL;

			const response = await reelvault.plugins.call<{ entries?: PluginPreRollEntry[] }>(provider.pluginId, provider.endpoint, {
				query: { mediaFileId },
			});

			return response.entries ?? EMPTY_PRE_ROLL;
		},
		staleTime: 10 * 60_000,
		refetchOnWindowFocus: false,
	});

	return {
		/** A pre-roll provider exists in the manifest — the player must wait for it. */
		isEnabled: provider !== null,
		/** Provider exists and its entries are still being fetched. */
		isPending: provider !== null && query.isPending,
		entries: query.data ?? EMPTY_PRE_ROLL,
		isLoadingManifest: isLoading,
	};
}

/** One title a search-extending plugin returns for a query. */
export interface PluginSearchItem {
	providerId: string;
	externalId: string;
	mediaType: "movie" | "tv_show";
	title: string;
	year?: number | undefined;
	posterPath?: string | undefined;
	/** Fully-resolved poster URL from the plugin (provider paths are opaque to the host). */
	imageUrl?: string | undefined;
	overview?: string | undefined;
	/** Availability in this library / request pipeline. */
	state: "available" | "pending" | "approved" | "rejected" | "none";
}

export interface PluginSearchProvider {
	pluginId: string;
	endpoint: string;
	requestEndpoint?: string | undefined;
	/** Resolved URL path segment of the item detail page, when declared. */
	itemPagePath?: string | undefined;
}

const EMPTY_PLUGIN_SEARCH: PluginSearchItem[] = [];

/** The manifest declaration of the first plugin extending global search, if any. */
export function usePluginSearchProvider(): PluginSearchProvider | null {
	const { data } = usePluginUiManifest();
	let provider: PluginSearchProvider | null = null;
	for (const [pluginId, manifest] of Object.entries(data?.plugins ?? {})) {
		const declaration = manifest.searchProvider;
		if (!declaration) continue;

		const detailPage = declaration.itemPage ? manifest.pages?.find((candidate) => candidate.id === declaration.itemPage) : undefined;
		provider = {
			pluginId,
			endpoint: declaration.endpoint,
			requestEndpoint: declaration.requestEndpoint,
			itemPagePath: detailPage?.path,
		};
		break;
	}

	return provider;
}

/**
 * Provider titles for the global search (e.g. media-requests). Mirrors the
 * native search gating (debounced term, ≥2 chars) and exposes the request
 * action when the plugin declares a request endpoint.
 */
export function usePluginSearch(provider: PluginSearchProvider | null, term: string, enabled: boolean) {
	const queryClient = useQueryClient();
	const trimmed = term.trim();

	const query = useQuery({
		queryKey: pluginKeys.search(provider?.pluginId ?? "", trimmed),
		enabled: enabled && provider !== null && trimmed.length >= 2,
		queryFn: async (): Promise<PluginSearchItem[]> => {
			if (!provider) return EMPTY_PLUGIN_SEARCH;

			const response = await reelvault.plugins.call<{ items?: PluginSearchItem[] }>(provider.pluginId, provider.endpoint, {
				query: { query: trimmed },
			});

			return response.items ?? EMPTY_PLUGIN_SEARCH;
		},
		staleTime: 60_000,
	});

	const requestMutation = useMutation({
		mutationFn: async (item: PluginSearchItem) => {
			if (!provider?.requestEndpoint) throw new Error("Request action is not available");

			return await reelvault.plugins.call(provider.pluginId, provider.requestEndpoint, {
				method: "POST",
				body: {
					title: item.title,
					mediaType: item.mediaType,
					year: item.year,
					providerId: item.providerId,
					externalId: item.externalId,
					posterPath: item.posterPath,
					overview: item.overview,
				},
			});
		},
		onSuccess: async () => {
			toast.success(m.components_search_plugin_requested_toast());
			await queryClient.invalidateQueries({ queryKey: pluginKeys.search(provider?.pluginId ?? "", trimmed) });
		},
		onError: (error) => {
			console.error("Failed to create plugin request", error);
			toastError(m.components_search_plugin_request_failed(), error);
		},
	});

	return {
		items: query.data ?? EMPTY_PLUGIN_SEARCH,
		isFetching: query.isFetching,
		request: requestMutation.mutateAsync,
		requestingItem: requestMutation.variables ?? null,
		isRequesting: requestMutation.isPending,
	};
}

/** Keeps plugin surfaces fresh: manifest + lists re-fetch when a plugin is enabled/disabled live. */
export function usePluginManifestRealtimeSync(): void {
	const queryClient = useQueryClient();

	const invalidate = () =>
		Promise.all([
			queryClient.invalidateQueries({ queryKey: pluginKeys.uiManifest() }),
			queryClient.invalidateQueries({ queryKey: pluginKeys.list() }),
		]);

	useRealtimeEvent("plugin:enabled", () => detach(invalidate));
	useRealtimeEvent("plugin:disabled", () => detach(invalidate));
}
