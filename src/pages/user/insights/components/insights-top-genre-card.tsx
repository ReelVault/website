import { cn } from "cn";
import { Film } from "lucide-react";
import { m } from "@/paraglide/messages";

interface InsightsTopGenreCardProps {
	topGenre: { name: string; match: number };
}

export function InsightsTopGenreCard({ topGenre }: InsightsTopGenreCardProps) {
	return (
		<div className="border-border/70 bg-card/65 col-span-1 row-span-2 flex flex-col justify-between rounded-2xl border p-6 md:col-span-2 lg:col-span-4">
			<div className="flex items-center justify-between">
				<div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
					<Film className="size-5" />
				</div>
				<span className="text-muted-foreground text-xs font-black">{m.user_main_genre()}</span>
			</div>
			<div className="flex flex-col gap-4">
				<h3 className="text-foreground text-4xl font-black tracking-tighter wrap-break-word sm:text-6xl">{topGenre.name}</h3>
				<div className="flex flex-col gap-2">
					<div className="text-muted-foreground flex justify-between text-xs font-black">
						<span>{m.user_match_profile()}</span>
						<span className="text-primary">{m.common_percent_value({ value: topGenre.match })}</span>
					</div>
					<div className="bg-muted h-2 w-full overflow-hidden rounded-full">
						<div className="bg-primary h-full" style={{ width: `${topGenre.match}%` }} />
					</div>
				</div>
			</div>
			<div className="flex flex-wrap gap-2">
				{[topGenre.name].map((genre) => (
					<span
						key={genre}
						className={cn(
							"rounded-full px-3 py-1 text-xs font-black",
							genre === topGenre.name ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
						)}
					>
						{genre}
					</span>
				))}
			</div>
		</div>
	);
}
