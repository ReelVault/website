import { describe, expect, test } from "bun:test";
import { TimeoutError, withTimeout } from "@/lib/with-timeout";

describe("withTimeout", () => {
	test("resolves the underlying value before the deadline", async () => {
		const value = await withTimeout(Promise.resolve("ok"), 1000, "test");

		expect(value).toBe("ok");
	});

	test("rejects with a named TimeoutError when the promise never settles", async () => {
		const pending = new Promise<never>(() => {
			// Intentionally never resolves.
		});
		const error = await withTimeout(pending, 10, "slow module").catch((caught: unknown) => caught);

		expect(error).toBeInstanceOf(TimeoutError);
	});

	test("keeps the original rejection", async () => {
		const failure = new Error("boom");
		const error = await withTimeout(Promise.reject(failure), 1000, "test").catch((caught: unknown) => caught);

		expect(error).toBe(failure);
	});
});
