import type { PluginSchemaNode, PluginUiSchemaSurface } from "@reelvault/sdk/plugin";
import { createElement } from "react";
import { ConfirmAction } from "@/components/confirm-action";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m } from "@/paraglide/messages";
import { EMBED_ALLOW, embedReferrerPolicy, embedSandbox } from "../embed-policy";
import { getPluginIcon } from "../icons";
import {
	actionConfirmation,
	evaluateCondition,
	interpolate,
	isRecord,
	readPath,
	resolveLabel,
	type SchemaContext,
	type SchemaScope,
} from "./binding";
import { SchemaField } from "./fields";
import { type SchemaRuntime, useSchemaRuntime } from "./use-schema-runtime";

const GAP_CLASS = ["gap-0", "gap-1", "gap-2", "gap-3", "gap-4", "gap-5", "gap-6"];
const COLSPAN_CLASS: Record<number, string> = { 1: "", 2: "sm:col-span-2", 3: "sm:col-span-3", 4: "sm:col-span-4" };
const ROW_JUSTIFY: Record<string, string> = {
	start: "justify-start",
	center: "justify-center",
	end: "justify-end",
	between: "justify-between",
};
const EXACT_EXPRESSION = /^\{\{\s*([^}]+?)\s*\}\}$/;

type SchemaNodeOf<T extends PluginSchemaNode["type"]> = Extract<PluginSchemaNode, { type: T }>;

interface SchemaNodeProps<T extends PluginSchemaNode["type"]> {
	node: SchemaNodeOf<T>;
	scope: SchemaScope;
	runtime: SchemaRuntime;
}

function gapClass(gap: number | undefined): string {
	const index = Math.min(Math.max(gap ?? 3, 0), GAP_CLASS.length - 1);

	return GAP_CLASS[index] ?? "gap-3";
}

/** Resolves a cell/stat expression: `item.title` path or `{{item.title}}`. */
function resolveExpression(value: string, scope: SchemaScope): unknown {
	const trimmed = value.trim();
	const exact = trimmed.match(EXACT_EXPRESSION);
	if (exact?.[1]) return readPath(scope, exact[1]);

	return readPath(scope, trimmed);
}

/** Resolves a collection expression; a value that is not an array renders as an empty list. */
function resolveRows(source: string, scope: SchemaScope): unknown[] {
	const rows = resolveExpression(source, scope);

	return Array.isArray(rows) ? rows : [];
}

/** Renders an allowlisted Lucide icon without creating a component during render. */
function PluginIcon({ name, className }: { name?: string | undefined; className?: string | undefined }) {
	return createElement(getPluginIcon(name), { className, "aria-hidden": true });
}

function toDisplay(value: unknown): string {
	if (value === null || value === undefined) return "";

	if (typeof value === "string") return value;

	if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);

	return JSON.stringify(value);
}

export interface PluginSchemaSurfaceProps {
	pluginId: string;
	schema: PluginUiSchemaSurface;
	context: SchemaContext;
	onClose?: (() => void) | undefined;
	className?: string;
}

/** Top-level renderer for a declarative schema surface. */
export function PluginSchemaSurface({ pluginId, schema, context, onClose, className }: PluginSchemaSurfaceProps) {
	const runtime = useSchemaRuntime(pluginId, schema, context, onClose);
	const errors = Object.values(runtime.dataErrors).filter((message) => message.length > 0);

	return (
		<div className={className}>
			{runtime.dataLoading && (
				<div className="flex justify-center py-2">
					<Spinner size="default" />
				</div>
			)}
			{errors.length > 0 && (
				<Alert variant="destructive" className="mb-4">
					<AlertTitle>{m.common_error()}</AlertTitle>
					<AlertDescription>{errors.join(" · ")}</AlertDescription>
				</Alert>
			)}
			<form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
				<SchemaNodes nodes={schema.body} scope={runtime.scope} runtime={runtime} />
			</form>
		</div>
	);
}

function SchemaNodes({ nodes, scope, runtime }: { nodes: PluginSchemaNode[]; scope: SchemaScope; runtime: SchemaRuntime }) {
	return (
		<>
			{nodes.map((node, index) => (
				<SchemaNodeView key={`${node.type}-${index}`} node={node} scope={scope} runtime={runtime} />
			))}
		</>
	);
}

