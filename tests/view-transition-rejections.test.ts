import { describe, expect, test } from "bun:test";
import { isSkippedViewTransitionRejection } from "../src/utils/view-transition-rejections";

function failure(name: string, message: string): Error {
	const error = new Error(message);
	error.name = name;

	return error;
}

describe("isSkippedViewTransitionRejection", () => {
	test("matches the two rejections a skipped or replaced view transition produces", () => {
		expect(isSkippedViewTransitionRejection(failure("AbortError", "Transition was skipped"))).toBe(true);
		expect(isSkippedViewTransitionRejection(failure("InvalidStateError", "Transition was aborted because of invalid state"))).toBe(true);
	});

	test("does not match an abort from a request or any other error", () => {
		expect(isSkippedViewTransitionRejection(failure("AbortError", "The user aborted a request."))).toBe(false);
		expect(isSkippedViewTransitionRejection(failure("TypeError", "Transition was skipped"))).toBe(false);
		expect(isSkippedViewTransitionRejection(failure("InvalidStateError", "The object is in an invalid state."))).toBe(false);
	});

	test("does not match values that are not errors", () => {
		expect(isSkippedViewTransitionRejection("Transition was skipped")).toBe(false);
		expect(isSkippedViewTransitionRejection(null)).toBe(false);
		expect(isSkippedViewTransitionRejection(undefined)).toBe(false);
	});
});
