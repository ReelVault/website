import { describe, expect, test } from "bun:test";
import { reelvault, withPlaybackProgressKeepalive } from "@/client/client";

const PROGRESS_URL = "https://api.example.com/v1/me/media-files/42/playback-progress";

describe("withPlaybackProgressKeepalive", () => {
	test("sets keepalive on a progress PUT", () => {
		const options: RequestInit = { method: "PUT", body: '{"position":12}' };

		const result = withPlaybackProgressKeepalive(PROGRESS_URL, options);

		expect(result.url).toBe(PROGRESS_URL);
		expect(result.options.keepalive).toBe(true);
		expect(result.options.method).toBe("PUT");
		expect(result.options.body).toBe('{"position":12}');
	});

	test("sets keepalive on a relative progress URL", () => {
		const result = withPlaybackProgressKeepalive("/v1/me/media-files/42/playback-progress", { method: "PUT" });

		expect(result.options.keepalive).toBe(true);
	});

	test("sets keepalive without a /v1 prefix", () => {
		const result = withPlaybackProgressKeepalive("http://localhost:3030/me/media-files/42/playback-progress", {
			method: "PUT",
		});

		expect(result.options.keepalive).toBe(true);
	});

	test("matches the method case-insensitively", () => {
		const result = withPlaybackProgressKeepalive(PROGRESS_URL, { method: "put" });

		expect(result.options.keepalive).toBe(true);
	});

	test("leaves a GET to the same URL untouched", () => {
		const options: RequestInit = { method: "GET", headers: { "x-test": "1" } };

		const result = withPlaybackProgressKeepalive(PROGRESS_URL, options);

		expect(result.url).toBe(PROGRESS_URL);
		expect(result.options.keepalive).toBeUndefined();
		expect(result.options.method).toBe("GET");
		expect(result.options.headers).toEqual({ "x-test": "1" });
	});

	test("leaves a PUT to another path untouched", () => {
		const result = withPlaybackProgressKeepalive("https://api.example.com/v1/me/media-files/42/stream-prefs", {
			method: "PUT",
		});

		expect(result.options.keepalive).toBeUndefined();
	});

	test("does not match a progress path outside media files", () => {
		const result = withPlaybackProgressKeepalive("https://api.example.com/v1/media-files/42/playback-progress", {
			method: "PUT",
		});

		expect(result.options.keepalive).toBeUndefined();
	});

	test("does not mutate the original options", () => {
		const options: RequestInit = { method: "PUT", headers: { "x-test": "1" } };

		const result = withPlaybackProgressKeepalive(PROGRESS_URL, options);

		expect(options).toEqual({ method: "PUT", headers: { "x-test": "1" } });
		expect(options.keepalive).toBeUndefined();
		expect(result.options).not.toBe(options);
		expect(result.options.headers).toBe(options.headers);
	});
});

describe("ReelVaultClient wiring", () => {
	test("the exported client sends progress writes with keepalive, but not other writes", async () => {
		const originalFetch = globalThis.fetch;
		const calls: Array<{ url: string; init: RequestInit | undefined }> = [];

		globalThis.fetch = Object.assign(
			(input: RequestInfo | URL, init?: RequestInit) => {
				let url: string;
				if (typeof input === "string") url = input;
				else if (input instanceof URL) url = input.href;
				else url = input.url;
				calls.push({ url, init });

				return Promise.resolve(
					new Response(JSON.stringify({ success: true, updated: 1 }), {
						status: 200,
						headers: { "content-type": "application/json" },
					}),
				);
			},
			{ preconnect: originalFetch.preconnect },
		);

		try {
			await reelvault.me.updatePlaybackProgress("file-42", { position: 90 });
			await reelvault.me.setWatchStateBulk({ mediaFileIds: ["file-1"], watched: true });

			expect(calls).toHaveLength(2);
			expect(calls[0]?.url.endsWith("/v1/me/media-files/file-42/playback-progress")).toBe(true);
			expect(calls[0]?.init?.method).toBe("PUT");
			expect(calls[0]?.init?.keepalive).toBe(true);
			expect(calls[1]?.url.endsWith("/v1/me/watch-state/bulk")).toBe(true);
			expect(calls[1]?.init?.method).toBe("POST");
			expect(calls[1]?.init?.keepalive).toBeUndefined();
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});
