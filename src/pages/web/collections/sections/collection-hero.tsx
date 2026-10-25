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
		<section className="border-border relative min-h-[46svh] border-b lg:min-h-[70vh]">
			<div className="bg-card absolute inset-0 overflow-hidden">
				<CollectionPosterCollage posterImages={posterImages} className="grayscale" />
				<div className="from-background via-background/65 to-background/10 absolute inset-0 bg-linear-to-t" />
				<div className="from-background via-background/40 absolute inset-0 bg-linear-to-r to-transparent" />
			</div>
			<div className="cinema-shell relative flex min-h-[46svh] flex-col justify-end py-10 lg:min-h-[70vh] lg:py-16">
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
