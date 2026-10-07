import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { reelvault } from "../client";
import { episodeFields } from "../utils/fields";
import { episodeKeys, metadataKeys } from "../utils/query-keys";
import { useEntityRefreshMutation } from "./use-entity-refresh";
import { useSeasons } from "./use-seasons";

export type EpisodeResponse = Awaited<ReturnType<typeof reelvault.episodes.getAll<typeof episodeFields>>>;

export type EpisodeItem = EpisodeResponse["data"][number];

export interface UseEpisodesOptions {
	page?: number;
	limit?: number;
}

export function useEpisodes(seasonId: string | null, options?: UseEpisodesOptions) {
	const page = options?.page;
	const limit = options?.limit;

	return useQuery({
		queryKey: episodeKeys.bySeason(seasonId, options),
		queryFn: async () => {
			if (!seasonId) return { data: [], total: 0, page: 1, limit: limit ?? 0, totalPages: 0 };

			const res = await reelvault.episodes.getAll({
				seasonId,
				fields: episodeFields,
				...(page !== undefined && { page }),
				...(limit !== undefined && { limit }),
			});

			return res;
		},
		enabled: seasonId !== null,
		placeholderData: keepPreviousData,
		staleTime: 1000 * 60 * 60 * 24,
	});
}

export interface UseEpisodesInfiniteOptions {
	limit?: number;
}

export function useEpisodesInfinite(seasonId: string | null, options: UseEpisodesInfiniteOptions = {}) {
	const { limit = 20 } = options;

	return useInfiniteQuery({
		queryKey: episodeKeys.infinite(seasonId, limit),
		queryFn: async ({ pageParam }) => {
			if (!seasonId) return { data: [], total: 0, page: 1, limit, totalPages: 0 };

			const res = await reelvault.episodes.getAll({
				seasonId,
				fields: episodeFields,
				page: pageParam,
				limit,
			});

			return res;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
		maxPages: 5,
		enabled: seasonId !== null,
		staleTime: 1000 * 60 * 60 * 24,
	});
}

/** Stable empty arrays so the derivation's inputs keep a constant identity. */
const EMPTY_SEASONS: ReadonlyArray<{ id: string; seasonNumber: number }> = [];
const EMPTY_EPISODES: readonly EpisodeItem[] = [];

interface CurrentEpisodeInfo {
	episodeId: string;
	seasonNumber: number;
	episodeNumber: number;
	title: string | null;
}

interface NextEpisodeInfo extends CurrentEpisodeInfo {
	mediaFileId: string;
}

/**
 * Sorts the whole show by season/episode and resolves the current + next
 * episode. Module-level and pure so React Compiler can memoize the call — the
 * previous inline closure re-ran its map/sort over up to 500 episodes on every
 * player render.
 */
function computeEpisodeInfo(
	seasons: ReadonlyArray<{ id: string; seasonNumber: number }>,
	rawEpisodes: readonly EpisodeItem[],
	episodeId: string | null | undefined,
	currentMediaFileId: string,
): { currentEpisode: CurrentEpisodeInfo | null; nextEpisode: NextEpisodeInfo | null } {
	if (seasons.length === 0 || rawEpisodes.length === 0) return { currentEpisode: null, nextEpisode: null };

	const seasonMap = new Map(seasons.map((season) => [season.id, season.seasonNumber]));

	const allEpisodes = rawEpisodes
		.map((ep) => ({
			episodeId: ep.id,
			seasonId: ep.seasonId,
			seasonNumber: seasonMap.get(ep.seasonId) ?? 1,
			episodeNumber: ep.episodeNumber,
			title: ep.title,
			// Continue-watching navigates to the watched file, which on a
			// multi-version episode need not be the first — match against all
			// files, link out via the default one (mirrors the drawer choice).
			mediaFileIds: ep.mediaFiles.map((file) => file.id),
			mediaFileId: (ep.mediaFiles.find((file) => file.isDefault) ?? ep.mediaFiles[0])?.id ?? null,
		}))
		.toSorted((a, b) => a.seasonNumber - b.seasonNumber || a.episodeNumber - b.episodeNumber);

	const currentIndex = allEpisodes.findIndex(
		(ep) => (Boolean(episodeId) && ep.episodeId === episodeId) || ep.mediaFileIds.includes(currentMediaFileId),
	);
	const current = allEpisodes[currentIndex];
	if (currentIndex === -1 || !current) return { currentEpisode: null, nextEpisode: null };

	const candidate = allEpisodes.find((ep, idx) => idx > currentIndex && ep.mediaFileId !== null);

	const nextEpisode: NextEpisodeInfo | null = candidate?.mediaFileId
		? {
				episodeId: candidate.episodeId,
				seasonNumber: candidate.seasonNumber,
				episodeNumber: candidate.episodeNumber,
				title: candidate.title,
				mediaFileId: candidate.mediaFileId,
			}
		: null;

	return {
		currentEpisode: {
			episodeId: current.episodeId,
			seasonNumber: current.seasonNumber,
			episodeNumber: current.episodeNumber,
			title: current.title,
		},
		nextEpisode,
	};
}

export function useNextEpisode({
	metadataId,
	episodeId,
	currentMediaFileId,
}: {
	metadataId: string;
	episodeId?: string | null;
	currentMediaFileId: string;
}) {
	const seasonsQuery = useSeasons(metadataId);

	const episodesQuery = useQuery({
		queryKey: episodeKeys.byMetadata(metadataId, 500),
		queryFn: () =>
			reelvault.episodes.getAll({
				metadataId,
				fields: episodeFields,
				// One call must cover the whole show (server clamps at 500): the server
				// sorts by episodeNumber only, so a small slice mixes seasons and drops
				// the deepest-watched episode — the one continue-watching resumes.
				limit: 500,
			}),
		enabled: Boolean(metadataId),
		staleTime: 1000 * 60 * 60 * 24,
	});

	const isLoading = seasonsQuery.isPending || episodesQuery.isPending;

	const { currentEpisode, nextEpisode } = computeEpisodeInfo(
		seasonsQuery.data?.data ?? EMPTY_SEASONS,
		episodesQuery.data?.data ?? EMPTY_EPISODES,
		episodeId,
		currentMediaFileId,
	);

	return {
		currentEpisode,
		nextEpisode,
		isLoading,
	};
}

// metadataId narrows the metadata-side invalidation to this title's own
// queries — without it every cached library grid/rail would refetch.
export function useRefreshEpisode(metadataId?: string) {
	return useEntityRefreshMutation({
		mutationFn: (episodeId: string) => reelvault.episodes.refresh(episodeId),
		invalidationKeys: metadataId
			? [episodeKeys.all, metadataKeys.byId(metadataId), metadataKeys.detailsView(metadataId)]
			: [episodeKeys.all],
		successMessage: m.toast_episode_metadata_refreshed(),
		errorMessage: m.toast_episode_metadata_refresh_failed(),
	});
}

export function useRefreshEpisodeImage(metadataId?: string) {
	return useEntityRefreshMutation({
		mutationFn: (episodeId: string) => reelvault.episodes.refreshImage(episodeId),
		invalidationKeys: metadataId
			? [episodeKeys.all, metadataKeys.byId(metadataId), metadataKeys.detailsView(metadataId)]
			: [episodeKeys.all],
		successMessage: m.hooks_episode_thumbnail_forced(),
		errorMessage: m.toast_episode_thumbnail_failed(),
	});
}
