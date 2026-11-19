import { describe, expect, it } from "bun:test";
import { isAdminUser } from "../src/components/auth/admin-access";

describe("admin authorization", () => {
	it("grants access only to the admin role in the client guard", () => {
		expect(isAdminUser({ role: "admin" })).toBe(true);
		expect(isAdminUser({ role: "user" })).toBe(false);
		expect(isAdminUser(null)).toBe(false);
		expect(isAdminUser(undefined)).toBe(false);
	});
});
