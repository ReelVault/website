import { describe, expect, it } from "bun:test";
import { formatQuickConnectCode, isCompleteQuickConnectCode } from "../src/utils/form-utils";

describe("Quick Connect code input", () => {
	it("formats a typed code as XXX-XXX and caps it at six characters", () => {
		expect(formatQuickConnectCode("ab1c2d9z")).toBe("AB1-C2D");
	});

	it("accepts a formatted six-character code as complete", () => {
		expect(isCompleteQuickConnectCode("AB1-C2D")).toBe(true);
	});

	it("rejects a code with a missing character", () => {
		expect(isCompleteQuickConnectCode("AB1-C2")).toBe(false);
	});
});