/** Dispatches one schema node to its renderer. Nodes with logic get their own component; trivial containers stay inline. */
function SchemaNodeView({ node, scope, runtime }: SchemaNodeProps<PluginSchemaNode["type"]>) {
	switch (node.type) {
		case "field":
			return <SchemaFieldNode node={node} scope={scope} runtime={runtime} />;
		case "stack":
			return (
				<div className={`flex flex-col ${gapClass(node.gap)}`}>
					<SchemaNodes nodes={node.children} scope={scope} runtime={runtime} />
				</div>
			);
		case "row":
			return (
				<div className={`flex flex-wrap items-center ${gapClass(node.gap)} ${ROW_JUSTIFY[node.align ?? "start"] ?? ""}`}>
					<SchemaNodes nodes={node.children} scope={scope} runtime={runtime} />
				</div>
			);
		case "grid":
			return (
				<div className={`grid ${gapClass(node.gap)}`} style={{ gridTemplateColumns: `repeat(${node.columns ?? 2}, minmax(0, 1fr))` }}>
					<SchemaNodes nodes={node.children} scope={scope} runtime={runtime} />
				</div>
			);
		case "card":
			return <SchemaCardNode node={node} scope={scope} runtime={runtime} />;
		case "section":
			return <SchemaSectionNode node={node} scope={scope} runtime={runtime} />;
		case "tabs":
			return <SchemaTabsNode node={node} scope={scope} runtime={runtime} />;
		case "separator":
			return <Separator />;
		case "heading":
			return <SchemaHeadingNode node={node} scope={scope} runtime={runtime} />;
		case "text":
			return <SchemaTextNode node={node} scope={scope} runtime={runtime} />;
		case "code":
			return (
				<pre className="bg-muted/40 max-h-80 overflow-auto rounded-md border p-3 font-mono text-xs wrap-break-word whitespace-pre-wrap">
					{resolveLabel(node.text, scope)}
				</pre>
			);
		case "badge":
			return <SchemaBadgeNode node={node} scope={scope} runtime={runtime} />;
		case "alert":
			return <SchemaAlertNode node={node} scope={scope} runtime={runtime} />;
		case "button":
			return <SchemaButtonNode node={node} scope={scope} runtime={runtime} />;
		case "stats":
			return <SchemaStatsNode node={node} scope={scope} runtime={runtime} />;
		case "table":
			return <SchemaTableNode node={node} scope={scope} runtime={runtime} />;
		case "list":
			return <SchemaListNode node={node} scope={scope} runtime={runtime} />;
		case "foreach":
			return <SchemaForeachNode node={node} scope={scope} runtime={runtime} />;
		case "empty":
			return <SchemaEmptyNode node={node} scope={scope} runtime={runtime} />;
		case "embed":
			return <SchemaEmbedNode node={node} scope={scope} runtime={runtime} />;
		case "if":
			return <SchemaIfNode node={node} scope={scope} runtime={runtime} />;
		default:
			if (import.meta.env.DEV) console.warn(`[plugin-ui] unknown schema node type: ${String((node as { type?: unknown }).type)}`);

			return null;
	}
}

function SchemaFieldNode({ node, scope, runtime }: SchemaNodeProps<"field">) {
	return (
		<div className={node.colspan ? COLSPAN_CLASS[node.colspan] : undefined}>
			<SchemaField node={node} scope={scope} value={scope.form[node.name]} onChange={(value) => runtime.setField(node.name, value)} />
		</div>
	);
}

function SchemaCardNode({ node, scope, runtime }: SchemaNodeProps<"card">) {
	return (
		<Card>
			{node.title || node.description ? (
				<CardHeader>
					{node.title ? <CardTitle>{resolveLabel(node.title, scope)}</CardTitle> : null}
					{node.description ? <CardDescription>{resolveLabel(node.description, scope)}</CardDescription> : null}
				</CardHeader>
			) : null}
			<CardContent className="flex flex-col gap-4">
				<SchemaNodes nodes={node.children} scope={scope} runtime={runtime} />
			</CardContent>
		</Card>
	);
}

