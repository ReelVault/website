import { cn } from "cn";
import { Film } from "lucide-react";
import { m } from "@/paraglide/messages";

interface InsightsTopGenreCardProps {
	topGenre: { name: string; match: number };
}

export function InsightsTopGenreCard({ topGenre }: InsightsTopGenreCardProps) {
	return (
		<div className="col-span-1 row-span-2 flex flex-col justify-between rounded-2xl border border-border/70 bg-card/65 p-6 md:col-span-2 lg:col-span-4">
			<div className="flex items-center justify-between">
				<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
					<Film className="size-5" />
				</div>
				<span className="font-black text-[10px] text-muted-foreground uppercase tracking-widest">{m.user_main_genre()}</span>
			</div>
			<div className="flex flex-col gap-4">
				<h3 className="wrap-break-word font-black text-4xl text-foreground tracking-tighter sm:text-6xl">{topGenre.name}</h3>
				<div className="flex flex-col gap-2">
					<div className="flex justify-between font-black text-[9px] text-muted-foreground uppercase tracking-widest">
						<span>{m.user_match_profile()}</span>
						<span className="text-primary">{m.common_percent_value({ value: topGenre.match })}</span>
					</div>
					<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
						<div className="h-full bg-primary" style={{ width: `${topGenre.match}%` }} />
					</div>
				</div>
			</div>
			<div className="flex flex-wrap gap-2">
				{[topGenre.name].map((genre) => (
					<span
						key={genre}
						className={cn(
							"rounded-full px-3 py-1 font-black text-[8px] uppercase",
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
