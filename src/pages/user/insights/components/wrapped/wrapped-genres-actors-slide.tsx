import type { WrappedInsights } from "@reelvault/sdk";
import { Clapperboard, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";

interface WrappedGenresActorsSlideProps {
	data: WrappedInsights;
}

export function WrappedGenresActorsSlide({ data }: WrappedGenresActorsSlideProps) {
	return (
		<div className="fade-in zoom-in-95 animate-in space-y-6 py-2 duration-300">
			<div className="text-center">
				<Badge
					variant="outline"
					className="mb-2 border-primary/50 bg-primary/10 px-3 py-1 font-bold text-primary text-xs uppercase tracking-wider"
				>
					{m.user_prefs_and_stars()}
				</Badge>
				<h3 className="font-black text-2xl text-foreground sm:text-4xl">{m.user_genres_and_actors()}</h3>
				<p className="mt-1 text-muted-foreground text-sm">{m.user_who_and_vibes()}</p>
			</div>

			<div className="grid grid-cols-1 gap-6 pt-2 sm:grid-cols-2">
				<div className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm">
					<div className="mb-4 flex items-center justify-between">
						<p className="font-bold text-muted-foreground text-xs uppercase tracking-wider">{m.admin_top_movie_genres()}</p>
						<Clapperboard className="size-4 text-primary" />
					</div>
					<div className="space-y-3">
						{data.topGenres.slice(0, 4).map((g, i) => (
							<div key={g.name} className="space-y-1">
								<div className="flex items-center justify-between font-semibold text-xs">
									<div className="flex items-center gap-2">
										<span className="font-mono text-primary">{m.common_rank_number({ index: i + 1 })}</span>
										<span>{g.name}</span>
									</div>
									<span className="font-bold text-primary">{m.common_percent_value({ value: g.percentage })}</span>
								</div>
								<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
									<div className="h-full rounded-full bg-primary" style={{ width: `${g.percentage}%` }} />
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm">
					<div className="mb-4 flex items-center justify-between">
						<p className="font-bold text-muted-foreground text-xs uppercase tracking-wider">{m.user_most_on_screen()}</p>
						<User className="size-4 text-amber-400" />
					</div>
					<div className="space-y-3.5">
						{data.topActors.slice(0, 4).map((a, i) => (
							<div key={a.name} className="flex items-center justify-between text-xs">
								<div className="flex items-center gap-2 font-semibold">
									<span className="font-mono text-amber-400">{m.common_rank_number({ index: i + 1 })}</span>
									<span>{a.name}</span>
								</div>
								<span className="font-bold font-mono text-muted-foreground">
									{m.common_duration_hours_minutes({ hours: Math.floor(a.minutes / 60), minutes: a.minutes % 60 })}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
