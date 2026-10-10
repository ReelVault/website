import { describe, expect, test } from "bun:test";
import { actionConfirmation } from "@/plugin-host/schema/binding";

/**
 * A plugin action that changes data asks first, in the app's dialog. Only `call` and `delete` carry a
 * confirmation text; the other actions run as soon as they are triggered.
 */
describe("plugin action confirmation", () => {
	test("a call or a delete with a confirmation text asks first", () => {
		expect(actionConfirmation({ type: "call", path: "/cache/reset", confirm: "Reset the cache?" })).toBe("Reset the cache?");
		expect(actionConfirmation({ type: "delete", path: "/reports/1", confirm: "Delete this report?" })).toBe("Delete this report?");
	});

	test("an action without a confirmation text runs without asking", () => {
		expect(actionConfirmation({ type: "call", path: "/refresh" })).toBeUndefined();
		expect(actionConfirmation({ type: "submit", path: "/reports" })).toBeUndefined();
		expect(actionConfirmation({ type: "refresh" })).toBeUndefined();
	});
});
