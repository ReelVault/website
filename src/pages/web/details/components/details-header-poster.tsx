import { Star } from "lucide-react";
import { SimpleAnimation } from "@/components/simple-animation";
import { ApiImage } from "@/components/ui/api-image";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { m } from "@/paraglide/messages";
import { formatRating } from "@/utils/format-utils";
import { DetailsUserRating } from "./details-user-rating";

interface RatingScore {
	source: string;
	url?: string | null;
	label?: string | null;
	value: number;
	maxValue: number;
	votes: number;
}

interface DetailsHeaderPosterProps {
	metadataId: string;
	title?: string | null;
	posterId?: string;
	posterUpdatedAt?: string | Date;
	rating: {
		avgScore?: number;
		scores: RatingScore[];
	};
}

export function DetailsHeaderPoster({ metadataId, title, posterId, posterUpdatedAt, rating }: DetailsHeaderPosterProps) {
	return (
		<SimpleAnimation direction="up" className="hidden space-y-4 lg:sticky lg:top-28 lg:block lg:w-1/3">
			<div className="group relative mx-auto max-w-sm lg:mx-0" style={{ viewTransitionName: `title-${metadataId}` }}>
				<div className="relative overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl">
					<div className="aspect-2/3">
						<ApiImage
							fileId={posterId}
							cacheKey={posterUpdatedAt}
							alt={title ?? "Poster"}
							width={384}
							aspectRatio={2 / 3}
							priority
							className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
						/>
					</div>

					<Badge size="lg" className="absolute bottom-3 left-3 border-border/60 bg-background/90 shadow-md">
						<Tooltip>
							<TooltipTrigger>
								<div className="flex items-center gap-1.5 font-bold">
									<Star className="size-4 fill-warning text-warning" />
									<span className="text-base text-foreground">{formatRating(rating.avgScore)}</span>
								</div>
							</TooltipTrigger>
							<TooltipContent className="flex flex-col items-start justify-center gap-0.5">
								{rating.scores.map((r) => (
									<span key={r.source} className="flex items-center gap-1">
										{r.url ? (
											<a
												href={r.url}
												target="_blank"
												rel="noopener noreferrer"
												className="underline decoration-dotted underline-offset-2 hover:text-foreground"
											>
												{r.label ?? r.source.toUpperCase()}
											</a>
										) : (
											<span>{r.label ?? r.source.toUpperCase()}</span>
										)}
										<span>
											{m.web_rating_source_score({ value: formatRating(r.value), max: r.maxValue })}
											{r.votes > 0 ? ` (${r.votes})` : ""}
										</span>
									</span>
								))}
							</TooltipContent>
						</Tooltip>
					</Badge>
				</div>
			</div>
			<div className="flex w-full items-center justify-center">
				<DetailsUserRating metadataId={metadataId} />
			</div>
		</SimpleAnimation>
	);
}
