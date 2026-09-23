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

			<h1 className="text-balance font-black text-4xl text-foreground tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>

			{originalTitle && originalTitle.trim() !== "" && originalTitle.toLowerCase() !== title.toLowerCase() && (
				<p className="mt-1 mb-3 font-medium text-base text-muted-foreground/80 italic sm:text-lg">{originalTitle}</p>
			)}

			<div className="mt-4 flex flex-wrap items-center gap-2">
				{year && year !== "N/A" && (
					<Badge key={year} size="lg" variant="outline" className="gap-2 text-foreground">
						<Calendar className="size-3.5 text-secondary" />
						{year}
					</Badge>
				)}
				{genres?.map((genre) => {
					const GenreIcon = genresIcons[genre.name] ?? Flame;

					return (
						<Badge
							key={genre.id}
							size="lg"
							variant="outline"
							render={<Link to="/genres/$id" params={{ id: genre.id }} />}
							className="gap-2 text-foreground"
						>
							<GenreIcon className="size-3.5 text-primary" />
							{genre.name}
						</Badge>
					);
				})}
				<DetailsMultipleFilesBadge metadataId={metadataId} />
			</div>
		</div>
	);
}
