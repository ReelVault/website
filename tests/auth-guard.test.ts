import { describe, expect, it } from "bun:test";
import { ReelVaultError } from "@reelvault/sdk/client";
import { QueryClient } from "@tanstack/react-query";
import { isRedirect } from "@tanstack/react-router";
import { authKeys } from "../src/client/utils/query-keys";
import { ensureAuthenticated } from "../src/routes/-auth-guard";

function clientWithMe(me: { user: object | null; profile: object | null }): QueryClient {
	const queryClient = new QueryClient();
	queryClient.setQueryData(authKeys.me(), me);

	return queryClient;
}

function clientFailingWith(error: Error): QueryClient {
	const queryClient = new QueryClient();
	queryClient.query = () => Promise.reject(error);

	return queryClient;
}

async function redirectTarget(queryClient: QueryClient): Promise<string | null> {
	try {
		await ensureAuthenticated({ queryClient });

		return null;
	} catch (error) {
		if (isRedirect(error)) return String(error.options.to);

		throw error;
	}
}

describe("ensureAuthenticated (protected route guard)", () => {
	it("sends a signed-out visitor to the login page", async () => {
		expect(await redirectTarget(clientWithMe({ user: null, profile: null }))).toBe("/auth/login");
	});

	it("sends a signed-in user without a profile to profile selection", async () => {
		expect(await redirectTarget(clientWithMe({ user: { id: "u1" }, profile: null }))).toBe("/auth/profiles");
	});

	it("lets a user with a profile through", async () => {
		expect(await redirectTarget(clientWithMe({ user: { id: "u1" }, profile: { id: "p1" } }))).toBeNull();
	});

	it("treats a rejected session (401) as signed out", async () => {
		expect(await redirectTarget(clientFailingWith(new ReelVaultError(401, "Unauthorized", null, "/v1/me")))).toBe("/auth/login");
	});

	it("does not bounce a valid session to login when the server fails", async () => {
		const serverError = new ReelVaultError(503, "Service Unavailable", null, "/v1/me");

		const outcome = await redirectTarget(clientFailingWith(serverError)).then(
			(target) => ({ redirectedTo: target }),
			(error: unknown) => ({ thrown: error }),
		);

		expect(outcome).toEqual({ thrown: serverError });
	});
});
