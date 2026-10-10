import { afterAll, afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { overwriteGetLocale } from "@/paraglide/runtime";
import { ensureDom, unregisterDom } from "./register-dom";

/**
 * A pairing code on the sign-in page stops working at its expiry. Then the page says so, offers a new code,
 * and stops asking the server about an authorization that can no longer arrive.
 */

// React reads the browser's event support when it loads, so the DOM is installed before Testing Library and the page.
ensureDom();

const { cleanup, render } = await import("@testing-library/react");
const { QueryClient, QueryClientProvider } = await import("@tanstack/react-query");
const { reelvault } = await import("@/client/client");
const { QuickConnectPairView } = await import("@/pages/auth/login/components/quick-connect-pair-view");

overwriteGetLocale(() => "en");

const EXPIRED_TEXT = "This code has expired. Generate a new one to continue.";

function renderPairView() {
	return render(
		<QueryClientProvider client={new QueryClient()}>
			<QuickConnectPairView onAuthenticated={() => undefined} onSwitchToRedeem={() => undefined} />
		</QueryClientProvider>,
	);
}

function wait(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

afterEach(() => {
	cleanup();
	mock.restore();
});

afterAll(async () => {
	// React may still have one scheduled task for the last unmount; it has to run before the DOM globals are removed.
	await wait(50);
	unregisterDom();
});

describe("sign-in pairing code expiry", () => {
	test("an expired code says so and is not asked about again", async () => {
		spyOn(reelvault.auth, "quickConnectInitiate").mockResolvedValue({ code: "AB1-CD2", secret: "secret-1", expiresIn: 2 });
		const check = spyOn(reelvault.auth, "quickConnectCheck").mockResolvedValue({ authenticated: false });
		const view = renderPairView();

		await view.findByText(EXPIRED_TEXT, undefined, { timeout: 6000 });
		const callsAtExpiry = check.mock.calls.length;
		await wait(3000);

		expect(check.mock.calls.length).toBe(callsAtExpiry);
		expect(view.queryByText("Waiting for authorization…")).toBeNull();
	});

	test("a code that is still valid keeps being checked", async () => {
		spyOn(reelvault.auth, "quickConnectInitiate").mockResolvedValue({ code: "AB1-CD2", secret: "secret-2", expiresIn: 60 });
		const check = spyOn(reelvault.auth, "quickConnectCheck").mockResolvedValue({ authenticated: false });
		const view = renderPairView();

		await view.findByText("AB1-CD2");
		await wait(3000);

		expect(check.mock.calls.length).toBeGreaterThan(0);
		expect(view.queryByText(EXPIRED_TEXT)).toBeNull();
	});
});
