import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { overwriteGetLocale } from "@/paraglide/runtime";
import { ensureDom, unregisterDom } from "./register-dom";

/**
 * Bulk selection of titles for trickplay regeneration: pick titles from a search, see
 * the running count, never select more than the server accepts in one request (50), and
 * send exactly the selected ids as one `titles` scope request.
 */

overwriteGetLocale(() => "en");
beforeAll(() => ensureDom());

const regenerateCalls: unknown[] = [];
const searchTitles = Array.from({ length: 55 }, (_, index) => ({
	id: `title-${index + 1}`,
	title: `Title ${index + 1}`,
	type: "movie" as const,
}));

await mock.module("@/client/hooks/use-admin-trickplay", () => ({
	useRegenerateTrickplay: () => ({
		isPending: false,
		mutateAsync: (params: unknown) => {
			regenerateCalls.push(params);

			return Promise.resolve({ enqueued: 0, operationId: "op-1" });
		},
	}),
	useTrickplayRegenerationReport: () => ({ data: undefined }),
}));

await mock.module("@/client/hooks/use-libraries", () => ({
	useAdminLibraries: () => ({ libraries: [] }),
}));

await mock.module("@/client/hooks/use-metadata-search", () => ({
	useGlobalMetadataSearch: () => ({
		query: "title",
		setQuery: () => undefined,
		results: { titles: searchTitles, people: [], companies: [], collections: [], genres: [], keywords: [] },
	}),
}));

await mock.module("@/client/hooks/use-seasons", () => ({
	useSeasons: () => ({ data: { data: [] } }),
}));

const { TrickplayRegenerationSection } = await import("@/pages/admin/trickplay/trickplay-regeneration-section");

beforeEach(() => {
	regenerateCalls.length = 0;
});
afterEach(() => cleanup());
afterAll(() => {
	mock.restore();
	unregisterDom();
});

function titleButton(view: ReturnType<typeof render>, title: string): HTMLButtonElement {
	const button = view.getAllByRole("button", { name: title }).find((element) => element.textContent === title);
	if (!button) throw new Error(`no title button for ${title}`);

	return button as HTMLButtonElement;
}

describe("trickplay bulk title selection", () => {
	test("selecting titles marks them as pressed and shows the running count", async () => {
		const view = render(<TrickplayRegenerationSection />);

		fireEvent.click(titleButton(view, "Title 1"));
		fireEvent.click(titleButton(view, "Title 2"));

		await waitFor(() => expect(view.getByText("Selected: 2")).toBeTruthy());
		expect(titleButton(view, "Title 1").getAttribute("aria-pressed")).toBe("true");
		expect(titleButton(view, "Title 2").getAttribute("aria-pressed")).toBe("true");
	});

	test("the selection never exceeds the 50 titles one request accepts", async () => {
		const view = render(<TrickplayRegenerationSection />);

		for (let index = 1; index <= 51; index += 1) fireEvent.click(titleButton(view, `Title ${index}`));

		await waitFor(() => expect(view.getByText("Selected: 50")).toBeTruthy());
		expect(titleButton(view, "Title 51").getAttribute("aria-pressed")).toBe("false");
		expect(titleButton(view, "Title 51").disabled).toBe(true);
	});

	test("filling the missing previews sends exactly the selected ids as one titles request", async () => {
		const view = render(<TrickplayRegenerationSection />);
		fireEvent.click(titleButton(view, "Title 3"));
		fireEvent.click(titleButton(view, "Title 4"));
		await waitFor(() => expect(view.getByText("Selected: 2")).toBeTruthy());

		fireEvent.click(view.getByRole("button", { name: "Fill missing for selected" }));

		await waitFor(() => expect(regenerateCalls).toEqual([{ scope: "titles", ids: ["title-3", "title-4"], force: false }]));
	});

	test("clearing the selection empties the count and the pressed states", async () => {
		const view = render(<TrickplayRegenerationSection />);
		fireEvent.click(titleButton(view, "Title 5"));
		await waitFor(() => expect(view.getByText("Selected: 1")).toBeTruthy());

		fireEvent.click(view.getByRole("button", { name: "Clear selection" }));

		await waitFor(() => expect(view.queryByText("Selected: 1")).toBeNull());
		expect(titleButton(view, "Title 5").getAttribute("aria-pressed")).toBe("false");
		expect(regenerateCalls).toEqual([]);
	});
});
