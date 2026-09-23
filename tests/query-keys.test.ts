import { describe, expect, it } from "bun:test";
import { emptyPagination } from "@/client/utils/query-helpers";
import {
	adminKeys,
	downloadKeys,
	episodeKeys,
	mePlaybackKeys,
	metadataKeys,
	providersKeys,
	watchedHistoryKeys,
} from "@/client/utils/query-keys";
import { redirectSearchValidator } from "@/types/search-params";

describe("query key factories", () => {
	it("providersKeys.search is stable for identical inputs", () => {
		expect(providersKeys.search("movie", { title: "Matrix", year: 1999 })).toEqual(
			providersKeys.search("movie", { title: "Matrix", year: 1999 }),
		);
	});

	it("providersKeys.search distinguishes type/title/year", () => {
		expect(providersKeys.search("movie", { title: "Matrix", year: 1999 })).not.toEqual(
			providersKeys.search("tv_show", { title: "Matrix", year: 1999 }),
		);
		expect(providersKeys.search("movie", { title: "Matrix" })).not.toEqual(providersKeys.search("movie", { title: "Matrix", year: 1999 }));
		expect(providersKeys.search("movie", { title: "", providerId: "tmdb", externalId: "603" })).not.toEqual(
			providersKeys.search("movie", { title: "", providerId: "mal", externalId: "1" }),
		);
		expect(providersKeys.search("movie", { title: "", providerId: "mal", externalId: "1" })).not.toEqual(
			providersKeys.search("movie", { title: "", providerId: "mal", externalId: "2" }),
		);
	});

	it("admin worker keys share one canonical bucket (alias-free)", () => {
		expect(adminKeys.workers()).toEqual(["admin", "workers"]);
		expect(adminKeys.workerOperationJobs("op1")).toEqual(["admin", "worker-operation-jobs", "op1"]);
	});

	it("admin collection-order key differs from public collection key", () => {
		const publicKeys = metadataKeys.collection("c1", "title", "asc");
		const adminKeysForOrder = [...metadataKeys.all, "collection-order", "c1", "title", "asc"] as const;
		expect(adminKeysForOrder).not.toEqual(publicKeys);
	});

	it("mePlaybackKeys suggestions and progress prefix factories match specific keys", () => {
		const metaId = "meta_123";
		expect(mePlaybackKeys.suggestions(metaId)).toEqual([...mePlaybackKeys.suggestionsAll(), metaId]);
		expect(mePlaybackKeys.progress(metaId)).toEqual([...mePlaybackKeys.progressAll(), metaId]);
		expect(mePlaybackKeys.continueWatching()).toEqual(["me", "playback", "continue-watching"]);
	});

	it("downloadKeys factories produce expected keys", () => {
		expect(downloadKeys.all).toEqual(["downloads"]);
		expect(downloadKeys.list()).toEqual(["downloads", "list"]);
		expect(downloadKeys.status("job-1")).toEqual(["downloads", "status", "job-1"]);
		expect(downloadKeys.adminJobs()).toEqual(["downloads", "admin", "jobs"]);
	});

	it("episodeKeys factories produce expected keys with and without params", () => {
		expect(episodeKeys.all).toEqual(["episodes"]);
		expect(episodeKeys.bySeason("s1")).toEqual(["episodes", "s1"]);
		expect(episodeKeys.bySeason("s1", { page: 2, limit: 20 })).toEqual(["episodes", "s1", { page: 2, limit: 20 }]);
		expect(episodeKeys.infinite("s1")).toEqual(["episodes", "infinite", "s1"]);
		expect(episodeKeys.infinite("s1", 20)).toEqual(["episodes", "infinite", "s1", 20]);
		expect(episodeKeys.byMetadata("m1")).toEqual(["episodes", "metadata", "m1"]);
		expect(episodeKeys.byMetadata("m1", 50)).toEqual(["episodes", "metadata", "m1", 50]);
	});

	it("watchedHistoryKeys isolate the history list from insights/wrapped", () => {
		expect(watchedHistoryKeys.list(100)).toEqual(["watched-history", "list", 100]);
		expect(watchedHistoryKeys.listAll()).toEqual(["watched-history", "list"]);
		expect(watchedHistoryKeys.insights("30d")).toEqual(["watched-history", "insights", "30d"]);
		expect(watchedHistoryKeys.wrapped(2026)).toEqual(["watched-history", "wrapped", 2026]);
		// The list payload key must not collide with the shared root insights/wrapped hang off.
		expect(watchedHistoryKeys.list(100)).not.toEqual(watchedHistoryKeys.all);
	});
});

describe("query helpers", () => {
	it("emptyPagination keeps the requested limit", () => {
		expect(emptyPagination(50)).toEqual({ total: 0, page: 1, limit: 50, totalPages: 1 });
	});
});

describe("redirectSearchValidator", () => {
	it("passes through an optional redirect string", () => {
		expect(redirectSearchValidator({ redirect: "/admin" })).toEqual({ redirect: "/admin" });
		expect(redirectSearchValidator({})).toEqual({});
	});

	it("drops non-string redirect instead of throwing (zod kept out of the eager route graph)", () => {
		expect(redirectSearchValidator({ redirect: 42 })).toEqual({});
	});
});
