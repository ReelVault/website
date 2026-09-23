import { Star } from "lucide-react";
import { m } from "@/paraglide/messages";
import { formatRating } from "@/utils/format-utils";
import { type CollectionMetadataItem, CollectionTimelineItem } from "../components/collection-timeline-item";

interface CollectionTimelineProps {
	items: CollectionMetadataItem[];
}

export function CollectionTimeline({ items }: CollectionTimelineProps) {
	let ratingSum = 0;
	for (const item of items) {
		ratingSum += item.rating.avgScore;
	}

	const averageRating = items.length > 0 ? ratingSum / items.length : null;

	return (
		<main className="cinema-shell py-16 lg:py-24">
			<div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
				<div>
					<div className="cinema-section-heading">
						<h2>{m.web_watch_queue()}</h2>
						<p>{m.web_collection_order_note()}</p>
					</div>
				</div>
				<div className="flex gap-6 text-sm">
					<div>
						<p className="text-muted-foreground text-xs uppercase tracking-wider">{m.web_average()}</p>
						<p className="mt-1 flex items-center gap-1 font-bold text-lg text-primary">
							{averageRating == null ? "b/d" : formatRating(averageRating)}{" "}
							{averageRating != null && <Star className="size-3.5 fill-current" aria-hidden="true" />}
						</p>
					</div>
				</div>
			</div>

			{items.length > 0 ? (
				<div className="space-y-12">
					{items.map((movie, index) => (
						<CollectionTimelineItem key={movie.id} movie={movie} index={index} />
					))}
				</div>
			) : (
				<div className="rounded-2xl border border-border p-10 text-center text-muted-foreground">{m.web_collection_no_titles()}</div>
			)}
		</main>
	);
}
