import { Link } from "@tanstack/react-router";
import { Calendar, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";
import { genresIcons } from "@/utils/genres-icons";
import { DetailsMultipleFilesBadge } from "./details-multiple-files-badge";

interface DetailsHeaderDesktopTitleProps {
	title: string;
	originalTitle?: string | null;
	year?: string | number | null;
	genres?: Array<{ id: string; name: string }> | null;
	metadataId: string;
}

export function DetailsHeaderDesktopTitle({ title, originalTitle, year, genres, metadataId }: DetailsHeaderDesktopTitleProps) {
	return (
		<div className="mb-6 hidden lg:block">
			<div className="cinema-kicker mb-2">{m.web_title_details()}</div>

			<h1 className="text-foreground text-4xl font-black tracking-tight text-balance sm:text-5xl lg:text-6xl">{title}</h1>

			{originalTitle && originalTitle.trim() !== "" && originalTitle.toLowerCase() !== title.toLowerCase() && (
				<p className="text-muted-foreground/80 mt-1 mb-3 text-base font-medium italic sm:text-lg">{originalTitle}</p>
			)}

			<div className="mt-4 flex flex-wrap items-center gap-2">
				{year && year !== "N/A" && (
					<Badge key={year} size="lg" variant="outline">
						<Calendar className="text-secondary size-3.5" />
						{year}
					</Badge>
				)}
				{genres?.map((genre) => {
					const GenreIcon = genresIcons[genre.name] ?? Flame;

					return (
						<Badge key={genre.id} size="lg" variant="outline" render={<Link to="/genres/$id" params={{ id: genre.id }} />}>
							<GenreIcon className="text-primary size-3.5" />
							{genre.name}
						</Badge>
					);
				})}
				<DetailsMultipleFilesBadge metadataId={metadataId} />
			</div>
		</div>
	);
}
