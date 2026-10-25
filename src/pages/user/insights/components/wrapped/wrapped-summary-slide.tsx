import type { WrappedInsights } from "@reelvault/sdk";
import { Clapperboard, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface WrappedSummarySlideProps {
	data: WrappedInsights;
	year: number;
	personalityTitle: string;
	onCopySummary: () => void;
}

export function WrappedSummarySlide({ data, year, personalityTitle, onCopySummary }: WrappedSummarySlideProps) {
	return (
		<div className="fade-in zoom-in-95 animate-in flex flex-col items-center justify-center space-y-6 py-2 duration-300">
			<div className="border-primary/50 from-card via-background to-card w-full max-w-lg rounded-3xl border bg-linear-to-b p-8 shadow-2xl">
				<div className="border-border/60 flex items-center justify-between border-b pb-4">
					<div className="flex items-center gap-2.5">
						<Clapperboard className="text-primary size-6" />
						<span className="text-base font-black tracking-tight">{m.user_wrapped_title({ year })}</span>
					</div>
					<span className="text-3xl">{data.viewerPersonality.badge}</span>
				</div>

				<div className="my-6 space-y-3 text-center">
					<h4 className="text-primary text-2xl font-black sm:text-3xl">{personalityTitle}</h4>
					<p className="text-foreground font-mono text-4xl font-black">{m.user_total_days_watched({ totalDays: data.totalDays })}</p>
					<p className="text-muted-foreground text-sm font-semibold">
						{m.wrapped_titles_and_sessions({
							titles: data.titlesWatched,
							sessions: data.moviesWatchedCount + data.episodesWatchedCount,
						})}
					</p>
				</div>

				<div className="border-border/40 space-y-2 border-t pt-4 text-xs">
					{data.topMovie && (
						<div className="flex items-center justify-between py-1">
							<span className="text-muted-foreground font-medium">{m.user_wrapped_top_movie()}</span>
							<span className="text-foreground font-bold">{data.topMovie.title}</span>
						</div>
					)}
					{data.topShow && (
						<div className="flex items-center justify-between py-1">
							<span className="text-muted-foreground font-medium">{m.user_wrapped_top_series()}</span>
							<span className="text-foreground font-bold">{data.topShow.title}</span>
						</div>
					)}
				</div>
			</div>

			<Button type="button" variant="outline" size="default" onClick={onCopySummary}>
				<Share2 className="size-4" />
				{m.user_copy_wrapped()}
			</Button>
		</div>
	);
}
