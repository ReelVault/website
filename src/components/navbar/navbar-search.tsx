import { useNavigate } from "@tanstack/react-router";
import { cn } from "cn";
import { Compass, Film, Globe, Layers, Loader2, Search, Send, Sparkles, Tv, User, X } from "lucide-react";
import { type ReactNode, startTransition, useState } from "react";
import { useGlobalMetadataSearch } from "@/client/hooks/use-metadata-search";
import { type PluginSearchItem, usePluginSearch, usePluginSearchProvider } from "@/client/hooks/use-plugin-ui";
import { ApiImage } from "@/components/ui/api-image";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useOverlayHistory } from "@/hooks/use-overlay-history";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

const PLUGIN_SEARCH_SECTION_KEY = "reelvault.search.pluginSection";
/** External suggestions shown per query, closest matches first (provider order). */
const PLUGIN_SEARCH_LIMIT = 5;

function getStoredPluginSearchEnabled(): boolean {
	try {
		return localStorage.getItem(PLUGIN_SEARCH_SECTION_KEY) !== "off";
	} catch {
		return true;
	}
}

/** Flattened search hit shared by all native groups. */
interface NativeSearchItem {
	id: string;
	label: string | undefined;
	type: string | undefined;
	imageId: string | null;
	imageUpdatedAt: Date | string | null;
}

function SearchGroupHeading({ icon: Icon, label, count }: { icon: typeof Film; label: string; count: number }) {
	return (
		<span className="flex items-center gap-2 font-bold text-muted-foreground text-xs uppercase tracking-wider">
			<Icon className="size-3.5 text-primary" aria-hidden="true" />
			{label}
			<span className="ml-auto font-mono tabular-nums">{count}</span>
		</span>
	);
}

function NativeSearchFallbackIcon({ isPeople, type }: { isPeople: boolean; type: string | undefined }) {
	if (isPeople) return <User aria-hidden="true" className="size-8 text-muted-foreground" />;

	if (type === "tv_show") return <Tv aria-hidden="true" className="size-8 text-muted-foreground" />;

	return <Film aria-hidden="true" className="size-8 text-muted-foreground" />;
}

/** Titles & people are visual — same poster-first grid language as the external catalog section. */
function NativePosterGroup({
	itemsKey,
	icon: Icon,
	label,
	items,
	buildHref,
	onSelect,
}: {
	itemsKey: "titles" | "people";
	icon: typeof Film;
	label: string;
	items: NativeSearchItem[];
	buildHref: (id: string) => string;
	onSelect: (id: string, buildHref: (id: string) => string) => void;
}) {
	const isPeople = itemsKey === "people";

	return (
		<CommandGroup heading={<SearchGroupHeading icon={Icon} label={label} count={items.length} />} className="px-1 py-1">
			<div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
				{items.map((item) => (
					<CommandItem
						key={`${itemsKey}-${item.id}`}
						value={`${itemsKey}-${item.id}-${item.label ?? ""}`}
						onSelect={() => onSelect(item.id, buildHref)}
						className={cn("rounded-xl p-1.5", isPeople ? "flex-col items-center gap-1.5" : "flex-col items-stretch gap-1.5")}
					>
						<div
							className={cn("w-full overflow-hidden bg-primary/10", isPeople ? "aspect-square rounded-full" : "aspect-[2/3] rounded-lg")}
						>
							{item.imageId ? (
								<ApiImage
									fileId={item.imageId}
									cacheKey={item.imageUpdatedAt}
									alt=""
									width={240}
									aspectRatio={isPeople ? 1 : 2 / 3}
									className="size-full object-cover"
								/>
							) : (
								<span className="flex size-full items-center justify-center">
									<NativeSearchFallbackIcon isPeople={isPeople} type={item.type} />
								</span>
							)}
						</div>
						<span className="block w-full truncate font-semibold text-foreground text-xs" title={item.label ?? undefined}>
							{item.label ?? m.common_unnamed()}
						</span>
						{!isPeople && item.type !== undefined && (
							<span className="block text-[11px] text-muted-foreground">
								{item.type === "movie" ? m.common_movie_word() : m.common_series_word()}
							</span>
						)}
					</CommandItem>
				))}
			</div>
		</CommandGroup>
	);
}

