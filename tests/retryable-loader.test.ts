import { describe, expect, test } from "bun:test";
import { createRetryableLoader } from "@/lib/retryable-loader";

describe("createRetryableLoader", () => {
	test("shares one in-flight load between concurrent callers", async () => {
		let calls = 0;
		const loader = createRetryableLoader(() => {
			calls += 1;

			return Promise.resolve("module");
		});

		const [first, second] = await Promise.all([loader(), loader()]);

		expect(first).toBe("module");
		expect(second).toBe("module");
		expect(calls).toBe(1);
	});

	test("forgets a rejected load so the next attempt can retry", async () => {
		let calls = 0;
		const loader = createRetryableLoader(() => {
			calls += 1;
			if (calls === 1) return Promise.reject(new Error("chunk unavailable"));

			return Promise.resolve("module");
		});

		const firstError = await loader().catch((error: unknown) => error);
		const second = await loader();

		expect(firstError).toBeInstanceOf(Error);
		expect(second).toBe("module");
		expect(calls).toBe(2);
	});
});
