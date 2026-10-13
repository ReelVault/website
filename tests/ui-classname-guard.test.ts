import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

// Visual styling belongs to components/ui (variants and sizes). Call sites may only pass layout placement.
// This guard finds className strings on UI elements that still carry visual tokens. Entries in the baseline are
// known debt; any new violation fails the test. Regenerate the baseline only when a debt entry is removed:
//   UPDATE_UI_BASELINE=1 bun test tests/ui-classname-guard.test.ts

const ROOT = join(import.meta.dir, "..");
const SRC = join(ROOT, "src");
const BASELINE_PATH = join(ROOT, "tests", "ui-classname-baseline.json");

const UI_IMPORT = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*["'](@\/components\/(?:ui\/[\w-]+|fullscreen-dialog))["']/g;

const VISUAL: RegExp[] = [
	/^text-(xs|sm|base|lg|xl|\dxl|\[.+\]|muted|foreground|primary|warning|success|destructive|white|info|green|amber|purple|sky|rose)/,
	/^font-/,
	/^(tracking|leading)-/,
	/^(uppercase|lowercase|capitalize|italic|underline|tabular-nums)$/,
	/^(bg|ring|shadow|rounded|outline|from|via|to|fill|stroke|decoration|accent|caret|placeholder)(-|$)/,
	/^border(-(?!t$|b$|l$|r$|x$|y$)|$)/,
	/^(p|px|py|pt|pr|pb|pl)-/,
	/^(h|size)-/,
	/^(gap|space)-/,
	/^(transition|duration|ease|animate|scale|translate|blur|backdrop|saturate|opacity)/,
	/^(hover|focus|focus-visible|active|disabled|dark|aria)[:-]/,
	/^data-\[/,
];

// Per-component geometry and composition that the component does not own.
const ALLOWED: Record<string, RegExp[]> = {
	Skeleton: [/^(h|w|size)-/, /^gap-/],
	SkeletonList: [/^gap-/],
	SkeletonGrid: [/^gap-/],
	Card: [/^(h|size|gap)-/],
	CardContent: [/^gap-/, /^p-0$/, /^space-/],
	CardHeader: [/^gap-/],
	CardFooter: [/^gap-/],
	DialogContent: [/^p-0$/],
	DialogHeader: [/^gap-/],
	DialogFooter: [/^gap-/],
	Field: [/^gap-/],
	TabsContent: [/^(gap|space|pt|py)-/],
	Progress: [/^gap-/],
	Collapsible: [/^gap-/],
	ScrollArea: [/^(h|w|size|p)-/, /^pr-/],
	Image: [/^(h|w|size)-/],
	ApiImage: [/^(h|w|size)-/, /^object-/],
	Separator: [/^(h|w)-/],
	Input: [/^(pl|pr)-(8|9|10|11|12)$/],
	InputGroupInput: [/^(pl|pr)-(8|9|10|11|12)$/],
	CommandInput: [/^(pl|pr)-(8|9|10|11|12|16|20)$/],
	SidebarInput: [/^(pl|pr)-(8|9|10|11|12)$/],
	// Composition: how a container arranges its children (gaps, inner spacing, icon insets, centering).
	Tabs: [/^(gap|space)-/],
	TabsList: [/^(gap|space)-/],
	SidebarMenu: [/^gap-/],
	SidebarHeader: [/^(gap|space)-/],
	SidebarFooter: [/^(gap|space)-/],
	SidebarContent: [/^(gap|space|py)-/],
	FieldGroup: [/^gap-/],
	FieldLabel: [/^gap-/],
	RadioGroup: [/^gap-/],
	CollapsibleContent: [/^gap-/],
	FullscreenDialogContent: [/^(h|p)-/],
	FullscreenDialogHeader: [/^gap-/],
	FullscreenDialogFooter: [/^(gap|pt)-/],
	DrawerHeader: [/^(space|gap)-/],
	DrawerContent: [/^h-full$/],
	CarouselItem: [/^pl-/],
	CarouselNext: [/^size-/],
	CarouselPrevious: [/^size-/],
	Empty: [/^py-/],
	DropdownMenuContent: [/^p-0$/],
	Button: [/^(sm:)?size-(1[6-9]|2\d)$/, /^gap-1$/],
	Avatar: [/^(h|w|size)-/],
	TableCell: [/^(pl|pr)-(8|9|10|11|12)$/],
};

const LAYOUT_ALWAYS: RegExp[] = [
	/^(w|min-w|max-w|basis)-/,
	/^(flex-1|flex-auto|flex-none|flex-(row|col|wrap|nowrap)|grow|shrink)/,
	/^(col|row)-(span|start|end)-/,
	/^(self|justify-self|place-self|order)-/,
	/^-?(m|mx|my|mt|mr|mb|ml|ms|me)-/,
	/^(absolute|relative|fixed|sticky|static|inset|top-|right-|bottom-|left-|start-|end-|z-)/,
	/^(block|inline|inline-block|flex|inline-flex|grid|inline-grid|hidden|contents)$/,
	/^(sr-only|not-sr-only|truncate|line-clamp-)/,
	/^text-(left|center|right|justify)$/,
	/^(justify|items|content)-/,
	/^grid-(cols|rows)-/,
	/^(overflow|overscroll|aspect|min-h|max-h|whitespace|cursor|select|pointer-events|object)-/,
	/^(group|peer|group\/|peer\/)/,
	/^border-(t|b|x|y)$/,
	/^(opacity-0|opacity-100)$/,
	/^-?translate-x-1\/2$/,
	/^-?translate-y-1\/2$/,
	/^(size-full)$/,
	/^size-(3|3\.5|4|5)$/,
];

const RESPONSIVE_PREFIX = /^(max-)?(sm|md|lg|xl|2xl):/;
const WHITESPACE = /\s+/;
const LEADING_DASH = /^-/;
const TYPE_PREFIX = /^type\s+/;
const AS_SPLIT = /\s+as\s+/;
const JSX_TAG = /<([A-Z][\w]*)\b((?:"[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\}|[^'"{}>])*)>/g;
const EXPRESSION_BODY = /\{(?:[^{}]|\{[^{}]*\})*\}/g;
const CLASS_NAME_ATTR = /\bclassName="([^"]*)"/g;