/** Collections & genres: navigational shortcuts without artwork. */
function NativeRowGroup({
	icon: Icon,
	label,
	items,
	buildHref,
	onSelect,
}: {
	icon: typeof Film;
	label: string;
	items: NativeSearchItem[];
	buildHref: (id: string) => string;
	onSelect: (id: string, buildHref: (id: string) => string) => void;
}) {
	return (
		<CommandGroup heading={<SearchGroupHeading icon={Icon} label={label} count={items.length} />} className="px-1 py-1">
			{items.map((item) => (
				<CommandItem
					key={item.id}
					value={`${label}-${item.id}-${item.label ?? ""}`}
					onSelect={() => onSelect(item.id, buildHref)}
					className="gap-3 rounded-xl px-2 py-2"
				>
					<div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10">
						<Icon aria-hidden="true" className="size-5 text-muted-foreground" />
					</div>
					<span className="min-w-0 flex-1 truncate font-semibold text-foreground text-sm">{item.label ?? m.common_unnamed()}</span>
				</CommandItem>
			))}
		</CommandGroup>
	);
}

/** Poster grid for the plugin-provided titles (grayscale = not in the library). */
function ExternalCatalogGroup({
	items,
	requestEndpoint,
	requestingItem,
	isRequesting,
	onRequest,
	onSelect,
}: {
	items: PluginSearchItem[];
	requestEndpoint: string | undefined;
	requestingItem: PluginSearchItem | null;
	isRequesting: boolean;
	onRequest: (item: PluginSearchItem) => void;
	onSelect: (item: PluginSearchItem) => void;
}) {
	return (
		<div className="flex flex-col gap-2">
			<span className="flex items-center gap-2 px-1 font-bold text-muted-foreground text-xs uppercase tracking-wider">
				<Globe className="size-3.5 text-primary" aria-hidden="true" />
				{m.components_search_plugin_heading()}
				<span className="ml-auto font-mono tabular-nums">{items.length}</span>
			</span>
			<div className="grid grid-cols-3 gap-2 px-1 sm:grid-cols-5">
				{items.map((item) => {
					const alreadyRequested = item.state === "pending" || item.state === "approved";
					const isRequestingThis = isRequesting && requestingItem === item;

					return (
						<CommandItem
							key={`plugin-${item.providerId}-${item.externalId}`}
							value={`plugin-${item.providerId}-${item.externalId}-${item.title}`}
							onSelect={() => onSelect(item)}
							className="flex-col items-stretch gap-1.5 rounded-xl p-1.5"
						>
							<div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-primary/10">
								{item.imageUrl ? (
									<img
										src={item.imageUrl}
										alt=""
										loading="lazy"
										referrerPolicy="no-referrer"
										className="size-full object-cover grayscale"
									/>
								) : (
									<span className="flex size-full items-center justify-center">
										<NativeSearchFallbackIcon isPeople={false} type={item.mediaType} />
									</span>
								)}
								{alreadyRequested && (
									<span className="absolute top-1 left-1 rounded-full bg-background/90 px-2 py-0.5 font-semibold text-[10px] text-foreground shadow-sm">
										{m.components_search_plugin_requested()}
									</span>
								)}
								{requestEndpoint && (
									<Button
										type="button"
										tabIndex={-1}
										size="icon-sm"
										aria-label={m.components_search_plugin_request()}
										className="absolute right-1 bottom-1 size-7 rounded-full bg-background/90 text-foreground shadow-md hover:bg-background"
										disabled={isRequestingThis}
										onClick={(event) => {
											// Keep cmdk from also treating the press as a card select.
											event.stopPropagation();
											onRequest(item);
										}}
									>
										{isRequestingThis ? (
											<Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
										) : (
											<Send className="size-3.5" aria-hidden="true" />
										)}
									</Button>
								)}
							</div>
							<div className="min-w-0">
								<span className="block truncate font-semibold text-foreground text-xs" title={item.title}>
									{item.title}
								</span>
								<span className="block text-[11px] text-muted-foreground">
									{item.mediaType === "movie" ? m.common_movie_word() : m.common_series_word()}
									{item.year !== undefined ? ` · ${item.year}` : ""}
								</span>
							</div>
						</CommandItem>
					);
				})}
			</div>
		</div>
	);
}

const groups: Array<{
	readonly label: string;
	icon: typeof Film;
	itemsKey: "titles" | "people" | "collections" | "genres";
	href: (id: string) => string;
}> = [
	{
		get label() {
			return m.components_search_titles_heading();
		},
		icon: Film,
		itemsKey: "titles",
		href: (id) => `/details/${id}`,
	},
	{
		get label() {
			return m.components_search_people_heading();
		},
		icon: User,
		itemsKey: "people",
		href: (id) => `/person/${id}`,
	},
	{
		get label() {
			return m.components_search_collections_heading();
		},
		icon: Layers,
		itemsKey: "collections",
		href: (id) => `/collections/${id}`,
	},
	{
		get label() {
			return m.components_search_genres_heading();
		},
		icon: Compass,
		itemsKey: "genres",
		href: () => "/discovery",
	},
];

