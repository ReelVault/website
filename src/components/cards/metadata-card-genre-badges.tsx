import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { getGenreIconByName } from "@/utils/genres-icons";

interface GenreItem {
	id: string;
	name: string;
}

interface MetadataCardGenreBadgesProps {
	genres: GenreItem[];
}

export function MetadataCardGenreBadges({ genres }: MetadataCardGenreBadgesProps) {
	if (genres.length === 0) return null;

	return (
		<div className="pointer-events-none absolute top-3 right-3 z-30 flex flex-col items-end gap-2">
			{genres.slice(0, 3).map((genre) => {
				const Icon = getGenreIconByName(genre.name);

				return (
					<Link
						key={genre.id}
						to="/genres/$id"
						params={{ id: genre.id }}
						className={cn(
							"pointer-events-auto flex h-8 min-w-8 items-center overflow-hidden",
							"rounded-lg border border-border/70 bg-background/80",
							"transition-[background-color,padding] duration-200 ease-out hover:bg-background/90 group-hover:px-2",
							"w-fit",
						)}
					>
						<div className="flex h-8 w-8 shrink-0 items-center justify-center">
							<Icon className="size-4 text-primary" />
						</div>
						<span className="grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity,margin] duration-200 group-focus-within:ml-1 group-focus-within:grid-cols-[1fr] group-focus-within:opacity-100 group-hover:ml-1 group-hover:grid-cols-[1fr] group-hover:opacity-100">
							<span className="overflow-hidden whitespace-nowrap font-bold text-[10px] text-foreground uppercase tracking-wider">
								{genre.name}
							</span>
						</span>
					</Link>
				);
			})}
		</div>
	);
}
