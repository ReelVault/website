import { Link } from "@tanstack/react-router";
import { ArrowLeft, CirclePlay, Layers } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { CollectionPosterCollage, type CollectionPosterImage } from "../components/collection-poster-collage";

interface CollectionHeroProps {
	collectionName: string;
	posterImages?: Array<CollectionPosterImage | null | undefined> | null;
	itemsCount: number;
	sortDescription: string;
	collectionId: string;
	playableMediaFileId?: string;
	firstItemId?: string;
}

export function CollectionHero({
	collectionName,
	posterImages,
	itemsCount,
	sortDescription,
	collectionId,
	playableMediaFileId,
	firstItemId,
}: CollectionHeroProps) {
	let primaryAction: ReactNode = null;
	if (playableMediaFileId) {
		primaryAction = (
			<Button
				nativeButton={false}
				render={
					<Link to="/player/$id" params={{ id: playableMediaFileId }} search={() => ({ collection: true, collectionId })}>
						<CirclePlay className="size-4" aria-hidden="true" /> {m.web_collections_play_all()}
					</Link>
				}
			>
				<CirclePlay className="size-4" aria-hidden="true" /> {m.web_collections_play_all()}
			</Button>
		);
	} else if (firstItemId) {
		primaryAction = (
			<Button nativeButton={false} render={<Link to="/details/$id" params={{ id: firstItemId }} />}>
				{m.web_collections_open_first()}
			</Button>
		);
	}

	return (
		<section className="relative min-h-[62vh] border-border border-b lg:min-h-[70vh]">
			<div className="absolute inset-0 overflow-hidden bg-card">
				<CollectionPosterCollage posterImages={posterImages} className="grayscale" />
				<div className="absolute inset-0 bg-linear-to-t from-background via-background/65 to-background/10" />
				<div className="absolute inset-0 bg-linear-to-r from-background via-background/40 to-transparent" />
			</div>
			<div className="cinema-shell relative flex min-h-[62vh] flex-col justify-end py-16 lg:min-h-[70vh]">
				<div className="max-w-3xl">
					<p className="cinema-kicker">
						<Layers className="size-4" aria-hidden="true" />{" "}
						{m.web_collections_kicker_count({
							kicker: m.web_collections_kicker(),
							count: m.common_titles_count({ count: itemsCount }),
						})}
					</p>
					<h1 className="cinema-title mt-5 max-w-4xl">{collectionName}</h1>
					<p className="cinema-copy mt-5">{sortDescription}</p>
					<div className="mt-8 flex flex-wrap gap-3">
						{primaryAction}
						<Button variant="outline" nativeButton={false} render={<Link to="/collections" />}>
							<ArrowLeft className="size-4" aria-hidden="true" /> {m.web_collections_all_collections()}
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