function SchemaSectionNode({ node, scope, runtime }: SchemaNodeProps<"section">) {
	return (
		<section className="flex flex-col gap-3">
			{node.title ? <h2 className="text-lg font-semibold">{resolveLabel(node.title, scope)}</h2> : null}
			{node.description ? <p className="text-muted-foreground text-sm">{resolveLabel(node.description, scope)}</p> : null}
			<SchemaNodes nodes={node.children} scope={scope} runtime={runtime} />
		</section>
	);
}

function SchemaTabsNode({ node, scope, runtime }: SchemaNodeProps<"tabs">) {
	return (
		<Tabs defaultValue={`tab-0`}>
			<TabsList className="w-full justify-start overflow-x-auto">
				{node.tabs.map((tab, index) => (
					<TabsTrigger key={`tab-${index}`} value={`tab-${index}`}>
						{resolveLabel(tab.label, scope)}
					</TabsTrigger>
				))}
			</TabsList>
			{node.tabs.map((tab, index) => (
				<TabsContent key={`tab-${index}`} value={`tab-${index}`} className="flex flex-col gap-4 pt-3">
					<SchemaNodes nodes={tab.children} scope={scope} runtime={runtime} />
				</TabsContent>
			))}
		</Tabs>
	);
}

function SchemaHeadingNode({ node, scope }: SchemaNodeProps<"heading">) {
	return node.level === 3 ? (
		<h3 className="text-base font-semibold">{resolveLabel(node.text, scope)}</h3>
	) : (
		<h2 className="text-lg font-semibold">{resolveLabel(node.text, scope)}</h2>
	);
}

function SchemaTextNode({ node, scope }: SchemaNodeProps<"text">) {
	return <p className={node.variant === "muted" ? "text-muted-foreground text-sm" : "text-sm"}>{resolveLabel(node.text, scope)}</p>;
}

function SchemaBadgeNode({ node, scope }: SchemaNodeProps<"badge">) {
	return (
		<Badge variant={node.variant ?? "secondary"} className="w-fit">
			{node.icon ? <PluginIcon name={node.icon} className="size-3" /> : null}
			{resolveLabel(node.text, scope)}
		</Badge>
	);
}

function SchemaAlertNode({ node, scope }: SchemaNodeProps<"alert">) {
	return (
		<Alert variant={node.variant ?? "default"}>
			{node.title ? <AlertTitle>{resolveLabel(node.title, scope)}</AlertTitle> : null}
			{node.description ? <AlertDescription>{resolveLabel(node.description, scope)}</AlertDescription> : null}
		</Alert>
	);
}

function SchemaButtonNode({ node, scope, runtime }: SchemaNodeProps<"button">) {
	if (node.hiddenIf && evaluateCondition(node.hiddenIf, scope)) return null;

	const disabled = node.disabledIf ? evaluateCondition(node.disabledIf, scope) : false;
	const confirmation = actionConfirmation(node.action);
	const button = (
		<Button
			type="button"
			variant={node.variant ?? "default"}
			disabled={disabled}
			onClick={confirmation === undefined ? () => runtime.runAction(node.action, scope) : undefined}
			className="w-fit"
		>
			{node.icon ? <PluginIcon name={node.icon} className="size-4" /> : null}
			{resolveLabel(node.label, scope)}
		</Button>
	);

	// The app's dialog asks first; a plugin action never opens the browser's confirmation box.
	if (confirmation === undefined) return button;

	return (
		<ConfirmAction
			trigger={button}
			title={resolveLabel(confirmation, scope)}
			description={m.plugin_action_confirm_description()}
			onConfirm={() => runtime.runAction(node.action, scope)}
		/>
	);
}

