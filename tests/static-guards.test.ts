import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Source-level guards for the website. They read the sources and fail on patterns that
 * have caused security or correctness problems: raw HTML sinks outside the reviewed list,
 * dynamic code evaluation, blank-target links without `noopener`, and credentials pasted
 * into the code. Generated paraglide output is excluded.
 */

const SRC = join(import.meta.dir, "..", "src");

/** Files allowed to set raw HTML, each reviewed. Empty: subtitle cues render as React nodes, never as HTML. */
const RAW_HTML_ALLOWLIST = new Set<string>();

const RAW_HTML_SINK = /dangerouslySetInnerHTML|\.innerHTML\s*=|insertAdjacentHTML\(/;
const DYNAMIC_CODE = /(^|[^\w.])eval\s*\(|new Function\s*\(|setTimeout\(\s*["'`]/;
const SAFE_REL = /noopener|noreferrer/;
const SOURCE_FILE = /\.(ts|tsx)$/;
const TEST_FILE = /\.test\.tsx?$/;
const BLANK_TARGET = 'target="_blank"';
const HARDCODED_POLISH_LABEL = /["'`](logi|ID operacji)["'`]/;
const BROWSER_DIALOG_CALL = /(^|[^\w.$])(window\.)?(confirm|alert|prompt)\s*\(/;
/** The card and the details footer each stop a live stream; both confirm in the app's dialog. */
const LIVE_STREAM_STOP_FILES = [
	"pages/admin/_components/live-activity/live-stream-card-controls.tsx",
	"pages/admin/_components/live-activity/live-stream-details-footer.tsx",
];
const CREDENTIAL_PATTERNS = [
	/ghp_[A-Za-z0-9]{20,}/,
	/sk_live_[A-Za-z0-9]{10,}/,
	/AKIA[0-9A-Z]{16}/,
	/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];

/**
 * Files evaluated before the first paint. The code→message catalog
 * (`utils/translate-error`, ~20 KB br) only ever runs on a failure, so it must be
 * reached through a dynamic import from these — a static import drags it back
 * into the eager startup graph.
 */
const STARTUP_FILES = [
	"main.tsx",
	"routes/__root.tsx",
	"pages/root-layout.tsx",
	"client/client.ts",
	"utils/toast-utils.ts",
	"components/router/route-error-screen.tsx",
];

const STATIC_TRANSLATE_ERROR_IMPORT = /^\s*import\s+(?!type\b)[^;]*["'][^"']*translate-error["']/m;
const STATIC_SDK_ERROR_MESSAGE_IMPORT = /^\s*import\s+(?!type\b)[^;]*["']@\/client\/sdk-error-message["']/m;

function sourceFiles(dir = SRC): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) {
			if (entry !== "paraglide") files.push(...sourceFiles(path));
		} else if (SOURCE_FILE.test(entry) && !TEST_FILE.test(entry)) {
			files.push(path);
		}
	}

	return files;
}

const FILES = sourceFiles();
const read = (file: string) => readFileSync(file, "utf8");
const rel = (path: string) => relative(SRC, path);

describe("source guards", () => {
	test("the source tree is actually scanned", () => {
		expect(FILES.length).toBeGreaterThan(300);
	});

	test("no interface label is hardcoded in Polish (clipboard toasts use the catalogue)", () => {
		const offenders = FILES.filter((file) => HARDCODED_POLISH_LABEL.test(read(file))).map((file) => rel(file));

		expect(offenders).toEqual([]);
	});

	test("no source opens the browser's confirmation box; every confirmation is the app's dialog", () => {
		const offenders = FILES.filter((file) => BROWSER_DIALOG_CALL.test(read(file))).map((file) => rel(file));

		expect(offenders).toEqual([]);
	});

	test("both stop actions of a live stream confirm in the app's dialog", () => {
		for (const file of LIVE_STREAM_STOP_FILES) {
			expect(read(join(SRC, file))).toContain("<ConfirmAction");
		}
	});

	test("raw HTML sinks appear only in the reviewed allowlist", () => {
		const offenders = FILES.filter((file) => RAW_HTML_SINK.test(read(file)))
			.map((file) => rel(file))
			.filter((file) => !RAW_HTML_ALLOWLIST.has(file));

		expect(offenders).toEqual([]);
	});

	test("no dynamic code evaluation", () => {
		const offenders = FILES.filter((file) => DYNAMIC_CODE.test(read(file))).map((file) => rel(file));

		expect(offenders).toEqual([]);
	});

	test("every blank-target link declares noopener or noreferrer on the same element", () => {
		const offenders: string[] = [];
		for (const file of FILES.filter((path) => path.endsWith(".tsx"))) {
			const lines = read(file).split("\n");
			for (const [index, line] of lines.entries()) {
				if (!line.includes(BLANK_TARGET)) continue;
				const element = lines.slice(index, index + 6).join(" ");
				if (!SAFE_REL.test(element)) offenders.push(`${rel(file)}:${index + 1}`);
			}
		}

		expect(offenders).toEqual([]);
	});

	test("no credential-shaped strings are committed to the sources", () => {
		const offenders = FILES.filter((file) => CREDENTIAL_PATTERNS.some((pattern) => pattern.test(read(file)))).map((file) => rel(file));

		expect(offenders).toEqual([]);
	});

	test("the error-message catalog stays out of the eager startup graph", () => {
		const offenders = STARTUP_FILES.filter((file) => STATIC_TRANSLATE_ERROR_IMPORT.test(read(join(SRC, file))));

		expect(offenders).toEqual([]);
	});

	test("the shared page states load the error catalog only when an error renders", () => {
		const file = read(join(SRC, "components/app-states.tsx"));

		expect(STATIC_TRANSLATE_ERROR_IMPORT.test(file)).toBe(false);
		expect(STATIC_SDK_ERROR_MESSAGE_IMPORT.test(file)).toBe(false);
	});
});
