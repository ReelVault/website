import { describe, expect, test } from "bun:test";
import type { PluginSchemaNode } from "@reelvault/sdk/plugin";
import type { SchemaScope } from "@/plugin-host/schema/binding";
import { collectSchemaDefaults, mergeSchemaDefaults } from "@/plugin-host/schema/schema-defaults";

function scope(overrides: Partial<SchemaScope> = {}): SchemaScope {
	return {
		form: {},
		data: {},
		context: {
			protocolVersion: 2,
			pluginId: "org.example",
			params: { mediaFileId: "mf-1" },
			locale: "en",
			theme: "dark",
			apiBaseUrl: "http://localhost:3030",
		},
		...overrides,
	};
}

const body: PluginSchemaNode[] = [
	{
		type: "stack",
		children: [
			{
				type: "field",
				input: "select",
				name: "status",
				label: "Status",
				default: "{{data.report.report.status}}",
				options: [
					{ label: "Open", value: "open" },
					{ label: "Closed", value: "closed" },
				],
			},
			{
				type: "field",
				input: "textarea",
				name: "adminNotes",
				label: "Notes",
				default: "{{data.report.report.adminNotes}}",
			},
			{
				type: "field",
				input: "select",
				name: "filter",
				label: "Filter",
				default: "all",
				options: [{ label: "All", value: "all" }],
			},
		],
	},
];

const reportData = { report: { report: { status: "open", adminNotes: "note" } } };

describe("schema defaults", () => {
	test("mount-time collection applies static defaults and leaves data-driven ones unset", () => {
		const initial = collectSchemaDefaults(body, scope());

		expect(initial.filter).toBe("all");
		expect(initial.status).toBeUndefined();
		expect(initial.adminNotes).toBeUndefined();
	});

	test("merge fills untouched fields once the data source resolves", () => {
		const merged = mergeSchemaDefaults(body, {}, scope({ data: reportData }), new Set());

		expect(merged.status).toBe("open");
		expect(merged.adminNotes).toBe("note");
		expect(merged.filter).toBe("all");
	});

	test("user edits are never overwritten by data defaults", () => {
		const merged = mergeSchemaDefaults(body, { status: "closed" }, scope({ data: reportData }), new Set(["status"]));

		expect(merged.status).toBe("closed");
		expect(merged.adminNotes).toBe("note");
	});

	test("an unchanged form keeps its identity so React can bail out", () => {
		const current = { status: "open", adminNotes: "note", filter: "all" };
		const merged = mergeSchemaDefaults(body, current, scope({ data: reportData }), new Set());

		expect(merged).toBe(current);
	});
});
