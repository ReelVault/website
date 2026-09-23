import { ChevronLeft, ChevronRight, Film, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useWrappedInsights } from "@/client/hooks/use-insights";
import { AppErrorState } from "@/components/app-states";
import {
	FullscreenDialogContent,
	FullscreenDialogDescription,
	FullscreenDialogHeader,
	FullscreenDialogTitle,
} from "@/components/fullscreen-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { copyToClipboard } from "@/utils/clipboard-utils";
import { TOTAL_SLIDES } from "./wrapped/wrapped-constants";
import { WrappedGenresActorsSlide } from "./wrapped/wrapped-genres-actors-slide";
import { WrappedHabitsSlide } from "./wrapped/wrapped-habits-slide";
import { WrappedPersonalitySlide } from "./wrapped/wrapped-personality-slide";
import { WrappedProgressBar } from "./wrapped/wrapped-progress-bar";
import { WrappedSummarySlide } from "./wrapped/wrapped-summary-slide";
import { WrappedTopMediaSlide } from "./wrapped/wrapped-top-media-slide";

// Module-level render prop keeps its identity stable across renders.
const renderKeyboardKey = (chunks: string) => <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">{chunks}</kbd>;

/**
 * Static map of the server's viewer personality codes (watched-history
 * service) to their messages. Keys are hardcoded — no message key may be
 * constructed dynamically, so the unused-key script can always verify usage
 * statically.
 */
const PERSONALITY_MESSAGES: Record<string, { description: () => string; title: () => string } | undefined> = {
	adrenaline_hunter: {
		description: m.wrapped_personality_adrenaline_hunter_description,
		title: m.wrapped_personality_adrenaline_hunter_title,
	},
	binge_watcher: { description: m.wrapped_personality_binge_watcher_description, title: m.wrapped_personality_binge_watcher_title },
	cinephile: { description: m.wrapped_personality_cinephile_description, title: m.wrapped_personality_cinephile_title },
	comedy_enthusiast: {
		description: m.wrapped_personality_comedy_enthusiast_description,
		title: m.wrapped_personality_comedy_enthusiast_title,
	},
	curious_viewer: { description: m.wrapped_personality_curious_viewer_description, title: m.wrapped_personality_curious_viewer_title },
	mystery_connoisseur: {
		description: m.wrapped_personality_mystery_connoisseur_description,
		title: m.wrapped_personality_mystery_connoisseur_title,
	},
	sci_fi_explorer: { description: m.wrapped_personality_sci_fi_explorer_description, title: m.wrapped_personality_sci_fi_explorer_title },
};

