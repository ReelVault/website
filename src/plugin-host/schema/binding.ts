import type { PluginLocalizedText, PluginSchemaCondition, PluginUiContext } from "reelvault-sdk/plugin";
import { resolvePluginText } from "@/client/hooks/use-plugin-ui";

/**
 * Context available to schema expressions under `{{context.*}}`. It carries the
 * full ambient `PluginUiContext` (user, profile, theme, locale, player, device,
 * page URL) plus the plugin's default locale for label fallback.
 */
export type SchemaContext = PluginUiContext & { defaultLocale?: string | undefined };

/** Evaluation scope for schema expressions. */
export interface SchemaScope {
	form: Record<string, unknown>;
	data: Record<string, unknown>;
	item?: Record<string, unknown> | undefined;
	index?: number | undefined;
	context: SchemaContext;
}

const INTERPOLATION = /\{\{\s*([^}]+?)\s*\}\}/g;
const EXACT_INTERPOLATION = /^\{\{\s*([^}]+?)\s*\}\}$/;

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Resolves a dotted path (`data.reports.total`) against the scope. */
export function readPath(root: unknown, path: string): unknown {
	let current: unknown = root;
	for (const segment of path.split(".")) {
		if (!isRecord(current)) return undefined;

		current = current[segment];
	}

	return current;
}

function stringify(value: unknown): string {
	if (value === null || value === undefined) return "";

	if (typeof value === "string") return value;

	if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);

	return JSON.stringify(value);
}

/**
 * Resolves `{{expr}}` placeholders. A string that is exactly one placeholder
 * yields the raw value (so numbers/booleans/objects pass through); other strings
 * are interpolated as text.
 */
export function resolveTemplate(value: unknown, scope: SchemaScope): unknown {
	if (typeof value === "string") {
		const exact = value.match(EXACT_INTERPOLATION);
		if (exact?.[1]) return readPath(scope, exact[1]);

		return value.replace(INTERPOLATION, (_match, expr: string) => stringify(readPath(scope, expr.trim())));
	}

	if (Array.isArray(value)) return value.map((item) => resolveTemplate(item, scope));

	if (isRecord(value)) {
		const result: Record<string, unknown> = {};
		for (const [key, entry] of Object.entries(value)) result[key] = resolveTemplate(entry, scope);

		return result;
	}

	return value;
}

/** Interpolates a plain string (always returns a string). */
export function interpolate(value: string, scope: SchemaScope): string {
	return stringify(resolveTemplate(value, scope));
}

/** Resolves a localized label and interpolates it. */
export function resolveLabel(text: PluginLocalizedText | undefined, scope: SchemaScope): string {
	if (text === undefined) return "";

	return interpolate(resolvePluginText(text, scope.context.defaultLocale), scope);
}

export function evaluateCondition(condition: PluginSchemaCondition, scope: SchemaScope): boolean {
	const left = readPath(scope, condition.left);
	const right = condition.right;
	switch (condition.op) {
		case "truthy":
			return Boolean(left);
		case "falsy":
			return !left;
		case "eq":
			return left === right;
		case "neq":
			return left !== right;
		case "gt":
			return Number(left) > Number(right);
		case "gte":
			return Number(left) >= Number(right);
		case "lt":
			return Number(left) < Number(right);
		case "lte":
			return Number(left) <= Number(right);
		case "contains":
			if (Array.isArray(left)) return left.some((entry) => entry === right);

			return typeof left === "string" && typeof right === "string" && left.includes(right);
		default:
			if (import.meta.env.DEV) console.warn(`[plugin-ui] unknown condition op: ${String(condition.op)}`);

			return false;
	}
}
