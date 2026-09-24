import { Link } from "@tanstack/react-router";
import { Calendar, ChevronRight, Star } from "lucide-react";
import type { useMetadataCollection } from "@/client/hooks/use-metadata-queries";
import { MetadataCard } from "@/components/cards/metadata-card";
import { LazyRender } from "@/components/lazy-render";
import { SimpleAnimation } from "@/components/simple-animation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { m } from "@/paraglide/messages";
import { getYearFromDate } from "@/utils/date-utils";
import { formatRating } from "@/utils/format-utils";

export type CollectionMetadataItem = NonNullable<ReturnType<typeof useMetadataCollection>["data"]>["data"][number];

interface CollectionTimelineItemProps {
	movie: CollectionMetadataItem;
	index: number;
}

export function CollectionTimelineItem({ movie, index }: CollectionTimelineItemProps) {
	return (
		<LazyRender minHeight={320} rootMargin="350px 0px">
			{() => (
				<SimpleAnimation direction="up" delay={Math.min(index, 6) * 35}>
					<article className="grid gap-8 border-border/70 border-b pb-12 lg:grid-cols-[5rem_13rem_1fr] lg:gap-10">
						<div className="hidden pt-2 text-right lg:block">
							<p className="font-bold font-mono text-4xl text-muted-foreground/40">{String(index + 1).padStart(2, "0")}</p>
							<p className="mt-2 flex items-center justify-end gap-1 text-muted-foreground text-xs">
								<Calendar className="size-3.5" aria-hidden="true" /> {getYearFromDate(movie.releaseDate) || "b/d"}
							</p>
						</div>
						<div className="flex min-w-0 justify-center lg:justify-start">
							<MetadataCard metadata={movie} size="lg" fluid />
						</div>
						<div className="min-w-0 lg:pt-3">
							<div className="flex flex-wrap items-center gap-3 text-primary text-xs uppercase tracking-wider">
								<span className="lg:hidden">{String(index + 1).padStart(2, "0")}</span>
								<span>{movie.type === "movie" ? m.common_movie_word() : m.common_series_word()}</span>
								<Separator orientation="vertical" className="h-4" />
								<span>{getYearFromDate(movie.releaseDate) || m.web_year_unknown()}</span>
								<Badge variant="secondary" className="gap-1">
									<Star className="size-3 fill-current" aria-hidden="true" /> {formatRating(movie.rating.avgScore)}
								</Badge>
							</div>
							<h3 className="mt-4 text-balance font-black text-3xl tracking-tight sm:text-4xl">{movie.title}</h3>
							<p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
								{movie.overview != null && movie.overview !== "" ? movie.overview : m.web_description_unavailable()}
							</p>
							<Link
								to="/details/$id"
								params={{ id: movie.id }}
								className="mt-6 inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-primary"
							>
								{m.plugins_bug_reports_view_details()} <ChevronRight className="size-4" aria-hidden="true" />
							</Link>
						</div>
					</article>
				</SimpleAnimation>
			)}
		</LazyRender>
	);
}
