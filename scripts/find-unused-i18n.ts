/**
 * Finds i18n message keys that are not referenced anywhere in the app code.
 *
 * Usage:
 *   bun run scripts/find-unused-i18n.ts            # report only
 *   bun run scripts/find-unused-i18n.ts --delete   # remove unused keys from every messages/*.json
 *
 * After `--delete` run `bun run i18n` to recompile the paraglide catalog.
 *
 * Every `messages/*.json` file is picked up automatically as a locale —
 * adding a translation never requires touching this script. The report
 * includes a key-parity check: all locale files must define exactly the same
 * key set (the union is compared against every file, so both missing and
 * stray keys are listed per locale).
 *
 * Semantics (intentionally simple): a key counts as used when its exact
 * identifier appears as a word anywhere in `src/` (excluding the generated
 * `src/paraglide/`, which names every key) or `tests/`. This over-reports
 * usage, never under-reports it, so `--delete` cannot break a static call
 * site. App code never constructs message keys dynamically (hard rule:
 * static `m.*` references or static code→message maps). The one dynamic
 * channel is `translateByKey` with codes arriving from the server (error or
 * warning envelopes) — keys for those are hard-defined in the server sources
 * and are detected by scanning the sibling `ReelVault.Server` tree for the
 * key in dotted or underscore form; they are reported as `dynamic-only` and
 * never deleted.
 */
import path from "node:path";

const repo = `${import.meta.dir}/..`;
const MESSAGES_DIR = `${repo}/messages`;
const SERVER_DIR = path.resolve(repo, "../ReelVault.Server/src");
const SCAN_DIRS = ["src", "tests"] as const;
const EXCLUDED = ["src/paraglide"];
const deleteMode = process.argv.includes("--delete");

type MessageCatalog = Record<string, string | object>;

const isMessageCatalog = (value: unknown): value is MessageCatalog => {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

	return Object.values(value).every((entry) => typeof entry === "string" || typeof entry === "object");
};

const loadCatalog = async (file: string): Promise<MessageCatalog> => {
	const parsed: unknown = await Bun.file(file).json();
	if (!isMessageCatalog(parsed)) throw new Error(`${file} is not a flat message catalog`);

	return parsed;
};

// Discover every messages/*.json as a locale — no locale list is hardcoded.
const locales: string[] = [];
for await (const rel of new Bun.Glob("*.json").scan({ cwd: MESSAGES_DIR })) {
	locales.push(rel.replace(/\.json$/, ""));
}

locales.sort();

const catalogs = new Map<string, MessageCatalog>();
for (const locale of locales) catalogs.set(locale, await loadCatalog(`${MESSAGES_DIR}/${locale}.json`));

// Key parity: every locale must define exactly the same key set.
const allKeys = new Set<string>();
for (const catalog of catalogs.values()) {
	for (const key of Object.keys(catalog)) allKeys.add(key);
}

const parityIssues: Array<{ locale: string; missing: string[] }> = [];
for (const [locale, catalog] of catalogs) {
	const missing = [...allKeys].filter((key) => !(key in catalog));
	if (missing.length > 0) parityIssues.push({ locale, missing });
}

// One tokenizing pass over all scanned sources; word-boundary match == token presence.
const tokens = new Set<string>();
for (const dir of SCAN_DIRS) {
	const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx,json,html,css}");
	for await (const rel of glob.scan({ cwd: `${repo}/${dir}` })) {
		const abs = `${dir}/${rel}`;
		if (EXCLUDED.some((prefix) => abs.startsWith(prefix))) continue;

		const text = await Bun.file(`${repo}/${abs}`).text();
		for (const token of text.split(/[^A-Za-z0-9_]+/)) {
			if (token.length > 0) tokens.add(token);
		}
	}
}

// Server sources (any file type) — a key whose dotted/underscore form appears
// there may be resolved at runtime by translateByKey, so it must survive --delete.
let serverText: string | undefined;
try {
	const glob = new Bun.Glob("**/*");
	const parts: string[] = [];
	for await (const rel of glob.scan({ cwd: SERVER_DIR, onlyFiles: true })) {
		parts.push(rel, await Bun.file(`${SERVER_DIR}/${rel}`).text());
	}

	serverText = parts.join("\n");
} catch {
	console.log("note: server sources unavailable — dynamic-only detection skipped\n");
}

const isServerReferenced = (key: string): boolean => {
	if (serverText === undefined) return false;

	return serverText.includes(key) || serverText.includes(key.replace(/_/g, "."));
};

// Message keys are never constructed dynamically in app code (hard rule —
// static `m.*` references or static code→message maps only). The one dynamic
// channel left is `translateByKey` with codes that arrive from the server at
// runtime (error/warning envelopes); those keys are hard-defined server-side
// and are detected by the server-source scan above.

const unused: string[] = [];
const dynamicOnly: string[] = [];
for (const key of [...allKeys].toSorted()) {
	if (tokens.has(key)) continue;

	if (isServerReferenced(key)) {
		dynamicOnly.push(key);
		continue;
	}

	unused.push(key);
}

const groupByPrefix = (keys: string[]): Map<string, string[]> => {
	const map = new Map<string, string[]>();
	for (const key of keys) {
		const prefix = key.split("_").slice(0, 2).join("_");
		const list = map.get(prefix) ?? [];
		list.push(key);
		map.set(prefix, list);
	}

	return map;
};

const perLocaleCounts = locales.map((locale) => `${locale}=${Object.keys(catalogs.get(locale) ?? {}).length}`).join(", ");
console.log(`locales (${locales.length}): ${locales.join(", ")} | keys per locale: ${perLocaleCounts} | union: ${allKeys.size}`);

if (parityIssues.length === 0) {
	console.log("key parity: OK — every locale defines the same key set");
} else {
	console.log("KEY PARITY MISMATCH:");
	for (const key of parityIssues.flatMap((issue) => issue.missing).toSorted()) {
		console.log(`  missing: ${key}`);
	}

	for (const issue of parityIssues) {
		console.log(`  ${issue.locale}.json is missing ${issue.missing.length} key(s) from the union`);
	}
}

console.log(`dynamic-only (kept, reachable via translateByKey): ${dynamicOnly.length}`);
for (const [prefix, keys] of groupByPrefix(dynamicOnly)) console.log(`  ${prefix}_… (${keys.length}): ${keys.join(", ")}`);

console.log(`unused keys: ${unused.length}`);
for (const [prefix, keys] of groupByPrefix(unused)) console.log(`  ${prefix}_… (${keys.length}): ${keys.join(", ")}`);

if (deleteMode) {
	if (unused.length === 0) {
		console.log("\nnothing to delete");
	} else {
		const unusedSet = new Set(unused);
		for (const [locale, catalog] of catalogs) {
			const kept: MessageCatalog = {};
			for (const [key, value] of Object.entries(catalog)) {
				if (!unusedSet.has(key)) kept[key] = value;
			}

			await Bun.write(`${MESSAGES_DIR}/${locale}.json`, `${JSON.stringify(kept, null, "\t")}\n`);
		}

		console.log(`\ndeleted ${unused.length} keys from ${locales.length} locale file(s) — now run: bun run i18n`);
	}
}
