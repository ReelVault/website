import { Link } from "@tanstack/react-router";
import { Calendar, Flame, Star } from "lucide-react";
import { ApiImage } from "@/components/ui/api-image";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";
import { formatRating } from "@/utils/format-utils";
import { genresIcons } from "@/utils/genres-icons";

interface DetailsHeaderMobileProps {
	title: string;
	originalTitle?: string | null;
	posterId?: string;
	posterUpdatedAt?: string | Date;
	avgScore?: number;
	year?: string | number;
	genres?: Array<{ id: string; name: string }>;
}

export function DetailsHeaderMobile({ title, originalTitle, posterId, posterUpdatedAt, avgScore, year, genres }: DetailsHeaderMobileProps) {
	return (
		<div className="flex gap-4 lg:hidden">
			<div className="border-border/80 bg-card relative w-28 shrink-0 overflow-hidden rounded-xl border shadow-lg">
				<div className="aspect-2/3">
					<ApiImage
						fileId={posterId}
						cacheKey={posterUpdatedAt}
						alt={title || "Poster"}
						width={224}
						aspectRatio={2 / 3}
						priority
						sizes="112px"
						className="object-cover"
					/>
				</div>
				<Badge size="sm" className="absolute bottom-1.5 left-1.5">
					<Star className="fill-warning text-warning size-3" />
					<span className="text-foreground text-xs font-bold">{formatRating(avgScore)}</span>
				</Badge>
			</div>
			<div className="min-w-0 flex-1">
				<div className="cinema-kicker mb-2">{m.web_title_details()}</div>
				<h1 className="text-foreground text-3xl font-black tracking-tight text-balance">{title}</h1>
				{originalTitle && originalTitle.trim() !== "" && originalTitle.toLowerCase() !== title.toLowerCase() && (
					<p className="text-muted-foreground/80 mt-1 text-sm font-medium italic">{originalTitle}</p>
				)}
				<div className="mt-3 flex flex-wrap items-center gap-2">
					{year && year !== "N/A" && (
						<Badge key={`m-${year}`} size="lg" variant="outline">
							<Calendar className="text-secondary size-3.5" />
							{year}
						</Badge>
					)}
					{genres?.slice(0, 3).map((genre) => {
						const GenreIcon = genresIcons[genre.name] ?? Flame;

						return (
							<Badge key={`m-${genre.id}`} size="lg" variant="outline" render={<Link to="/genres/$id" params={{ id: genre.id }} />}>
								<GenreIcon className="text-primary size-3.5" />
								{genre.name}
							</Badge>
						);
					})}
				</div>
			</div>
		</div>
	);
}
