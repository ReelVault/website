import { beforeEach, describe, expect, it } from "bun:test";
import { isAdminUser } from "../src/components/auth/admin-access";
import { checkAuthGuard, resetSetupStatusForTesting } from "../src/lib/auth-guard";

const ADMIN_ROUTES = [
	"/admin",
	"/admin/dashboard",
	"/admin/libraries",
	"/admin/metadata",
	"/admin/metadata/metadata-1",
	"/admin/media",
	"/admin/media/file-1",
	"/admin/collections",
	"/admin/genres",
	"/admin/keywords",
	"/admin/people",
	"/admin/companies",
	"/admin/users",
	"/admin/users/user-1",
	"/admin/worker",
	"/admin/providers",
	"/admin/logs",
	"/admin/audit",
] as const;

function createCookieJar(cookies: Record<string, string> = {}) {
	return {
		has: (name: string) => name in cookies,
		get: (name: string) => cookies[name],
	};
}

describe("admin authorization", () => {
	beforeEach(() => {
		resetSetupStatusForTesting();
		globalThis.fetch = (async () => Response.json({ required: false })) as unknown as typeof fetch;
	});

	it("redirects every admin route to login without a session", async () => {
		for (const route of ADMIN_ROUTES) {
			const result = await checkAuthGuard({ pathname: route, cookies: createCookieJar() });
			expect(result?.redirect).toBe(`/auth/login?redirect=${encodeURIComponent(route)}`);
		}
	});

	it("redirects every admin route to profile selection without an active profile", async () => {
		for (const route of ADMIN_ROUTES) {
			const result = await checkAuthGuard({
				pathname: route,
				cookies: createCookieJar({ "better-auth.session_token": "session" }),
			});
			expect(result?.redirect).toBe(`/auth/profiles?redirect=${encodeURIComponent(route)}`);
		}
	});

	it("allows every admin route through the request boundary with a session and profile", async () => {
		for (const route of ADMIN_ROUTES) {
			const result = await checkAuthGuard({
				pathname: route,
				cookies: createCookieJar({
					"better-auth.session_token": "session",
					current_profile_id: "profile",
				}),
			});
			expect(result).toBeNull();
		}
	});

	it("grants access only to the admin role in the client guard", () => {
		expect(isAdminUser({ role: "admin" })).toBe(true);
		expect(isAdminUser({ role: "user" })).toBe(false);
		expect(isAdminUser(null)).toBe(false);
		expect(isAdminUser(undefined)).toBe(false);
	});
});
