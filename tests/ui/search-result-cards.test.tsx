import { afterAll, afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { overwriteGetLocale } from "@/paraglide/runtime";
import { ensureDom, unregisterDom } from "./register-dom";

/**
 * Search results must stay real anchors. The old dialog used card `onClick`
 * handlers, which is exactly the path that failed to navigate in Chromium.
 */

overwriteGetLocale(() => "en");
beforeAll(() => ensureDom());

interface MockLinkProps {
	to: string;
	params?: { id: string };
	children: ReactNode;
}

function MockLink({ to, params, children, ...props }: MockLinkProps) {
	return (
		<a href={params?.id ? to.replace("$id", params.id) : to} {...props}>
			{children}
		</a>
	);
}

await mock.module("@tanstack/react-router", () => ({
	Link: MockLink,
}));

const { CollectionSearchCard, GenreSearchCard, PersonSearchCard, TitleSearchCard } = await import(
	"@/pages/web/search/components/search-result-cards"
);

afterAll(() => {
	mock.restore();
	unregisterDom();
});
afterEach(() => cleanup());

const ITEM = {
	id: "item-1",
	title: "Example",
	type: "movie" as const,
	imageId: null,
	imageUpdatedAt: null,
};

describe("search result cards", () => {
	test("titles link to the details page", () => {
		const view = render(<TitleSearchCard item={ITEM} />);
		expect(view.getByRole("link").getAttribute("href")).toBe("/details/item-1");
	});

	test("people link to the person page", () => {
		const view = render(<PersonSearchCard item={ITEM} />);
		expect(view.getByRole("link").getAttribute("href")).toBe("/person/item-1");
	});

	test("collections link to the collection page", () => {
		const view = render(<CollectionSearchCard item={ITEM} />);
		expect(view.getByRole("link").getAttribute("href")).toBe("/collections/item-1");
	});

	test("genres link to the genre page", () => {
		const view = render(<GenreSearchCard item={ITEM} />);
		expect(view.getByRole("link").getAttribute("href")).toBe("/genres/item-1");
	});
});
