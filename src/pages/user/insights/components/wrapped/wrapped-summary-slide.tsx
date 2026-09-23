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
		<div className="fade-in zoom-in-95 flex animate-in flex-col items-center justify-center space-y-6 py-2 duration-300">
			<div className="w-full max-w-lg rounded-3xl border border-primary/50 bg-linear-to-b from-card via-background to-card p-8 shadow-2xl">
				<div className="flex items-center justify-between border-border/60 border-b pb-4">
					<div className="flex items-center gap-2.5">
						<Clapperboard className="size-6 text-primary" />
						<span className="font-black text-base tracking-tight">{m.user_wrapped_title({ year })}</span>
					</div>
					<span className="text-3xl">{data.viewerPersonality.badge}</span>
				</div>

				<div className="my-6 space-y-3 text-center">
					<h4 className="font-black text-2xl text-primary sm:text-3xl">{personalityTitle}</h4>
					<p className="font-black font-mono text-4xl text-foreground">{m.user_total_days_watched({ totalDays: data.totalDays })}</p>
					<p className="font-semibold text-muted-foreground text-sm">
						{m.wrapped_titles_and_sessions({
							titles: data.titlesWatched,
							sessions: data.moviesWatchedCount + data.episodesWatchedCount,
						})}
					</p>
				</div>

				<div className="space-y-2 border-border/40 border-t pt-4 text-xs">
					{data.topMovie && (
						<div className="flex items-center justify-between py-1">
							<span className="font-medium text-muted-foreground">{m.user_wrapped_top_movie()}</span>
							<span className="font-bold text-foreground">{data.topMovie.title}</span>
						</div>
					)}
					{data.topShow && (
						<div className="flex items-center justify-between py-1">
							<span className="font-medium text-muted-foreground">{m.user_wrapped_top_series()}</span>
							<span className="font-bold text-foreground">{data.topShow.title}</span>
						</div>
					)}
				</div>
			</div>

			<Button
				type="button"
				variant="outline"
				size="default"
				onClick={onCopySummary}
				className="gap-2 font-semibold text-xs transition-[border-color,background-color,color,box-shadow] hover:scale-105"
			>
				<Share2 className="size-4" />
				{m.user_copy_wrapped()}
			</Button>
		</div>
	);
}