/** Heavy Wrapped content — lazy-loaded only when the modal first opens. */
export function InsightsWrappedContent({ year, resolvedYear }: { year?: number; resolvedYear: number }) {
	const [slideIndex, setSlideIndex] = useState(0);
	const wrappedQuery = useWrappedInsights(resolvedYear);

	const data = wrappedQuery.data;
	const personalityMessages = data ? PERSONALITY_MESSAGES[data.viewerPersonality.code] : undefined;
	const personalityTitle = personalityMessages?.title() ?? "";
	const personalityDescription = personalityMessages?.description() ?? "";

	const handleNext = () => {
		setSlideIndex((prev) => (prev < TOTAL_SLIDES - 1 ? prev + 1 : prev));
	};

	const handlePrev = () => {
		setSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
	};

	// Keyboard controls (ArrowLeft / ArrowRight)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight" || e.key === " ") {
				e.preventDefault();
				setSlideIndex((prev) => (prev < TOTAL_SLIDES - 1 ? prev + 1 : prev));
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				setSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const copySummary = async () => {
		if (!data) return;

		const text = m.user_wrapped_share_text({
			year: data.year,
			totalDays: data.totalDays,
			totalMinutes: data.totalMinutes,
			titlesWatched: data.titlesWatched,
			topMovie: data.topMovie?.title ?? "—",
			topShow: data.topShow?.title ?? "—",
			personalityTitle,
			badge: data.viewerPersonality.badge,
		});
		await copyToClipboard(text, m.user_wrapped_summary_label());
	};

	const handleCopySummary = () => {
		detach(copySummary());
	};

	const renderSlideArea = () => {
		if (wrappedQuery.isLoading) {
			return (
				<div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
					<Sparkles className="size-12 animate-spin text-primary" />
					<p className="font-semibold text-base">{m.user_generating_yearly_summary()}</p>
				</div>
			);
		}

		if (wrappedQuery.isError) {
			return <AppErrorState error={wrappedQuery.error} onRetry={() => detach(wrappedQuery.refetch())} />;
		}

		if (!data || data.totalMinutes === 0) {
			return (
				<div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground">
					<Film className="size-16 opacity-30" />
					<h3 className="font-bold text-foreground text-xl">{m.user_no_activity_in_year({ year: resolvedYear })}</h3>
					<p className="max-w-md text-sm">{m.user_watch_to_unlock()}</p>
				</div>
			);
		}

		return (
			<div className="w-full max-w-3xl">
				{slideIndex === 0 && (
					<WrappedPersonalitySlide data={data} personalityTitle={personalityTitle} personalityDescription={personalityDescription} />
				)}

				{slideIndex === 1 && <WrappedTopMediaSlide data={data} />}

				{slideIndex === 2 && <WrappedGenresActorsSlide data={data} />}

				{slideIndex === 3 && <WrappedHabitsSlide data={data} />}

				{slideIndex === 4 && (
					<WrappedSummarySlide data={data} year={resolvedYear} personalityTitle={personalityTitle} onCopySummary={handleCopySummary} />
				)}
			</div>
		);
	};

	return (
		<FullscreenDialogContent className="flex h-[88vh] max-h-205 w-[95vw] max-w-4xl flex-col gap-0 overflow-hidden rounded-3xl border border-border/80 bg-background p-0 shadow-2xl lg:max-w-5xl">
			{/* Top Story-style Progress Bars */}
			<WrappedProgressBar slideIndex={slideIndex} onSelectSlide={setSlideIndex} />

			{/* Header Info */}
			<FullscreenDialogHeader className="relative z-20 flex flex-row items-center justify-between px-8 py-3">
				<div className="flex items-center gap-3">
					<div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
						<Trophy className="size-5" />
					</div>
					<div>
						<FullscreenDialogTitle className="font-black text-foreground text-lg tracking-tight">
							{m.common_brand_name()} <span className="text-primary">{m.wrapped_title_year({ year: year ?? resolvedYear })}</span>
						</FullscreenDialogTitle>
						<FullscreenDialogDescription className="text-muted-foreground text-xs">
							{m.user_yearly_summary_desc()}
						</FullscreenDialogDescription>
					</div>
				</div>

				<div className="flex items-center gap-3 pr-8">
					<Badge variant="outline" className="font-mono text-xs">
						{m.common_page_indicator({ current: slideIndex + 1, total: TOTAL_SLIDES })}
					</Badge>
				</div>
			</FullscreenDialogHeader>

			{/* Slide Main Canvas */}
			<div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-6 sm:px-12">
				{renderSlideArea()}
			</div>

			{/* Bottom Navigation Controls */}
			<div className="relative z-20 flex items-center justify-between border-border/60 border-t bg-card/60 px-8 py-4">
				<Button
					type="button"
					variant="ghost"
					size="default"
					onClick={handlePrev}
					disabled={slideIndex === 0}
					className="cursor-pointer gap-2 font-semibold text-xs"
				>
					<ChevronLeft className="size-4" />
					{m.components_simple_pagination_previous()}
				</Button>

				<div className="hidden text-muted-foreground text-xs sm:block">
					{m.user_insights_navigation_arrows_hint({
						left: renderKeyboardKey,
						right: renderKeyboardKey,
					})}
				</div>

				<Button
					type="button"
					variant="default"
					size="default"
					onClick={handleNext}
					disabled={slideIndex === TOTAL_SLIDES - 1}
					className="cursor-pointer gap-2 font-semibold text-xs"
				>
					{m.components_simple_pagination_next()}
					<ChevronRight className="size-4" />
				</Button>
			</div>
		</FullscreenDialogContent>
	);
}
