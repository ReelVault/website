/** Shared provider-name/URL helpers — single source for admin and web details. */

function matchProviderKey(name: string): "tmdb" | "imdb" | "tvdb" | "trakt" | "metacritic" | "rotten" | null {
	const lower = name.toLowerCase();
	if (lower.includes("tmdb")) return "tmdb";

	if (lower.includes("imdb")) return "imdb";

	if (lower.includes("tvdb")) return "tvdb";

	if (lower.includes("trakt")) return "trakt";

	if (lower.includes("metacritic")) return "metacritic";

	if (lower.includes("rotten")) return "rotten";

	return null;
}

const PROVIDER_FULL_NAMES = {
	tmdb: "The Movie Database (TMDB)",
	imdb: "Internet Movie Database (IMDb)",
	tvdb: "TheTVDB",
	trakt: "Trakt",
	metacritic: "Metacritic",
	rotten: "Rotten Tomatoes",
} as const;

const PROVIDER_SHORT_NAMES = {
	tmdb: "TMDB",
	imdb: "IMDb",
	tvdb: "TheTVDB",
	trakt: "Trakt",
	metacritic: "Metacritic",
	rotten: "Rotten Tomatoes",
} as const;

export function formatProviderName(name: string): string {
	const key = matchProviderKey(name);

	return key ? PROVIDER_FULL_NAMES[key] : name.toUpperCase();
}

export function formatProviderShortName(name: string): string {
	const key = matchProviderKey(name);

	return key ? PROVIDER_SHORT_NAMES[key] : name.toUpperCase();
}

export function getProviderUrl(name: string, externalId: string, type: "movie" | "tv_show"): string | null {
	if (!externalId) return null;

	const key = matchProviderKey(name);
	if (key === "tmdb") {
		return `https://www.themoviedb.org/${type === "tv_show" ? "tv" : "movie"}/${externalId}`;
	}

	if (key === "imdb" || externalId.startsWith("tt")) {
		return `https://www.imdb.com/title/${externalId}`;
	}

	if (key === "tvdb") {
		return `https://thetvdb.com/dereferrer/${type === "tv_show" ? "series" : "movie"}/${externalId}`;
	}

	if (key === "trakt") {
		return `https://trakt.tv/search/${type === "tv_show" ? "shows" : "movies"}?query=${encodeURIComponent(externalId)}`;
	}

	return null;
}
