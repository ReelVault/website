import { Link } from "@tanstack/react-router";
import { Clapperboard, Play } from "lucide-react";
import type { useCollections } from "@/client/hooks/use-collections";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { m } from "@/paraglide/messages";
import { CollectionPosterCollage } from "./collection-poster-collage";

export type CollectionListItem = NonNullable<Awaited<ReturnType<typeof useCollections>>["data"]>["data"][number];

export function CollectionCard({ collection }: { collection: CollectionListItem }) {
	const posterImages = collection.posterImages;

	return (
		<article className="group min-w-0">
			<Link
				to="/collections/$id"
				params={{ id: collection.id }}
				aria-label={m.web_open_collection_aria({ name: collection.name })}
				className="cinema-surface hover:border-primary/60 focus-visible:ring-primary relative block overflow-hidden transition-[border-color,transform] hover:-translate-y-1 focus-visible:ring-2"
			>
				<AspectRatio ratio={16 / 9}>
					<CollectionPosterCollage posterImages={posterImages} className="transition-transform duration-500 group-hover:scale-[1.04]" />
					<div className="from-background/85 via-background/10 absolute inset-0 bg-linear-to-t to-transparent" />
					<div className="bg-background/25 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
						<span className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full">
							<Play className="ml-0.5 size-5 fill-current" />
						</span>
					</div>
					<div className="absolute right-3 bottom-3 left-3">
						<p className="line-clamp-1 text-lg font-bold tracking-tight">{collection.name}</p>
					</div>
				</AspectRatio>
			</Link>
			<div className="mt-3 flex items-center justify-between gap-3 px-1">
				<p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
					<Clapperboard className="text-primary size-3.5" /> {m.common_titles_count({ count: collection.metadataCount })}
				</p>
				<Link to="/collections/$id" params={{ id: collection.id }} className="text-primary hover:text-primary/75 text-xs transition-colors">
					{m.common_view()}
				</Link>
			</div>
		</article>
	);
}
