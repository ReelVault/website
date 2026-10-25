import type { WrappedInsights } from "@reelvault/sdk";
import { Clock, Film, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";

interface WrappedPersonalitySlideProps {
	data: WrappedInsights;
	personalityTitle: string;
	personalityDescription: string;
}

export function WrappedPersonalitySlide({ data, personalityTitle, personalityDescription }: WrappedPersonalitySlideProps) {
	return (
		<div className="fade-in zoom-in-95 animate-in flex flex-col items-center justify-center space-y-8 py-2 text-center duration-300">
			<div className="relative">
				<div className="via-primary/30 absolute -inset-4 animate-pulse rounded-full bg-linear-to-r from-amber-500/30 to-purple-500/30 opacity-70 blur-xl" />
				<div className="from-card via-background to-card relative flex size-28 items-center justify-center rounded-3xl border border-white/20 bg-linear-to-tr text-6xl shadow-2xl sm:size-32">
					{data.viewerPersonality.badge}
				</div>
			</div>

			<div className="space-y-2">
				<Badge weight="bold" variant="warning">
					{m.user_viewer_personality()}
				</Badge>
				<h2 className="text-foreground text-3xl font-black tracking-tight sm:text-5xl">{personalityTitle}</h2>
				<p className="text-muted-foreground mx-auto max-w-xl text-sm leading-relaxed font-medium sm:text-base">{personalityDescription}</p>
			</div>

			<div className="grid w-full grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
				<div className="border-border/70 bg-card/60 flex flex-col items-center justify-center rounded-2xl border p-5 shadow-sm">
					<Clock className="text-primary mb-2 size-6" />
					<p className="text-muted-foreground text-xs font-bold">{m.user_total_time()}</p>
					<p className="text-primary mt-1 font-mono text-3xl font-black">{m.user_total_days({ count: data.totalDays })}</p>
					<p className="text-muted-foreground font-mono text-xs">{m.user_total_watch_minutes({ count: data.totalMinutes })}</p>
				</div>

				<div className="border-border/70 bg-card/60 flex flex-col items-center justify-center rounded-2xl border p-5 shadow-sm">
					<Film className="text-foreground mb-2 size-6" />
					<p className="text-muted-foreground text-xs font-bold">{m.components_search_titles_heading()}</p>
					<p className="text-foreground mt-1 font-mono text-3xl font-black">{data.titlesWatched}</p>
					<p className="text-muted-foreground text-xs">{m.user_different_items()}</p>
				</div>

				<div className="border-border/70 bg-card/60 flex flex-col items-center justify-center rounded-2xl border p-5 shadow-sm">
					<Play className="mb-2 size-6 fill-current text-emerald-400" />
					<p className="text-muted-foreground text-xs font-bold">{m.user_total_plays()}</p>
					<p className="mt-1 font-mono text-3xl font-black text-emerald-400">{data.moviesWatchedCount + data.episodesWatchedCount}</p>
					<p className="text-muted-foreground text-xs">{m.user_sessions_total()}</p>
				</div>
			</div>
		</div>
	);
}
