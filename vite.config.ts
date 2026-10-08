import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { compression } from "vite-plugin-compression2";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Writes the web client version into the build output. The server reads this
 * file to report the UI version (self-update status) — it must ride along with
 * every deployable `dist/`, including Docker and the release archives.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function webVersionPlugin(): Plugin {
	const parsed: unknown = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
	const version = isRecord(parsed) && typeof parsed.version === "string" ? parsed.version : "0.0.0";

	return {
		name: "reelvault-web-version",
		apply: "build",
		closeBundle() {
			writeFileSync(new URL("./dist/version.json", import.meta.url), JSON.stringify({ version }));
		},
	};
}

// Precompressed .br/.gz siblings for every text asset — server.ts picks
// them by Accept-Encoding so LAN/WAN clients never see uncompressed JS.
const COMPRESSIBLE_ASSETS = /\.(js|mjs|css|html|svg|json|txt|vtt)$/;

// index.html is always served through the injected body in server.ts, so its
// .br/.gz siblings are never read — skip compressing it.
const INDEX_HTML_ASSET = /index\.html$/;

// Service-worker routing patterns (top-level so Biome's useTopLevelRegex is happy).
const PWA_ASSET_URL_PATTERN = /\/assets\//;

// Rolldown-native chunking (Vite 8): stable vendor groups, everything else
// follows automatic chunking. First match wins — `ui-button` keeps the eager
// graph (404/error screens) from pulling the whole @base-ui set.
// No "lucide" group on purpose: one merged icon chunk turned eager through the
// two icons the 404/error screens use; per-chunk placement keeps icons with
// their owners instead.
const BASE_UI_COMPONENT_DIR = /node_modules[\\/]@base-ui[\\/]react[\\/]([^\\/]+)[\\/]/;

// @base-ui sub-packages shared between primitives (floating-ui positioning,
// prop merging, render helpers) — collapse them into one `ui-base` chunk rather
// than duplicating them across every `ui-<primitive>` chunk.
const BASE_UI_SHARED_DIRS = new Set([
	"csp-provider",
	"direction-provider",
	"docs",
	"floating-ui-react",
	"internals",
	"merge-props",
	"types",
	"unstable-use-media-query",
	"use-render",
	"utils",
]);

const CHUNK_GROUPS = [
	{ name: "hls", test: /node_modules[\\/]hls\.js[\\/]/ },
	{ name: "router", test: /node_modules[\\/]@tanstack[\\/]react-router[\\/]/ },
	{ name: "query", test: /node_modules[\\/]@tanstack[\\/]react-query[\\/]/ },
	{
		name: "ui-button",
		test: /node_modules[\\/]@base-ui[\\/]react[\\/]esm[\\/]button[\\/]|node_modules[\\/]@base-ui[\\/]react[\\/]button[\\/]/,
	},
	// react-dom must get its own group BEFORE the base-ui groups — otherwise
	// rolldown merges it into the @base-ui chunk and the whole component library
	// turns eager (react-dom is imported by the shell, so ui-core would load on
	// first paint).
	{ name: "react-dom", test: /node_modules[\\/]react-dom[\\/]/ },
	{
		// One chunk per @base-ui primitive so a page pulls only the primitives it
		// actually renders, instead of the whole component library through the
		// first one it touches. Shared internals collapse into `ui-base`.
		name: (moduleId: string) => {
			const component = BASE_UI_COMPONENT_DIR.exec(moduleId)?.[1];

			return component === undefined || BASE_UI_SHARED_DIRS.has(component) ? "ui-base" : `ui-${component}`;
		},
		test: /node_modules[\\/]@base-ui[\\/]/,
	},
	{ name: "i18n-runtime", test: /src[\\/]paraglide[\\/]runtime/ },
	{ name: "vendor", test: /node_modules[\\/]react-dom[\\/]|node_modules[\\/]react[\\/]/ },
];

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const rawApiUrl = env.VITE_REELVAULT_API_URL;
	const apiUrl = rawApiUrl === undefined || rawApiUrl === "" ? "http://localhost:3030" : rawApiUrl;

	return {
		plugins: [
			react({
				compiler: true,
			}),
			webVersionPlugin(),
			tailwindcss(),
			compression({
				include: [COMPRESSIBLE_ASSETS],
				// Skip tiny files (compression saves nothing and doubles the artifact
				// count) and index.html — it is always served through the injected
				// body in server.ts, so its .br/.gz siblings are never read.
				threshold: 1024,
				exclude: [INDEX_HTML_ASSET],
			}),
			paraglideVitePlugin({
				project: "./project.inlang",
				outdir: "./src/paraglide",
				// locale-modules also for production: message-modules emit one JS chunk
				// per translated message (3300+ keys), which pages then pull through a
				// 100+ request dynamic-import waterfall.
				outputStructure: "locale-modules",
			}),
			// Offline / repeat-load app shell. Precache only the HTML and static icons;
			// the content-hashed JS/CSS chunks are cached at runtime as they are
			// visited (precaching all ~350 chunks would download the whole app on
			// install). Never intercept API, realtime or media requests.
			VitePWA({
				registerType: "autoUpdate",
				injectRegister: "auto",
				// The project ships its own manifest (public/site.webmanifest).
				manifest: false,
				workbox: {
					globPatterns: ["**/*.{html,ico,png,svg,webmanifest}"],
					// VitePWA defaults this to "index.html", which registers a
					// precache-first NavigationRoute that would shadow the
					// network-first route below. The precache entry stays for the
					// offline fallback.
					navigateFallback: null,
					cleanupOutdatedCaches: true,
					runtimeCaching: [
						{
							// Navigations prefer the network: the server injects the
							// same-origin API marker into index.html, so a precached
							// shell would pin the wrong API origin. Offline falls back
							// to the precached app shell.
							urlPattern: ({ request, url }) =>
								request.mode === "navigate" &&
								!url.pathname.startsWith("/api") &&
								!url.pathname.startsWith("/v1") &&
								!url.pathname.startsWith("/realtime"),
							handler: "NetworkFirst",
							options: {
								cacheName: "reelvault-pages",
								precacheFallback: { fallbackURL: "/index.html" },
								expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
							},
						},
						{
							urlPattern: PWA_ASSET_URL_PATTERN,
							handler: "CacheFirst",
							options: {
								cacheName: "reelvault-assets",
								expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 365 },
								cacheableResponse: { statuses: [0, 200] },
							},
						},
					],
				},
			}),
			tanstackRouter({
				routesDirectory: "./src/routes",
				generatedRouteTree: "./src/routeTree.gen.ts",
			}),
		],
		resolve: {
			alias: [
				{ find: "@/public", replacement: path.resolve(import.meta.dirname, "./public") },
				{ find: "@/client", replacement: path.resolve(import.meta.dirname, "./src/client") },
				{ find: "@/utils", replacement: path.resolve(import.meta.dirname, "./src/utils") },
				{ find: "@", replacement: path.resolve(import.meta.dirname, "./src") },
			],
		},
		build: {
			target: "es2022",
			cssCodeSplit: true,
			modulePreload: {
				polyfill: false,
			},
			rolldownOptions: {
				output: {
					codeSplitting: {
						groups: CHUNK_GROUPS,
					},
				},
			},
			chunkSizeWarningLimit: 1000,
		},
		server: {
			port: 3000,
			proxy: {
				"/api": {
					target: apiUrl,
					changeOrigin: true,
				},
				"/v1": {
					target: apiUrl,
					changeOrigin: true,
				},
			},
		},
	};
});
