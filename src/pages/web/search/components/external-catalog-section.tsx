import { Link } from "@tanstack/react-router";
import { Film, Globe, Send, Tv } from "lucide-react";
import type { PluginSearchItem, PluginSearchProvider } from "@/client/hooks/use-plugin-ui";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { m } from "@/paraglide/messages";

function itemKey(item: PluginSearchItem): string {
	return `${item.providerId}:${item.externalId}`;
}

function ExternalCardArtwork({ item, requested }: { item: PluginSearchItem; requested: boolean }) {
	return (
		<div className="relative aspect-2/3 w-full overflow-hidden rounded-lg bg-primary/10">
			{item.imageUrl ? (
				<img src={item.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover grayscale" />
			) : (
				<span className="flex size-full items-center justify-center">
					{item.mediaType === "tv_show" ? (
						<Tv aria-hidden="true" className="size-8 text-muted-foreground" />
					) : (
						<Film aria-hidden="true" className="size-8 text-muted-foreground" />
					)}
				</span>
			)}
			{requested && (
				<span className="absolute top-1.5 left-1.5 rounded-full bg-background/90 px-2 py-0.5 font-semibold text-foreground text-xs shadow-sm">
					{m.components_search_plugin_requested()}
				</span>
			)}
		</div>
	);
}

function ExternalCardText({ item }: { item: PluginSearchItem }) {
	return (
		<div className="min-w-0">
			<span className="block truncate font-semibold text-foreground text-sm" title={item.title}>
				{item.title}
			</span>
			<span className="block text-muted-foreground text-xs">
				{item.mediaType === "movie" ? m.common_movie_word() : m.common_series_word()}
				{item.year !== undefined ? ` · ${item.year}` : ""}
			</span>
		</div>
	);
}

function ExternalRequestButton({
	item,
	isRequesting,
	onRequest,
	className,
}: {
	item: PluginSearchItem;
	isRequesting: boolean;
	onRequest: (item: PluginSearchItem) => void;
	className: string;
}) {
	return (
		<Button
			shape="pill"
			type="button"
			size="icon-sm"
			aria-label={`${m.components_search_plugin_request()}: ${item.title}`}
			className={className}
			disabled={isRequesting}
			onClick={() => onRequest(item)}
		>
			{isRequesting ? <Spinner size="sm" aria-hidden="true" /> : <Send aria-hidden="true" className="size-3.5" />}
		</Button>
	);
}

function ExternalCatalogCard({
	provider,
	item,
	requestEndpoint,
	isRequesting,
	onRequest,
}: {
	provider: PluginSearchProvider;
	item: PluginSearchItem;
	requestEndpoint: string | undefined;
	isRequesting: boolean;
	onRequest: (item: PluginSearchItem) => void;
}) {
	const requested = item.state === "pending" || item.state === "approved";
	const artwork = <ExternalCardArtwork item={item} requested={requested} />;
	const text = <ExternalCardText item={item} />;

	if (provider.itemPagePath) {
		return (
			<div className="relative">
				<Link
					to="/plugins/$pluginId/page/$pagePath"
					params={{ pluginId: provider.pluginId, pagePath: provider.itemPagePath }}
					search={{ providerId: item.providerId, externalId: item.externalId, mediaType: item.mediaType }}
					className="group flex min-w-0 flex-col gap-2 rounded-xl p-1.5 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					{artwork}
					{text}
				</Link>
				{requestEndpoint && (
					<ExternalRequestButton
						item={item}
						isRequesting={isRequesting}
						onRequest={onRequest}
						className="absolute right-2 bottom-14 z-10"
					/>
				)}
			</div>
		);
	}

	if (requestEndpoint) {
		return (
			<button
				type="button"
				onClick={() => onRequest(item)}
				disabled={isRequesting}
				aria-label={`${m.components_search_plugin_request()}: ${item.title}`}
				className="group relative flex min-w-0 flex-col gap-2 rounded-xl p-1.5 text-left transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
			>
				{artwork}
				{text}
				<span className="absolute right-2 bottom-14 rounded-full bg-background/90 p-1.5 text-foreground shadow-sm">
					{isRequesting ? <Spinner size="sm" aria-hidden="true" /> : <Send aria-hidden="true" className="size-3.5" />}
				</span>
			</button>
		);
	}

	return (
		<div className="flex min-w-0 flex-col gap-2 p-1.5">
			{artwork}
			{text}
		</div>
	);
}

export function ExternalCatalogSection({
	provider,
	items,
	requestEndpoint,
	requestingItem,
	isRequesting,
	onRequest,
}: {
	provider: PluginSearchProvider;
	items: PluginSearchItem[];
	requestEndpoint: string | undefined;
	requestingItem: PluginSearchItem | null;
	isRequesting: boolean;
	onRequest: (item: PluginSearchItem) => void;
}) {
	if (items.length === 0) return null;

	const requestingKey = isRequesting && requestingItem ? itemKey(requestingItem) : null;

	return (
		<section className="scroll-mt-24">
			<header className="flex items-end justify-between gap-4">
				<div className="cinema-section-heading">
					<h2 className="flex items-center gap-2">
						<Globe aria-hidden="true" className="size-5 text-primary" />
						{m.components_search_plugin_heading()}
					</h2>
				</div>
				<span className="font-mono text-muted-foreground text-xs tabular-nums">{items.length.toString().padStart(2, "0")}</span>
			</header>
			<div className="poster-shelf mt-6">
				{items.map((item) => (
					<ExternalCatalogCard
						key={itemKey(item)}
						provider={provider}
						item={item}
						requestEndpoint={requestEndpoint}
						isRequesting={requestingKey === itemKey(item)}
						onRequest={onRequest}
					/>
				))}
			</div>
		</section>
	);
}
