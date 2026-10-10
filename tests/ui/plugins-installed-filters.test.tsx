import { afterAll, afterEach, describe, expect, mock, test } from "bun:test";
import { overwriteGetLocale } from "@/paraglide/runtime";
import { ensureDom, unregisterDom } from "./register-dom";

/**
 * The installed plugin list follows the search text and the category filter. The category comes from
 * the catalog entry of each installed plugin, so a plugin without a catalog entry is left out by a
 * category choice.
 */

// React reads the browser's event support when it loads, so the DOM is installed before Testing Library and the page.
ensureDom();

const { cleanup, fireEvent, render } = await import("@testing-library/react");

overwriteGetLocale(() => "en");

const installed = [
	{ id: "org.reelvault.subtitle-helper", name: "Subtitle Helper", description: "Finds subtitle files" },
	{ id: "org.reelvault.metadata-pro", name: "Metadata Pro", description: "Matches titles to catalog entries" },
];

const catalog = [
	{
		id: "org.reelvault.subtitle-helper",
		name: "Subtitle Helper",
		description: "Finds subtitle files",
		category: "subtitles",
		status: "installed",
	},
	{
		id: "org.reelvault.metadata-pro",
		name: "Metadata Pro",
		description: "Matches titles to catalog entries",
		category: "metadata",
		status: "installed",
	},
];

const searchState: { view: string; category?: string } = { view: "installed" };

const router = await import("@tanstack/react-router");
const adminUi = await import("@/pages/admin/admin-ui");

await mock.module("@tanstack/react-router", () => ({
	...router,
	useSearch: () => ({ ...searchState }),
	useNavigate: () => () => Promise.resolve(),
}));

// The search box is replaced by two buttons: typed text reaches React through a change event that
// this DOM environment does not deliver, so the page gets the same text from a click instead.
await mock.module("@/pages/admin/admin-ui", () => ({
	...adminUi,
	AdminSearch: ({ onChange }: { onChange: (value: string) => void }) => (
		<>
			<button type="button" onClick={() => onChange("subtitle")}>
				search subtitle
			</button>
			<button type="button" onClick={() => onChange("")}>
				clear search
			</button>
		</>
	),
}));

const noop = async () => undefined;

await mock.module("@/client/hooks/use-admin-plugins", () => ({
	useAdminPlugins: () => ({
		plugins: installed,
		pluginsQuery: { isLoading: false, isError: false, refetch: noop },
		reloadAll: noop,
		enablePlugin: noop,
		disablePlugin: noop,
		reloadPlugin: noop,
		setPluginCsp: noop,
		setPluginsEnabled: noop,
		setPluginPinned: noop,
		isBulkUpdating: false,
		isReloadingAll: false,
		isEnabling: false,
		isDisabling: false,
		isReloading: false,
	}),
}));

await mock.module("@/client/hooks/use-plugin-catalog", () => ({
	usePluginCatalog: () => ({
		catalog,
		catalogQuery: { isLoading: false, isError: false, refetch: noop },
		unavailableRepositories: [],
		repositories: [],
		installPlugin: noop,
		installArchive: noop,
		archiveEntries: [],
		archiveSummary: null,
		isInstallingArchive: false,
		clearArchiveEntries: () => undefined,
		uninstallPlugin: noop,
		createRepository: noop,
		updateRepository: noop,
		deleteRepository: noop,
		refreshRepository: noop,
		isInstalling: false,
		isUninstalling: false,
		isCreatingRepository: false,
		isUpdatingRepository: false,
		isDeletingRepository: false,
		isRefreshingRepository: false,
	}),
}));

// The cards and dialogs have their own behaviour; the page's filtering is what this file checks.
await mock.module("@/pages/admin/plugins/components/plugin-card", () => ({
	PluginCard: ({ plugin }: { plugin: { name: string } }) => <div data-testid="installed-card">{plugin.name}</div>,
}));

await mock.module("@/pages/admin/plugins/components/plugin-catalog-card", () => ({
	PluginCatalogCard: ({ entry }: { entry: { name: string } }) => <div data-testid="catalog-card">{entry.name}</div>,
	pluginCatalogCategoryLabel: (category: string) => category,
}));

await mock.module("@/pages/admin/plugins/components/plugin-catalog-detail-dialog", () => ({
	PluginCatalogDetailDialog: () => null,
}));

await mock.module("@/pages/admin/plugins/components/plugin-repositories-dialog", () => ({
	PluginRepositoriesDialog: () => null,
}));

await mock.module("@/pages/admin/plugins/components/plugin-upload-dialog", () => ({
	PluginUploadDialog: () => null,
}));

const { default: AdminPluginsPage } = await import("@/pages/admin/plugins/plugins-page");

function renderPage(search: { view: string; category?: string }) {
	searchState.view = search.view;
	searchState.category = search.category;

	return render(<AdminPluginsPage />);
}

function installedNames(view: ReturnType<typeof renderPage>): string[] {
	return [...view.container.querySelectorAll('[data-testid="installed-card"]')].map((card) => card.textContent ?? "");
}

afterEach(() => {
	searchState.view = "installed";
	searchState.category = undefined;
	cleanup();
});
afterAll(() => {
	mock.restore();
	unregisterDom();
});

describe("installed plugin list filters", () => {
	test("with no filter every installed plugin is listed", () => {
		const view = renderPage({ view: "installed" });

		expect(installedNames(view)).toEqual(["Subtitle Helper", "Metadata Pro"]);
	});

	test("the search text narrows the installed list", () => {
		const view = renderPage({ view: "installed" });

		fireEvent.click(view.getByRole("button", { name: "search subtitle" }));

		expect(installedNames(view)).toEqual(["Subtitle Helper"]);
	});

	test("clearing the search text lists the installed plugins again", () => {
		const view = renderPage({ view: "installed" });

		fireEvent.click(view.getByRole("button", { name: "search subtitle" }));
		fireEvent.click(view.getByRole("button", { name: "clear search" }));

		expect(installedNames(view)).toEqual(["Subtitle Helper", "Metadata Pro"]);
	});

	test("the category filter narrows the installed list by the catalog category", () => {
		const view = renderPage({ view: "installed", category: "metadata" });

		expect(installedNames(view)).toEqual(["Metadata Pro"]);
	});

	test("the search text and the category filter narrow the list together", () => {
		const view = renderPage({ view: "installed", category: "metadata" });

		fireEvent.click(view.getByRole("button", { name: "search subtitle" }));

		expect(installedNames(view)).toEqual([]);
	});

	test("the category choices are offered in the installed view too", () => {
		const view = renderPage({ view: "installed" });

		expect(view.getByText("metadata")).toBeTruthy();
		expect(view.getByText("subtitles")).toBeTruthy();
	});
});