export function NavbarSearch({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (value: boolean) => void }) {
	const { query, setQuery, results, isLoading, isFetching, hasResults } = useGlobalMetadataSearch();
	const navigate = useNavigate();
	const hasMinimumQuery = query.trim().length >= 2;

	// Plugin search results (e.g. media-requests) — requestable straight from here.
	// The toggle persists in localStorage; when off, no plugin query fires at all.
	const searchProvider = usePluginSearchProvider();
	const [pluginSearchEnabled, setPluginSearchEnabled] = useState(getStoredPluginSearchEnabled);
	const handlePluginSearchToggle = (enabled: boolean) => {
		setPluginSearchEnabled(enabled);
		try {
			localStorage.setItem(PLUGIN_SEARCH_SECTION_KEY, enabled ? "on" : "off");
		} catch {
			// Persisting the preference is best-effort.
		}
	};
	const {
		items: pluginResults,
		request,
		requestingItem,
		isRequesting,
	} = usePluginSearch(searchProvider, query, hasMinimumQuery && pluginSearchEnabled);
	// Titles already in the library belong to the native section above — the
	// external section lists only requestable (or already-requested) titles.
	const pluginItems = pluginResults.filter((item) => item.state !== "available").slice(0, PLUGIN_SEARCH_LIMIT);

	const handleClose = () => {
		setQuery("");
		setIsOpen(false);
	};

	const handleClearQuery = () => setQuery("");

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (!open) setQuery("");
	};

	// Hardware/browser Back closes the overlay instead of leaving the page.
	useOverlayHistory(isOpen, handleClose);

	const handleSelect = (id: string, buildHref: (id: string) => string) => {
		handleClose();
		// Transition consumes the navigation promise without leaving it floating.
		startTransition(() => navigate({ href: buildHref(id) }));
	};

	const handlePluginSelect = (item: PluginSearchItem) => {
		handleClose();
		if (searchProvider?.itemPagePath) {
			startTransition(() =>
				navigate({
					to: "/plugins/$pluginId/page/$pagePath",
					params: { pluginId: searchProvider.pluginId, pagePath: searchProvider.itemPagePath ?? "" },
					search: { providerId: item.providerId, externalId: item.externalId, mediaType: item.mediaType },
				}),
			);

			return;
		}

		if (searchProvider?.requestEndpoint) detach(() => request(item));
	};

	const handlePluginRequest = (item: PluginSearchItem) => {
		detach(() => request(item));
	};

	let listContent: ReactNode;
	if (isLoading) {
		listContent = (
			<div className="flex flex-col items-center justify-center py-14 text-center">
				<Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
				<p className="mt-4 font-semibold text-foreground">{m.components_navbar_searching_catalog()}</p>
				<p className="mt-1 text-muted-foreground text-sm">{m.components_search_matching()}</p>
			</div>
		);
	} else if (hasResults || pluginItems.length > 0) {
		listContent = (
			<div className="space-y-2">
				{hasResults &&
					groups.map((group) => {
						const groupItems: NativeSearchItem[] = results[group.itemsKey].map((item) => {
							let label: string | undefined;
							if ("title" in item) {
								label = item.title;
							} else if ("name" in item) {
								label = item.name;
							}

							return {
								id: item.id,
								label,
								type: "type" in item ? item.type : undefined,
								imageId: "imageId" in item ? (item.imageId ?? null) : null,
								imageUpdatedAt: "imageUpdatedAt" in item ? (item.imageUpdatedAt ?? null) : null,
							};
						});
						if (groupItems.length === 0) return null;

						if (group.itemsKey === "titles" || group.itemsKey === "people") {
							return (
								<NativePosterGroup
									key={group.itemsKey}
									itemsKey={group.itemsKey}
									icon={group.icon}
									label={group.label}
									items={groupItems}
									buildHref={group.href}
									onSelect={handleSelect}
								/>
							);
						}

						return (
							<NativeRowGroup
								key={group.itemsKey}
								icon={group.icon}
								label={group.label}
								items={groupItems}
								buildHref={group.href}
								onSelect={handleSelect}
							/>
						);
					})}
				{searchProvider && pluginSearchEnabled && pluginItems.length > 0 && (
					<ExternalCatalogGroup
						items={pluginItems}
						requestEndpoint={searchProvider.requestEndpoint}
						requestingItem={requestingItem}
						isRequesting={isRequesting}
						onRequest={handlePluginRequest}
						onSelect={handlePluginSelect}
					/>
				)}
			</div>
		);
	} else if (hasMinimumQuery) {
		listContent = (
			<div className="flex flex-col items-center justify-center py-14 text-center">
				<div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
					<Search className="size-6" aria-hidden="true" />
				</div>
				<p className="mt-4 font-semibold text-foreground">{m.components_search_no_results()}</p>
				<p className="mt-1 max-w-sm text-muted-foreground text-sm">{m.navbar_search_no_results({ query })}</p>
			</div>
		);
	} else {
		listContent = (
			<div className="flex flex-col items-center justify-center py-14 text-center">
				<div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
					<Sparkles className="size-6" aria-hidden="true" />
				</div>
				<p className="mt-4 font-semibold text-foreground">{m.components_search_start_typing()}</p>
				<p className="mt-1 text-muted-foreground text-sm">{m.components_search_min_chars_hint()}</p>
			</div>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger
				aria-label={m.components_search_open_shortcut()}
				aria-keyshortcuts="Control+K"
				className="group flex h-10 items-center gap-2.5 rounded-xl border border-border/70 bg-background/50 px-3 text-muted-foreground text-xs transition-[border-color,background-color,color] hover:border-primary/50 hover:bg-muted/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
			>
				<Search className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
				<span className="hidden font-medium xl:inline">{m.components_navbar_search_catalog()}</span>
				<kbd className="hidden items-center gap-0.5 rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-xs sm:inline-flex">
					{m.common_shortcut_ctrl_k()}
				</kbd>
			</DialogTrigger>

			<DialogContent
				showCloseButton={false}
				className="max-h-[85vh] w-[95vw] max-w-3xl gap-0 overflow-hidden rounded-2xl border-border bg-popover/95 p-0 shadow-2xl shadow-black/40 sm:max-w-4xl lg:max-w-5xl"
			>
				<DialogHeader className="border-border border-b px-5 pt-5 pb-4 sm:px-6">
					<div className="flex items-center justify-between gap-4">
						<div>
							<DialogTitle className="font-bold text-lg">{m.components_navbar_search_heading()}</DialogTitle>
							<DialogDescription className="mt-0.5 text-xs">{m.components_navbar_search_catalog_hint()}</DialogDescription>
							{searchProvider && (
								<div className="mt-2.5 flex items-center gap-2">
									<Switch
										id="navbar-search-plugin-toggle"
										checked={pluginSearchEnabled}
										onCheckedChange={handlePluginSearchToggle}
										aria-label={m.components_search_plugin_toggle_label()}
									/>
									<Label htmlFor="navbar-search-plugin-toggle" className="cursor-pointer text-muted-foreground text-xs">
										{m.components_search_plugin_toggle_label()}
									</Label>
								</div>
							)}
						</div>
						<Button type="button" variant="ghost" size="icon-sm" onClick={handleClose} aria-label={m.components_search_close()}>
							<X className="size-4" />
						</Button>
					</div>
				</DialogHeader>

				<Command shouldFilter={false} loop className="gap-0">
					<div className="relative border-border border-b px-5 pt-4 pb-4 sm:px-6">
						<CommandInput
							autoFocus
							value={query}
							onValueChange={setQuery}
							placeholder={m.components_search_placeholder()}
							aria-label={m.components_navbar_search_catalog()}
							className="h-12 rounded-xl border-border bg-background/80 pr-20 text-base focus-visible:border-primary focus-visible:ring-primary/30"
						/>
						<div className="pointer-events-none absolute top-1/2 right-7 flex -translate-y-1/2 items-center gap-1">
							{isFetching && <Loader2 className="mr-1 size-4 animate-spin text-primary" aria-label={m.components_search_loading()} />}
							{query && !isFetching && (
								<Button
									type="button"
									tabIndex={-1}
									variant="ghost"
									size="icon-sm"
									onClick={handleClearQuery}
									aria-label={m.components_search_clear()}
									className="pointer-events-auto"
								>
									<X className="size-4" aria-hidden="true" />
								</Button>
							)}
						</div>
					</div>

					<CommandList aria-live="polite" className="max-h-[min(60vh,36rem)] min-h-80 px-3 py-4 sm:px-4">
						{listContent}
					</CommandList>
				</Command>

				<div className="flex items-center justify-between border-border border-t bg-muted/20 px-5 py-3 text-muted-foreground text-xs sm:px-6">
					<span className="flex items-center gap-2">
						<span>{m.components_search_press()}</span>
						<kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-foreground shadow-xs">
							{m.common_shortcut_esc()}
						</kbd>
						<span>{m.components_search_to_close()}</span>
					</span>
					<div className="flex items-center gap-2">
						<span>{m.components_search_global_shortcut()}</span>
						<kbd className="rounded border border-border bg-card px-2 py-0.5 font-mono text-[11px] text-foreground shadow-xs">
							{m.common_shortcut_ctrl_k()}
						</kbd>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
