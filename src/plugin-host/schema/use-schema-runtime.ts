/* oxlint-disable react/exhaustive-effect-dependencies, react/set-state-in-effect, react-hooks/exhaustive-deps -- mount-only schema initialization */

import type {
	PluginLocalizedText,
	PluginSchemaAction,
	PluginSchemaCondition,
	PluginSchemaNode,
	PluginUiSchemaSurface,
} from "@reelvault/sdk/plugin";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { reelvault } from "@/client/client";
import { detach } from "@/lib/detach";
import { toast } from "@/utils/toast-facade";
import { usePluginDialogController } from "../plugin-dialog-context";
import { evaluateCondition, resolveLabel, resolveTemplate, type SchemaScope } from "./binding";
import { bumpSchemaRefresh, subscribeSchemaRefresh } from "./refresh-bus";

export interface SchemaRuntime {
	scope: SchemaScope;
	dataLoading: boolean;
	dataErrors: Record<string, string>;
	setField: (name: string, value: unknown) => void;
	runAction: (action: PluginSchemaAction, scope: SchemaScope) => void;
	checkCondition: (condition: PluginSchemaCondition, scope: SchemaScope) => boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringRecord(value: unknown): Record<string, string> | undefined {
	if (!isRecord(value)) return undefined;

	const result: Record<string, string> = {};
	for (const [key, entry] of Object.entries(value)) {
		if (typeof entry === "string") result[key] = entry;
	}

	return result;
}

/** Collects initial form values from every `field` node (defaults are interpolated). */
function collectInitialValues(nodes: PluginSchemaNode[], scope: SchemaScope): Record<string, unknown> {
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

/** Resolves a localized plugin label for toasts/confirmations — module scope: captures nothing. */
function toastText(value: PluginLocalizedText, scope: SchemaScope): string {
	return resolveLabel(value, scope);
}

export function useSchemaRuntime(
	pluginId: string,
	schema: PluginUiSchemaSurface,
	context: SchemaScope["context"],
	onClose: (() => void) | undefined,
): SchemaRuntime {
	const navigate = useNavigate();
	const { openDialog } = usePluginDialogController();

	const emptyScope: SchemaScope = { form: {}, data: {}, context };
	const [formValues, setFormValues] = useState<Record<string, unknown>>(() => collectInitialValues(schema.body, emptyScope));
	const [dataValues, setDataValues] = useState<Record<string, unknown>>({});
	const [dataLoading, setDataLoading] = useState(false);
	const [dataErrors, setDataErrors] = useState<Record<string, string>>({});
	const scopeRef = useRef<SchemaScope>({ form: formValues, data: dataValues, context });
	const isMountedRef = useRef(true);
	// Monotonic id so a slower earlier load cannot overwrite a newer one, and an
	// unmounted surface never writes state.
	const loadRequestIdRef = useRef(0);

	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const allSourceNames = Object.keys(schema.data ?? {});

	const loadSources = async (names: string[], scope: SchemaScope): Promise<void> => {
		const sources = schema.data;
		if (!sources || names.length === 0) return;

		const requestId = ++loadRequestIdRef.current;
		const isLatest = (): boolean => isMountedRef.current && requestId === loadRequestIdRef.current;
		setDataLoading(true);

		await Promise.all(
			names.map(async (name) => {
				const source = sources[name];
				if (!source) return;

				try {
					const query = toStringRecord(resolveTemplate(source.query ?? {}, scope));
					const result = await reelvault.plugins.call(pluginId, source.path, query ? { query } : undefined);
					if (!isLatest()) return;

					setDataValues((previous) => ({ ...previous, [name]: result }));
					setDataErrors((previous) => ({ ...previous, [name]: "" }));
				} catch (error) {
					if (!isLatest()) return;

					setDataErrors((previous) => ({ ...previous, [name]: error instanceof Error ? error.message : "Failed to load" }));
				}
			}),
		).finally(() => {
			if (isLatest()) setDataLoading(false);
		});
	};

	const setField = (name: string, value: unknown): void => {
		setFormValues((previous) => ({ ...previous, [name]: value }));
	};

	const refresh = (scope: SchemaScope, sources?: string[]): void => {
		detach(loadSources(sources && sources.length > 0 ? sources : allSourceNames, scope));
	};

	const runAction = (action: PluginSchemaAction, scope: SchemaScope): void => {
		switch (action.type) {
			case "submit": {
				const body = resolveTemplate({ ...scope.form, ...action.body }, scope);
				detach(
					(async () => {
						try {
							await reelvault.plugins.call(pluginId, action.path, {
								method: action.method ?? "POST",
								body: isRecord(body) ? body : undefined,
							});
							if (action.successToast) toast.success(toastText(action.successToast, scope));

							refresh(scope, action.refresh);
							bumpSchemaRefresh();
							if (action.close) onClose?.();
						} catch (error) {
							toast.error(error instanceof Error ? error.message : "Request failed");
						}
					})(),
				);

				return;
			}
			case "call":
			case "delete": {
				const method = action.type === "delete" ? "DELETE" : (action.method ?? "POST");
				if (action.confirm && !window.confirm(toastText(action.confirm, scope))) return;

				const path = String(resolveTemplate(action.path, scope));
				const query = action.type === "call" ? toStringRecord(resolveTemplate(action.query ?? {}, scope)) : undefined;
				const body = action.type === "call" && action.body ? resolveTemplate(action.body, scope) : undefined;
				detach(
					(async () => {
						try {
							await reelvault.plugins.call(pluginId, path, {
								method,
								...(query ? { query } : {}),
								...(isRecord(body) ? { body } : {}),
							});
							if (action.successToast) toast.success(toastText(action.successToast, scope));

							refresh(scope, action.refresh);
							bumpSchemaRefresh();
							if (action.close) onClose?.();
						} catch (error) {
							toast.error(error instanceof Error ? error.message : "Request failed");
						}
					})(),
				);

				return;
			}
			case "navigate":
				detach(navigate({ href: String(resolveTemplate(action.to, scope)) }));

				return;
			case "openDialog": {
				const params = toStringRecord(resolveTemplate(action.params ?? scope.context.params, scope));
				openDialog({
					pluginId,
					dialog: action.dialog,
					params,
					...(scope.context.player ? { player: scope.context.player } : {}),
				});

				return;
			}
			case "close":
				onClose?.();

				return;
			case "toast": {
				const message = toastText(action.message, scope);
				if (action.level === "error") toast.error(message);
				else if (action.level === "success") toast.success(message);
				else toast.info(message);

				return;
			}
			case "refresh":
				refresh(scope, action.sources);

				return;
			default:
				return;
		}
	};

	const runActionRef = useRef(runAction);
	useEffect(() => {
		runActionRef.current = runAction;
		scopeRef.current = { form: formValues, data: dataValues, context };
	});

	// Load data sources, run mount actions once, and refresh when a sibling
	// surface mutates data (cross-surface consistency).
	// biome-ignore lint/correctness/useExhaustiveDependencies: mount-only initialization
	useEffect(() => {
		const scope: SchemaScope = { form: formValues, data: {}, context };
		detach(loadSources(allSourceNames, scope));
		for (const action of schema.onMount ?? []) runActionRef.current(action, scope);

		return subscribeSchemaRefresh(() => {
			detach(loadSources(allSourceNames, scopeRef.current));
		});
	}, [pluginId]);

	return {
		scope: { form: formValues, data: dataValues, context },
		dataLoading,
		dataErrors,
		setField,
		runAction,
		checkCondition: evaluateCondition,
	};
}
