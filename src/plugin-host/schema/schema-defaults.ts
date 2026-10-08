import type { PluginSchemaNode } from "@reelvault/sdk/plugin";
import { resolveTemplate, type SchemaScope } from "./binding";

/** Collects default form values from every `field` node (defaults are interpolated). */
export function collectSchemaDefaults(nodes: PluginSchemaNode[], scope: SchemaScope): Record<string, unknown> {
	const values: Record<string, unknown> = {};
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: walks every container node type
	const walk = (list: PluginSchemaNode[]): void => {
		for (const node of list) {
			if (node.type === "field") {
				if (values[node.name] === undefined && node.default !== undefined) values[node.name] = resolveTemplate(node.default, scope);

				continue;
			}

			if (node.type === "stack" || node.type === "row" || node.type === "grid" || node.type === "card" || node.type === "section") {
				walk(node.children);
			} else if (node.type === "tabs") {
				for (const tab of node.tabs) walk(tab.children);
			} else if (node.type === "list" || node.type === "foreach") {
				walk(node.item);
			} else if (node.type === "table" && node.rowActions) {
				walk(node.rowActions);
			} else if (node.type === "if") {
				walk(node.content);
				if (node.otherwise) walk(node.otherwise);
			}
		}
	};
	walk(nodes);

	return values;
}

/**
 * Re-applies schema defaults for fields the user has not touched.
 *
 * Defaults that reference `{{data.*}}` resolve to `undefined` at mount — the
 * surface's data source has not loaded yet — so those fields would stay empty.
 * This merge runs on every data update: untouched fields pick up the resolved
 * default, touched fields keep the user's value, and an unchanged form returns
 * the same object so React can bail out.
 */
export function mergeSchemaDefaults(
	nodes: PluginSchemaNode[],
	current: Record<string, unknown>,
	scope: SchemaScope,
	touched: ReadonlySet<string>,
): Record<string, unknown> {
	const defaults = collectSchemaDefaults(nodes, scope);
	let next = current;

	for (const [name, value] of Object.entries(defaults)) {
		if (touched.has(name) || value === undefined || current[name] === value) continue;
		if (next === current) next = { ...current };
		next[name] = value;
	}

	return next;
}
