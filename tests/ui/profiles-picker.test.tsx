import { afterAll, afterEach, describe, expect, mock, test } from "bun:test";
import type { ReactNode } from "react";
import { overwriteGetLocale } from "@/paraglide/runtime";
import { ensureDom, unregisterDom } from "./register-dom";

/**
 * The "Who's watching" picker lists each profile by its name. Choosing a profile switches to it and returns to the
 * page the user came from (the dashboard by default). The add tile opens the create-profile page and keeps that same
 * return target, so the new profile can be chosen without losing the place.
 */

// React reads the browser's event support when it loads, so the DOM is installed before Testing Library and the page.
ensureDom();

const { act, cleanup, fireEvent, render } = await import("@testing-library/react");

overwriteGetLocale(() => "en");

interface ProfileFixture {
	id: string;
	name: string;
	avatarUrl: string | null;
	pin: string | null;
}

let profiles: ProfileFixture[] = [];
const searchState: { redirect?: string } = {};
const push = mock((_path: string) => undefined);
const switchProfile = mock(async (_input: { profileId: string; pin?: string }) => undefined);

const router = await import("@tanstack/react-router");

await mock.module("@tanstack/react-router", () => ({
	...router,
	Link: ({ to, search, ...rest }: { to: string; search?: Record<string, string>; children?: ReactNode; className?: string }) => {
		const query = new URLSearchParams(search ?? {}).toString();
		return <a href={query ? `${to}?${query}` : to} {...rest} />;
	},
	useSearch: () => ({ ...searchState }),
	useRouter: () => ({ history: { push }, invalidate: async () => undefined }),
}));

await mock.module("@/client/hooks/use-profiles", () => ({
	useProfiles: () => ({ profiles, isLoading: false, error: null, refetch: async () => undefined }),
	useSwitchProfile: () => ({
		mutateAsync: switchProfile,
		isPending: false,
		isError: false,
		error: null,
		reset: () => undefined,
	}),
}));

// The entrance animation waits for an intersection observer that this DOM environment does not run.
await mock.module("@/components/simple-animation", () => ({
	SimpleAnimation: ({ children, className }: { children?: ReactNode; className?: string }) => <div className={className}>{children}</div>,
}));

const { default: ProfilesSelectionPage } = await import("@/pages/auth/profiles/profiles-page");

const ANNA: ProfileFixture = { id: "profile-anna", name: "Anna", avatarUrl: null, pin: null };
const MAX: ProfileFixture = { id: "profile-max", name: "Max", avatarUrl: null, pin: null };
const ANNA_BUTTON = /Anna/;
const MAX_BUTTON = /Max/;

function renderPicker() {
	return render(<ProfilesSelectionPage />);
}

// The switch runs after an awaited mutation, so the test lets the pending promise settle before it checks the route.
async function settle() {
	await act(async () => {
		await new Promise((resolve) => {
			setTimeout(resolve, 0);
		});
	});
}

afterEach(() => {
	cleanup();
	profiles = [];
	searchState.redirect = undefined;
	push.mockClear();
	switchProfile.mockClear();
});

afterAll(() => unregisterDom());

describe("profile picker", () => {
	test("lists each profile by its name", () => {
		profiles = [ANNA, MAX];

		const view = renderPicker();

		expect(view.getByRole("button", { name: ANNA_BUTTON })).toBeTruthy();
		expect(view.getByRole("button", { name: MAX_BUTTON })).toBeTruthy();
	});

	test("the add tile opens the create-profile page", () => {
		const view = renderPicker();

		expect(view.getByText("Add profile").closest("a")?.getAttribute("href")).toBe("/auth/create-profile");
	});

	test("the add tile keeps the redirect target", () => {
		searchState.redirect = "/movies/1";

		const view = renderPicker();

		expect(view.getByText("Add profile").closest("a")?.getAttribute("href")).toBe("/auth/create-profile?redirect=%2Fmovies%2F1");
	});

	test("choosing a profile switches to it and returns to the dashboard", async () => {
		profiles = [ANNA, MAX];

		const view = renderPicker();
		fireEvent.click(view.getByRole("button", { name: ANNA_BUTTON }));
		await settle();

		expect(switchProfile.mock.calls[0]?.[0]).toEqual({ profileId: "profile-anna" });
		expect(push.mock.calls[0]?.[0]).toBe("/dashboard");
	});

	test("choosing a profile returns to the redirect target", async () => {
		profiles = [MAX];
		searchState.redirect = "/series/9";

		const view = renderPicker();
		fireEvent.click(view.getByRole("button", { name: MAX_BUTTON }));
		await settle();

		expect(push.mock.calls[0]?.[0]).toBe("/series/9");
	});
});
