import { describe, expect, test } from "bun:test";
import type { Query } from "@tanstack/react-query";
import { pollWhile } from "@/client/utils/poll-while";

function queryWith(data: { active: boolean } | undefined, fetchFailureCount = 0): Query<{ active: boolean }> {
	return { state: { data, fetchFailureCount } } as unknown as Query<{ active: boolean }>;
}

describe("pollWhile", () => {
	test("uses the active interval while the data says work is running", () => {
		const interval = pollWhile<{ active: boolean }>({ isActive: (data) => data?.active === true, activeMs: 1000 });

		expect(interval(queryWith({ active: true }))).toBe(1000);
		expect(interval(queryWith({ active: false }))).toBe(false);
	});

	test("backs off instead of stopping when idleMs is set", () => {
		const interval = pollWhile<{ active: boolean }>({ isActive: (data) => data?.active === true, activeMs: 1000, idleMs: 60_000 });

		expect(interval(queryWith({ active: false }))).toBe(60_000);
	});

	test("stops after the configured number of consecutive failures", () => {
		const interval = pollWhile<{ active: boolean }>({
			isActive: () => true,
			activeMs: 1000,
			stopAfterFailures: 3,
		});

		expect(interval(queryWith(undefined, 2))).toBe(1000);
		expect(interval(queryWith(undefined, 3))).toBe(false);
	});
});
