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
	if (type === "tv_show") return <Tv aria-hidden="true" className="text-muted-foreground size-8" />;

	return <Film aria-hidden="true" className="text-muted-foreground size-8" />;
}

export function TitleSearchCard({ item }: { item: SearchResultItem }) {
	return (
		<Link
			to="/details/$id"
			params={{ id: item.id }}
			className="group hover:bg-muted/50 focus-visible:ring-ring/50 flex min-w-0 flex-col gap-2 rounded-xl p-1.5 transition-colors focus-visible:ring-3"
		>
			<div className="bg-primary/10 aspect-2/3 w-full overflow-hidden rounded-lg">
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
			<span className="text-foreground line-clamp-2 text-sm leading-snug font-semibold" title={item.title}>
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
			className="group hover:bg-muted/50 focus-visible:ring-ring/50 flex min-w-0 flex-col items-center gap-2 rounded-xl p-1.5 text-center transition-colors focus-visible:ring-3"
		>
			<div className="bg-primary/10 aspect-square w-full max-w-40 overflow-hidden rounded-full">
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
						<User aria-hidden="true" className="text-muted-foreground size-8" />
					</span>
				)}
			</div>
			<span className="text-foreground line-clamp-2 text-sm leading-snug font-semibold" title={item.title}>
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
			className="group border-border/70 bg-card/50 hover:bg-muted/50 focus-visible:ring-ring/50 flex min-w-0 items-center gap-3 rounded-xl border p-2.5 transition-colors focus-visible:ring-3"
		>
			<div className="bg-primary/10 aspect-video w-24 shrink-0 overflow-hidden rounded-lg">
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
						<Layers aria-hidden="true" className="text-muted-foreground size-6" />
					</span>
				)}
			</div>
			<span className="text-foreground min-w-0 flex-1 truncate text-sm font-semibold" title={item.title}>
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
			className="border-border/70 bg-card/50 hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:ring-ring/50 inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-3"
		>
			<Compass aria-hidden="true" className="text-primary size-4" />
			{item.title}
		</Link>
	);
}
