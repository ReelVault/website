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
const SAFE_PATH_TRAVERSAL_REGEX = /^(\.\.[/\\])+/;

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

Bun.serve({
	port: PORT,
	hostname: HOST,
	async fetch(req) {
		const url = new URL(req.url);

		if (API_PROXY_TARGET && (url.pathname.startsWith("/api") || url.pathname.startsWith("/v1"))) {
			const targetUrl = new URL(url.pathname + url.search, API_PROXY_TARGET);
			// Ask the backend for an uncompressed body: Bun's fetch already decodes
			// the upstream encoding, so forwarding the original `content-encoding`
			// made the browser try to decode an already-decoded body
			// (ERR_CONTENT_DECODING_FAILED).
			const proxyHeaders = new Headers(req.headers);
			proxyHeaders.set("accept-encoding", "identity");

			return fetch(targetUrl.toString(), {
				method: req.method,
				headers: proxyHeaders,
				body: req.body,
				redirect: "manual",
			});
		}

		const safePath = path.normalize(url.pathname).replace(SAFE_PATH_TRAVERSAL_REGEX, "");
		const filePath = path.join(DIST_DIR, safePath);
		const fileName = path.basename(filePath);

		const file = Bun.file(filePath);
		if (await file.exists()) {
			const stat = await file.stat();
			if (!stat.isDirectory()) {
				// Every HTML entry goes through the injected body so the marker is
				// always present (the precompressed .br/.gz siblings lack it).
				if (fileName === "index.html") return htmlResponse(await getIndexBody());

				const isHashedAsset = url.pathname.startsWith("/assets/");
				const headers: Record<string, string> = {
					"Cache-Control": isHashedAsset ? "public, max-age=31536000, immutable" : "public, max-age=3600",
					Vary: "Accept-Encoding",
				};

				// Serve the precompressed sibling produced by vite-plugin-compression2
				// (.br/.gz) when the client advertises support. Bun.file(.type) keeps the
				// MIME of the *original* asset, not of the .br/.gz suffix.
				const acceptEncoding = req.headers.get("accept-encoding") ?? "";
				const brFile = acceptEncoding.includes("br") ? Bun.file(`${filePath}.br`) : undefined;
				const gzFile = !brFile && acceptEncoding.includes("gzip") ? Bun.file(`${filePath}.gz`) : undefined;
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
