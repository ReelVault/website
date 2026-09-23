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

Bun.serve({
	port: PORT,
	hostname: HOST,
	async fetch(req) {
		const url = new URL(req.url);

		if (API_PROXY_TARGET && (url.pathname.startsWith("/api") || url.pathname.startsWith("/v1"))) {
			const targetUrl = new URL(url.pathname + url.search, API_PROXY_TARGET);

			return fetch(targetUrl.toString(), {
				method: req.method,
				headers: req.headers,
				body: req.body,
				redirect: "manual",
			});
		}

		const safePath = path.normalize(url.pathname).replace(SAFE_PATH_TRAVERSAL_REGEX, "");
		const filePath = path.join(DIST_DIR, safePath);

		const file = Bun.file(filePath);
		if (await file.exists()) {
			const stat = await file.stat();
			if (!stat.isDirectory()) {
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

		return new Response(indexHtml, {
			headers: {
				"Content-Type": "text/html; charset=utf-8",
				"Cache-Control": "no-cache",
			},
		});
	},
});

// Startup banner goes to stdout, matching what console.log used to print.
// HOST/PORT come from our own env resolution, so they are always defined.
process.stdout.write(`ReelVault Website running at http://${HOST}:${PORT}\n`);
