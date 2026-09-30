import path from "node:path";

/** Reads an env var, treating unset and empty the same, with a fallback. */
function envValue(name: string, fallback: string): string {
	const value = process.env[name];
	if (value === undefined || value === "") {
		return fallback;
	}

	return value;
}

const PORT = Number(envValue("PORT", "3000"));
const HOST = envValue("HOST", "0.0.0.0");
const DIST_DIR = path.resolve(import.meta.dirname, "./dist");

const indexHtml = Bun.file(path.join(DIST_DIR, "index.html"));

if (!(await indexHtml.exists())) {
	console.error("❌ 'dist/index.html' not found. Please run 'bun run build' before starting the production server.");
	process.exit(1);
}

const API_PROXY_TARGET = envValue("REELVAULT_API_URL", envValue("VITE_REELVAULT_API_URL", ""));

const HTML_CONTENT_TYPE = "text/html; charset=utf-8";
const HEAD_TAG = "<head>";
/**
 * Tells the web client it is served by the API on the same origin, so it talks
 * to this server's `/v1` proxy instead of guessing localhost:3030. The ReelVault
 * server injects the same marker; without it a standalone `server.ts` deployment
 * loaded a blank app pointed at the wrong port.
 */
const API_ORIGIN_META_TAG = '<meta name="reelvault-api-origin" content="same-origin">';

/** Files that must never be served from a stale cache (update checks read them). */
const NO_CACHE_FILES = new Set(["version.json"]);

let indexBody: Promise<string> | undefined;

/** index.html with the same-origin marker injected, read once. */
function getIndexBody(): Promise<string> {
	indexBody ??= (async () => {
		const raw = await indexHtml.text();
		const headIndex = raw.indexOf(HEAD_TAG);

		return headIndex >= 0
			? `${raw.slice(0, headIndex + HEAD_TAG.length)}${API_ORIGIN_META_TAG}${raw.slice(headIndex + HEAD_TAG.length)}`
			: raw;
	})();

	return indexBody;
}

function htmlResponse(body: string): Response {
	return new Response(body, { headers: { "Content-Type": HTML_CONTENT_TYPE, "Cache-Control": "no-cache" } });
}

/** True when the Accept-Encoding header lists `encoding` with a non-zero q-value. */
// `includes("br")` also matched e.g. "gzip;q=0" tokens and substrings.
function acceptsEncoding(header: string, encoding: string): boolean {
	return header.split(",").some((part) => {
		const [token, ...params] = part.trim().split(";");
		if (token?.trim().toLowerCase() !== encoding) return false;

		const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));

		return q === undefined || Number(q.slice(2)) > 0;
	});
}

/** Resolves a request pathname to a file inside DIST_DIR, or undefined if it escapes it. */
// previously only leading `../` was stripped and the joined path was never
// checked against DIST_DIR.
function resolveDistPath(pathname: string): string | undefined {
	let decoded: string;
	try {
		decoded = decodeURIComponent(pathname);
	} catch {
		return undefined;
	}

	if (decoded.includes("\0")) return undefined;

	const resolved = path.resolve(DIST_DIR, `.${path.normalize(decoded)}`);

	return resolved === DIST_DIR || resolved.startsWith(DIST_DIR + path.sep) ? resolved : undefined;
}

Bun.serve({
	port: PORT,
	hostname: HOST,
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <TODO>
	async fetch(req, server) {
		const url = new URL(req.url);

		if (API_PROXY_TARGET && (url.pathname.startsWith("/api") || url.pathname.startsWith("/v1"))) {
			const targetUrl = new URL(url.pathname + url.search, API_PROXY_TARGET);
			// Ask the backend for an uncompressed body: Bun's fetch already decodes
			// the upstream encoding, so forwarding the original `content-encoding`
			// made the browser try to decode an already-decoded body
			// (ERR_CONTENT_DECODING_FAILED).
			const proxyHeaders = new Headers(req.headers);
			proxyHeaders.set("accept-encoding", "identity");

			// let the backend see the original client instead of this server.
			// `host` is dropped so fetch sets it for the target; the original goes
			// into x-forwarded-host.
			const originalHost = proxyHeaders.get("host");
			proxyHeaders.delete("host");
			if (originalHost) proxyHeaders.set("x-forwarded-host", originalHost);

			proxyHeaders.set("x-forwarded-proto", url.protocol.replace(":", ""));

			const clientIp = server.requestIP(req)?.address;
			if (clientIp) {
				const previous = proxyHeaders.get("x-forwarded-for");
				proxyHeaders.set("x-forwarded-for", previous ? `${previous}, ${clientIp}` : clientIp);
			}

			return fetch(targetUrl.toString(), {
				method: req.method,
				headers: proxyHeaders,
				body: req.body,
				redirect: "manual",
			});
		}

		const filePath = resolveDistPath(url.pathname);
		if (filePath === undefined) {
			return new Response("Forbidden", { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } });
		}

		const fileName = path.basename(filePath);

		const file = Bun.file(filePath);
		if (await file.exists()) {
			const stat = await file.stat();
			if (!stat.isDirectory()) {
				// Every HTML entry goes through the injected body so the marker is
				// always present (the precompressed .br/.gz siblings lack it).
				if (fileName === "index.html") return htmlResponse(await getIndexBody());

				const isHashedAsset = url.pathname.startsWith("/assets/");
				// version.json is polled for update checks; an hour of caching
				// would keep showing the previous version after a deploy.
				let cacheControl: string;
				if (NO_CACHE_FILES.has(fileName)) {
					cacheControl = "no-cache";
				} else if (isHashedAsset) {
					cacheControl = "public, max-age=31536000, immutable";
				} else {
					cacheControl = "public, max-age=3600";
				}

				const headers: Record<string, string> = {
					"Cache-Control": cacheControl,
					Vary: "Accept-Encoding",
				};

				// Serve the precompressed sibling produced by vite-plugin-compression2
				// (.br/.gz) when the client advertises support. Bun.file(.type) keeps the
				// MIME of the *original* asset, not of the .br/.gz suffix.
				const acceptEncoding = req.headers.get("accept-encoding") ?? "";
				const brFile = acceptsEncoding(acceptEncoding, "br") ? Bun.file(`${filePath}.br`) : undefined;
				const gzFile = !brFile && acceptsEncoding(acceptEncoding, "gzip") ? Bun.file(`${filePath}.gz`) : undefined;
				const compressed = brFile ?? gzFile;
				if (compressed && (await compressed.exists())) {
					return new Response(compressed, {
						headers: {
							...headers,
							"Content-Type": file.type,
							"Content-Encoding": brFile ? "br" : "gzip",
						},
					});
				}

				return new Response(file, { headers });
			}
		}

		// A missing hashed asset must 404, not fall back to index.html — returning
		// HTML for a .js/.css request breaks caching and hides deploy mistakes.
		if (url.pathname.startsWith("/assets/")) {
			return new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
		}

		return htmlResponse(await getIndexBody());
	},
});

// Startup banner goes to stdout, matching what console.log used to print.
// HOST/PORT come from our own env resolution, so they are always defined.
process.stdout.write(`ReelVault Website running at http://${HOST}:${PORT}\n`);
