import { Clock, Film, Play } from "lucide-react";
import type { WrappedInsights } from "reelvault-sdk";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";

interface WrappedPersonalitySlideProps {
	data: WrappedInsights;
	personalityTitle: string;
	personalityDescription: string;
}

export function WrappedPersonalitySlide({ data, personalityTitle, personalityDescription }: WrappedPersonalitySlideProps) {
	return (
		<div className="fade-in zoom-in-95 flex animate-in flex-col items-center justify-center space-y-8 py-2 text-center duration-300">
			<div className="relative">
				<div className="absolute -inset-4 animate-pulse rounded-full bg-linear-to-r from-amber-500/30 via-primary/30 to-purple-500/30 opacity-70 blur-xl" />
				<div className="relative flex size-28 items-center justify-center rounded-3xl border border-white/20 bg-linear-to-tr from-card via-background to-card text-6xl shadow-2xl sm:size-32">
					{data.viewerPersonality.badge}
				</div>
			</div>

			<div className="space-y-2">
				<Badge className="border-amber-500/50 bg-amber-500/20 px-3 py-1 font-bold text-amber-300 text-xs uppercase tracking-wider">
					{m.user_viewer_personality()}
				</Badge>
				<h2 className="font-black text-3xl text-foreground tracking-tight sm:text-5xl">{personalityTitle}</h2>
				<p className="mx-auto max-w-xl font-medium text-muted-foreground text-sm leading-relaxed sm:text-base">{personalityDescription}</p>
			</div>

			<div className="grid w-full grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
				<div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm">
					<Clock className="mb-2 size-6 text-primary" />
					<p className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">{m.user_total_time()}</p>
					<p className="mt-1 font-black font-mono text-3xl text-primary">{m.user_total_days({ count: data.totalDays })}</p>
					<p className="font-mono text-muted-foreground text-xs">{m.user_total_watch_minutes({ count: data.totalMinutes })}</p>
				</div>

				<div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm">
					<Film className="mb-2 size-6 text-foreground" />
					<p className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">{m.components_search_titles_heading()}</p>
					<p className="mt-1 font-black font-mono text-3xl text-foreground">{data.titlesWatched}</p>
					<p className="text-muted-foreground text-xs">{m.user_different_items()}</p>
				</div>

				<div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm">
					<Play className="mb-2 size-6 fill-current text-emerald-400" />
					<p className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">{m.user_total_plays()}</p>
					<p className="mt-1 font-black font-mono text-3xl text-emerald-400">{data.moviesWatchedCount + data.episodesWatchedCount}</p>
					<p className="text-muted-foreground text-xs">{m.user_sessions_total()}</p>
				</div>
			</div>
		</div>
	);
}
