import { Link } from "@tanstack/react-router";
import { Compass, Film, Layers, Tv, User } from "lucide-react";
import { ApiImage } from "@/components/ui/api-image";
import { m } from "@/paraglide/messages";

export interface SearchResultItem {
	id: string;
	title: string;
	type: string | undefined;
	imageId: string | null;
	imageUpdatedAt: Date | string | null;
}

function TitleFallbackIcon({ type }: { type: string | undefined }) {
	if (type === "tv_show") return <Tv aria-hidden="true" className="size-8 text-muted-foreground" />;

	return <Film aria-hidden="true" className="size-8 text-muted-foreground" />;
}

export function TitleSearchCard({ item }: { item: SearchResultItem }) {
	return (
		<Link
			to="/details/$id"
			params={{ id: item.id }}
			className="group flex min-w-0 flex-col gap-2 rounded-xl p-1.5 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
		>
			<div className="aspect-2/3 w-full overflow-hidden rounded-lg bg-primary/10">
				{item.imageId ? (
					<ApiImage
						fileId={item.imageId}
						cacheKey={item.imageUpdatedAt}
						alt=""
						width={320}
						aspectRatio={2 / 3}
						zoom
						className="size-full object-cover"
					/>
				) : (
					<span className="flex size-full items-center justify-center">
						<TitleFallbackIcon type={item.type} />
					</span>
				)}
			</div>
			<span className="line-clamp-2 font-semibold text-foreground text-sm leading-snug" title={item.title}>
				{item.title}
			</span>
			{item.type !== undefined && (
				<span className="text-muted-foreground text-xs">{item.type === "movie" ? m.common_movie_word() : m.common_series_word()}</span>
			)}
		</Link>
	);
}

export function PersonSearchCard({ item }: { item: SearchResultItem }) {
	return (
		<Link
			to="/person/$id"
			params={{ id: item.id }}
			className="group flex min-w-0 flex-col items-center gap-2 rounded-xl p-1.5 text-center transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
		>
			<div className="aspect-square w-full max-w-40 overflow-hidden rounded-full bg-primary/10">
				{item.imageId ? (
					<ApiImage
						fileId={item.imageId}
						cacheKey={item.imageUpdatedAt}
						alt=""
						width={240}
						aspectRatio={1}
						zoom
						className="size-full object-cover"
					/>
				) : (
					<span className="flex size-full items-center justify-center">
						<User aria-hidden="true" className="size-8 text-muted-foreground" />
					</span>
				)}
			</div>
			<span className="line-clamp-2 font-semibold text-foreground text-sm leading-snug" title={item.title}>
				{item.title}
			</span>
		</Link>
	);
}

export function CollectionSearchCard({ item }: { item: SearchResultItem }) {
	return (
		<Link
			to="/collections/$id"
			params={{ id: item.id }}
			className="group flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-card/50 p-2.5 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
		>
			<div className="aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-primary/10">
				{item.imageId ? (
					<ApiImage
						fileId={item.imageId}
						cacheKey={item.imageUpdatedAt}
						alt=""
						width={192}
						aspectRatio={16 / 9}
						zoom
						className="size-full object-cover"
					/>
				) : (
					<span className="flex size-full items-center justify-center">
						<Layers aria-hidden="true" className="size-6 text-muted-foreground" />
					</span>
				)}
			</div>
			<span className="min-w-0 flex-1 truncate font-semibold text-foreground text-sm" title={item.title}>
				{item.title}
			</span>
		</Link>
	);
}

export function GenreSearchCard({ item }: { item: SearchResultItem }) {
	return (
		<Link
			to="/genres/$id"
			params={{ id: item.id }}
			className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border/70 bg-card/50 px-4 font-medium text-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
		>
			<Compass aria-hidden="true" className="size-4 text-primary" />
			{item.title}
		</Link>
	);
}
