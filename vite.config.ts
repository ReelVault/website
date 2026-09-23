import path from "node:path";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { compression } from "vite-plugin-compression2";

// Precompressed .br/.gz siblings for every text asset — server.ts picks
// them by Accept-Encoding so LAN/WAN clients never see uncompressed JS.
const COMPRESSIBLE_ASSETS = /\.(js|mjs|css|html|svg|json|txt|vtt)$/;

// Rolldown-native chunking (Vite 8): stable vendor groups, everything else
// follows automatic chunking. First match wins — `ui-button` keeps the eager
// graph (404/error screens) from pulling the whole @base-ui set via ui-core.
const CHUNK_GROUPS = [
	{ name: "hls", test: /node_modules[\\/]hls\.js[\\/]/ },
	{ name: "router", test: /node_modules[\\/]@tanstack[\\/]react-router[\\/]/ },
	{ name: "query", test: /node_modules[\\/]@tanstack[\\/]react-query[\\/]/ },
	{
		name: "ui-button",
		test: /node_modules[\\/]@base-ui[\\/]react[\\/]esm[\\/]button[\\/]|node_modules[\\/]@base-ui[\\/]react[\\/]button[\\/]/,
	},
	// react-dom must get its own group BEFORE ui-core — otherwise rolldown merges
	// it into the @base-ui chunk and the whole component library turns eager
	// (react-dom is imported by the shell, so ui-core would load on first paint).
	{ name: "react-dom", test: /node_modules[\\/]react-dom[\\/]/ },
	{ name: "ui-core", test: /node_modules[\\/]@base-ui[\\/]/ },
	{ name: "lucide", test: /node_modules[\\/]lucide-react[\\/]/ },
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
			tailwindcss(),
			compression({
				include: [COMPRESSIBLE_ASSETS],
			}),
			paraglideVitePlugin({
				project: "./project.inlang",
				outputStructure: mode === "development" ? "locale-modules" : "message-modules",
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
