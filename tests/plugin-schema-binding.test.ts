import { describe, expect, test } from "bun:test";
import { evaluateCondition, interpolate, readPath, resolveTemplate, type SchemaScope } from "@/plugin-host/schema/binding";

function scope(overrides: Partial<SchemaScope> = {}): SchemaScope {
	return {
		form: { title: "Hello", count: 3 },
		data: { reports: { reports: [{ id: "a", status: "open" }], total: 1 } },
		item: { id: "a", status: "open" },
		index: 0,
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

describe("schema binding", () => {
	test("reads dotted paths", () => {
		expect(readPath(scope(), "form.title")).toBe("Hello");
		expect(readPath(scope(), "data.reports.total")).toBe(1);
		expect(readPath(scope(), "context.params.mediaFileId")).toBe("mf-1");
		expect(readPath(scope(), "missing.path")).toBeUndefined();
	});

	test("an exact placeholder yields the raw value", () => {
		expect(resolveTemplate("{{form.count}}", scope())).toBe(3);
		expect(resolveTemplate("{{item.status}}", scope())).toBe("open");
	});

	test("interpolates placeholders inside text", () => {
		expect(interpolate("Title: {{form.title}} (#{{form.count}})", scope())).toBe("Title: Hello (#3)");
		expect(interpolate("missing {{nope}}", scope())).toBe("missing ");
	});

	test("resolves nested objects and arrays", () => {
		expect(resolveTemplate({ body: { t: "{{form.title}}" }, ids: ["{{item.id}}"] }, scope())).toEqual({
			body: { t: "Hello" },
			ids: ["a"],
		});
	});

	test("evaluates conditions", () => {
		expect(evaluateCondition({ left: "form.count", op: "gt", right: 1 }, scope())).toBe(true);
		expect(evaluateCondition({ left: "item.status", op: "eq", right: "open" }, scope())).toBe(true);
		expect(evaluateCondition({ left: "form.title", op: "contains", right: "ell" }, scope())).toBe(true);
		expect(evaluateCondition({ left: "data.reports.reports", op: "contains", right: "a" }, scope())).toBe(false);
		expect(evaluateCondition({ left: "missing", op: "truthy" }, scope())).toBe(false);
		expect(evaluateCondition({ left: "form.title", op: "falsy" }, scope())).toBe(false);
	});
});
