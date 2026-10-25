import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, Sparkles, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useGlobalMetadataSearch } from "@/client/hooks/use-metadata-search";
import { type PluginSearchItem, usePluginSearch, usePluginSearchProvider } from "@/client/hooks/use-plugin-ui";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useDebounce } from "@/hooks/use-debounce";
import { usePageTitle } from "@/hooks/use-page-title";
import { detach } from "@/lib/detach";
import { GLOBAL_SEARCH_INPUT_ID } from "@/lib/global-search";
import { m } from "@/paraglide/messages";
import { ExternalCatalogSection } from "./components/external-catalog-section";
import { SearchResults } from "./components/search-results";

const PLUGIN_SEARCH_SECTION_KEY = "reelvault.search.pluginSection";
const PLUGIN_SEARCH_LIMIT = 12;

function getStoredPluginSearchEnabled(): boolean {
	try {
		return localStorage.getItem(PLUGIN_SEARCH_SECTION_KEY) !== "off";
	} catch {
		return true;
	}
}

function SearchLoading() {
	return (
		<div className="flex flex-col items-center justify-center py-14 text-center" aria-busy="true">
			<Spinner size="xl" aria-hidden="true" />
			<p className="text-foreground mt-4 font-semibold">{m.components_navbar_searching_catalog()}</p>
			<p className="text-muted-foreground mt-1 text-sm">{m.components_search_matching()}</p>
		</div>
	);
}

export default function SearchPage() {
	usePageTitle(m.web_search_page_title());
	const { q } = useSearch({ from: "/_web/search" });
	const navigate = useNavigate();
	const [query, setQuery] = useState(q ?? "");
	const debouncedQuery = useDebounce({ value: query, delay: 500 });
	const hasMinimumQuery = query.trim().length >= 2;

	const { results, isLoading, isFetching, isError, hasResults, refetch } = useGlobalMetadataSearch({ query });

	const searchProvider = usePluginSearchProvider();
	const [pluginSearchEnabled, setPluginSearchEnabled] = useState(getStoredPluginSearchEnabled);
	const {
		items: pluginResults,
		request,
		requestingItem,
		isRequesting,
		isFetching: isPluginFetching,
	} = usePluginSearch(searchProvider, query, hasMinimumQuery && pluginSearchEnabled);
	const pluginItems = pluginResults.filter((item) => item.state !== "available").slice(0, PLUGIN_SEARCH_LIMIT);

	useEffect(() => {
		const nextQuery = debouncedQuery.trim();
		const currentQuery = q?.trim() ?? "";
		if (nextQuery === currentQuery) return;

		detach(
			navigate({
				to: ".",
				search: (prev) => ({ ...prev, q: nextQuery || undefined }),
				replace: true,
				viewTransition: false,
			}),
		);
	}, [debouncedQuery, navigate, q]);

	const handlePluginSearchToggle = (enabled: boolean) => {
		setPluginSearchEnabled(enabled);
		try {
			localStorage.setItem(PLUGIN_SEARCH_SECTION_KEY, enabled ? "on" : "off");
		} catch {
			// Persisting the preference is best-effort.
		}
	};

	const handlePluginRequest = (item: PluginSearchItem) => {
		detach(() => request(item));
	};

	const isBusy = isFetching || (pluginSearchEnabled && isPluginFetching);
	const hasPluginSection = searchProvider !== null && pluginSearchEnabled && pluginItems.length > 0;

	let content: ReactNode;
	if (isError) {
		content = (
			<AppErrorState title={m.components_search_failed()} description={m.web_check_connection()} onRetry={() => detach(refetch())} />
		);
	} else if (isLoading) {
		content = <SearchLoading />;
	} else if (hasResults || hasPluginSection) {
		content = (
			<div className="flex flex-col gap-14">
				{hasResults && <SearchResults results={results} />}
				{searchProvider && hasPluginSection && (
					<ExternalCatalogSection
						provider={searchProvider}
						items={pluginItems}
						requestEndpoint={searchProvider.requestEndpoint}
						requestingItem={requestingItem}
						isRequesting={isRequesting}
						onRequest={handlePluginRequest}
					/>
				)}
			</div>
		);
	} else if (hasMinimumQuery) {
		content = <AppEmptyState icon={Search} title={m.components_search_no_results()} description={m.navbar_search_no_results({ query })} />;
	} else {
		content = (
			<AppEmptyState icon={Sparkles} title={m.components_search_start_typing()} description={m.components_search_min_chars_hint()} />
		);
	}

	return (
		<div className="cinema-page">
			<main className="cinema-shell relative">
				<header className="border-border/70 border-b pb-8">
					<p className="cinema-kicker">
						<Search aria-hidden="true" className="size-4" />
						{m.web_search_kicker()}
					</p>
					<h1 className="cinema-title mt-4">{m.components_navbar_search_heading()}</h1>
					<p className="cinema-copy mt-4">{m.components_navbar_search_catalog_hint()}</p>
				</header>

				<div className="mt-8">
					<search aria-label={m.components_navbar_search_heading()} className="block">
						<InputGroup size="lg">
							<InputGroupAddon>
								<Search aria-hidden="true" className="text-primary size-5" />
							</InputGroupAddon>
							<InputGroupInput
								id={GLOBAL_SEARCH_INPUT_ID}
								size="lg"
								autoFocus
								type="text"
								inputMode="search"
								enterKeyHint="search"
								autoComplete="off"
								aria-label={m.components_navbar_search_heading()}
								placeholder={m.components_search_placeholder()}
								value={query}
								onChange={(event) => setQuery(event.target.value)}
							/>
							<InputGroupAddon align="inline-end">
								{isBusy && <Spinner aria-label={m.components_search_loading()} />}
								{query !== "" && !isBusy && (
									<InputGroupButton size="icon-sm" aria-label={m.components_search_clear()} onClick={() => setQuery("")}>
										<X aria-hidden="true" />
									</InputGroupButton>
								)}
							</InputGroupAddon>
						</InputGroup>
					</search>

					{searchProvider && (
						<div className="mt-4 flex items-center gap-2">
							<Switch
								id="search-page-plugin-toggle"
								checked={pluginSearchEnabled}
								onCheckedChange={handlePluginSearchToggle}
								aria-label={m.components_search_plugin_toggle_label()}
							/>
							<Label htmlFor="search-page-plugin-toggle" tone="muted" size="xs" className="cursor-pointer">
								{m.components_search_plugin_toggle_label()}
							</Label>
						</div>
					)}
				</div>

				<div className="mt-10 min-h-64" aria-live="polite" aria-busy={isBusy}>
					{content}
				</div>
			</main>
		</div>
	);
}