function baseToken(token: string): string {
	return token.replace(RESPONSIVE_PREFIX, "");
}

function visualTokens(className: string, component: string): string[] {
	const allowed = ALLOWED[component] ?? [];
	return className
		.split(WHITESPACE)
		.filter(Boolean)
		.filter((token) => {
			const base = baseToken(token).replace(LEADING_DASH, "");
			if (LAYOUT_ALWAYS.some((re) => re.test(base))) return false;
			if (allowed.some((re) => re.test(base))) return false;
			return VISUAL.some((re) => re.test(base));
		});
}

function walk(dir: string, out: string[]): string[] {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) walk(full, out);
		else if (name.endsWith(".tsx")) out.push(full);
	}
	return out;
}

function uiComponentNames(source: string): Set<string> {
	const names = new Set<string>();
	for (const match of source.matchAll(UI_IMPORT)) {
		for (const spec of (match[1] ?? "").split(",")) {
			const cleaned = spec.trim().replace(TYPE_PREFIX, "");
			if (!cleaned) continue;
			const local = cleaned.split(AS_SPLIT).pop();
			if (local) names.add(local);
		}
	}
	return names;
}

function collectViolations(): string[] {
	const violations = new Set<string>();
	for (const file of walk(SRC, [])) {
		if (file.includes(join("src", "components", "ui")) || file.includes(join("src", "paraglide"))) continue;
		const source = readFileSync(file, "utf8");
		const names = uiComponentNames(source);
		if (names.size === 0) continue;
		for (const match of source.matchAll(JSX_TAG)) {
			const component = match[1] ?? "";
			if (!names.has(component)) continue;
			// Only the element's own attributes: expression bodies (render={...}, children) belong to the markup inside.
			const attrs = (match[2] ?? "").replace(EXPRESSION_BODY, "{}");
			for (const classMatch of attrs.matchAll(CLASS_NAME_ATTR)) {
				for (const token of visualTokens(classMatch[1] ?? "", component)) {
					violations.add(`${relative(ROOT, file)}::${component}::${token}`);
				}
			}
		}
	}
	return [...violations].toSorted();
}

describe("UI className guard", () => {
	const current = collectViolations();

	test("baseline is current (set UPDATE_UI_BASELINE=1 to regenerate)", () => {
		if (process.env.UPDATE_UI_BASELINE) {
			writeFileSync(BASELINE_PATH, `${JSON.stringify(current, null, "\t")}\n`);
		}
		expect(current.length).toBeGreaterThanOrEqual(0);
	});

	test("no new visual className overrides on components/ui elements", () => {
		const parsed: unknown = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
		if (!Array.isArray(parsed)) throw new Error("ui-classname-baseline.json must hold a JSON array");
		const baseline = new Set<string>(parsed.filter((entry): entry is string => typeof entry === "string"));
		const added = current.filter((entry) => !baseline.has(entry));
		expect(added).toEqual([]);
	});
});
