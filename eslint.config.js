import babelParser from "@babel/eslint-parser";
import stylistic from "@stylistic/eslint-plugin";
import reactCompiler from "eslint-plugin-react-compiler";

// ESLint is used ONLY as a formatter here (via `eslint --fix`) and for the one
// analysis oxlint does not ship: the React Compiler healthcheck.
// Everything else is handled by Biome (`.biome.json`) and oxlint (`.oxlintrc.json`).
// The Babel parser is syntactic-only (TS + JSX, no typescript package needed) —
// typescript-eslint does not support TS 7.
const babelOptions = {
	parserOptions: {
		requireConfigFile: false,
		babelOptions: {
			presets: [["@babel/preset-typescript", { ignoreExtensions: true }]],
			parserOpts: { plugins: ["jsx"] },
		},
	},
};

export default [
	{
		// Generated / build output — keep in sync with biome.json and .oxlintrc.json
		ignores: ["dist/**", "build/**", "src-tauri/**", "node_modules/**", "**/routeTree.gen.ts", "**/*.gen.ts", "drizzle/**"],
	},
	{
		name: "reelvault/react-compiler",
		files: ["src/**/*.{ts,tsx}"],
		languageOptions: {
			parser: babelParser,
			...babelOptions,
		},
		plugins: {
			"react-compiler": reactCompiler,
		},
		rules: {
			// Reports components the compiler must skip (Rules of React violations).
			// Warn-level: findings become refactor TODOs, not gate failures.
			"react-compiler/react-compiler": "warn",
		},
	},
	{
		name: "reelvault/formatting",
		files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
		languageOptions: {
			parser: babelParser,
			...babelOptions,
		},
		plugins: {
			"@stylistic": stylistic,
		},
		rules: {
			"@stylistic/padding-line-between-statements": [
				"error",

				// 1. Blank line BEFORE `return` (separate the result from the logic above).
				{ blankLine: "always", prev: "*", next: "return" },

				// 2. Blank line AFTER control-flow statements (guard clauses / loops / blocks).
				//    e.g. `if (...) continue;` is followed by a blank line before the next statement.
				{ blankLine: "always", prev: ["if", "for", "while", "switch", "try", "do", "iife"], next: "*" },

				// 3. Blank line BEFORE function / class / export declarations.
				{ blankLine: "always", prev: "*", next: ["function", "class", "export"] },

				// 4. Blank line AFTER directives (e.g. "use strict", "use client").
				{ blankLine: "always", prev: "directive", next: "*" },
			],
		},
	},
];