function SchemaStatsNode({ node, scope }: SchemaNodeProps<"stats">) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{node.items.map((item, index) => {
				return (
					<Card key={`stat-${index}`}>
						<CardContent className="flex flex-col gap-1">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-xs tracking-wider uppercase">{resolveLabel(item.label, scope)}</span>
								{item.icon ? <PluginIcon name={item.icon} className="text-primary size-4" /> : null}
							</div>
							<span className="text-2xl font-semibold">{toDisplay(resolveExpression(item.value, scope))}</span>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

function SchemaTableNode({ node, scope, runtime }: SchemaNodeProps<"table">) {
	const list = resolveRows(node.source, scope);
	if (list.length === 0) {
		return <p className="text-muted-foreground text-sm">{resolveLabel(node.empty ?? "No data", scope)}</p>;
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{node.columns.map((column, index) => (
						<TableHead key={`col-${index}`}>{resolveLabel(column.label, scope)}</TableHead>
					))}
					{node.rowActions ? <TableHead className="w-0" /> : null}
				</TableRow>
			</TableHeader>
			<TableBody>
				{list.map((row, rowIndex) => {
					const item = isRecord(row) ? row : {};
					const rowScope: SchemaScope = { ...scope, item, index: rowIndex };

					return (
						<TableRow key={`row-${rowIndex}`}>
							{node.columns.map((column, index) => (
								<TableCell key={`cell-${index}`}>
									{column.variant === "badge" ? (
										<Badge variant="outline">{toDisplay(resolveExpression(column.value, rowScope))}</Badge>
									) : (
										<span className={column.variant === "muted" ? "text-muted-foreground" : undefined}>
											{toDisplay(resolveExpression(column.value, rowScope))}
										</span>
									)}
								</TableCell>
							))}
							{node.rowActions ? (
								<TableCell className="flex justify-end">
									<SchemaNodes nodes={node.rowActions} scope={rowScope} runtime={runtime} />
								</TableCell>
							) : null}
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}

function SchemaListNode({ node, scope, runtime }: SchemaNodeProps<"list">) {
	const list = resolveRows(node.source, scope);
	if (list.length === 0) return <p className="text-muted-foreground text-sm">{resolveLabel(node.empty ?? "No data", scope)}</p>;

	return (
		<div className="flex flex-col gap-3">
			{list.map((row, index) => {
				const item = isRecord(row) ? row : {};

				return (
					<Card key={`list-${index}`}>
						<CardContent>
							<SchemaNodes nodes={node.item} scope={{ ...scope, item, index }} runtime={runtime} />
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

function SchemaForeachNode({ node, scope, runtime }: SchemaNodeProps<"foreach">) {
	const list = resolveRows(node.source, scope);

	return (
		<>
			{list.map((row, index) => {
				const item = isRecord(row) ? row : {};

				return <SchemaNodes key={`foreach-${index}`} nodes={node.item} scope={{ ...scope, item, index }} runtime={runtime} />;
			})}
		</>
	);
}

function SchemaEmptyNode({ node, scope }: SchemaNodeProps<"empty">) {
	return (
		<div className="border-border rounded-lg border border-dashed p-6 text-center">
			<p className="text-sm font-medium">{resolveLabel(node.title ?? "Nothing here", scope)}</p>
			{node.description ? <p className="text-muted-foreground mt-1 text-xs">{resolveLabel(node.description, scope)}</p> : null}
		</div>
	);
}

function SchemaEmbedNode({ node, scope }: SchemaNodeProps<"embed">) {
	const src = interpolate(node.src, scope);

	return (
		// The sandbox policy (opaque origin for arbitrary pages, real origin for
		// known video players) lives in `embed-policy` so the cinemamode pre-roll
		// overlay stays in sync.
		<iframe
			src={src}
			title={resolveLabel(node.title ?? "Embedded content", scope)}
			className={node.aspect === "square" ? "aspect-square w-full rounded-lg border-0" : "aspect-video w-full rounded-lg border-0"}
			sandbox={embedSandbox(src)}
			referrerPolicy={embedReferrerPolicy(src)}
			loading="lazy"
			allow={EMBED_ALLOW}
		/>
	);
}

function SchemaIfNode({ node, scope, runtime }: SchemaNodeProps<"if">) {
	if (evaluateCondition(node.condition, scope)) return <SchemaNodes nodes={node.content} scope={scope} runtime={runtime} />;

	if (node.otherwise) return <SchemaNodes nodes={node.otherwise} scope={scope} runtime={runtime} />;

	return null;
}
