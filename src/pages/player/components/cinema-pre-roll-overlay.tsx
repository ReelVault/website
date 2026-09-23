import { cn } from "cn";
import { useEffect, useState } from "react";
import type { PluginPreRollEntry } from "@/client/hooks/use-plugin-ui";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { EMBED_ALLOW, embedReferrerPolicy, embedSandbox } from "@/plugin-host/embed-policy";

/** Hard cap per trailer — covers most trailers without any YouTube API wiring. */
const TRAILER_MAX_MS = 120_000;

interface CinemaPreRollOverlayProps {
	entries: PluginPreRollEntry[];
	/** Title of the feature the trailers lead into ("Coming up: …"). */
	featureTitle?: string | undefined;
	onDone: () => void;
}

/**
 * Full-screen cinema pre-roll: plays the plugin-supplied trailers sequentially
 * in youtube-nocookie embeds with skip/next controls, then hands over to the
 * player. Mirrors the plugin-host schema embed (same sandbox/attrs) — notably
 * WITHOUT `enablejsapi`, which throws inside a sandboxed iframe. Autoplay
 * starts muted (always permitted); unmuting remounts the embed with sound,
 * riding on the button click's user activation.
 */
export function CinemaPreRollOverlay({ entries, featureTitle, onDone }: CinemaPreRollOverlayProps) {
	const [index, setIndex] = useState(0);
	const [isMuted, setIsMuted] = useState(true);
	const current = entries[index];
	const currentSrc = current
		? `https://www.youtube-nocookie.com/embed/${current.key}?autoplay=1&${isMuted ? "mute=1&" : ""}rel=0&modestbranding=1`
		: "";

	// Auto-advance when the embed ends silently (no YouTube API in the page) —
	// the cap is the fallback; "Next"/"Skip" stay the primary controls.
	useEffect(() => {
		const timer = window.setTimeout(() => {
			if (!current) return;

			if (index + 1 >= entries.length) onDone();
			else setIndex((previous) => previous + 1);
		}, TRAILER_MAX_MS);

		return () => window.clearTimeout(timer);
	}, [current, entries.length, index, onDone]);

	// Block the underlying app from scrolling while the overlay owns the screen.
	useEffect(() => {
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previous;
		};
	}, []);

	const advance = () => {
		if (index + 1 >= entries.length) onDone();
		else setIndex(index + 1);
	};

	return (
		<div className="fixed inset-0 z-100 flex flex-col bg-black text-white">
			<div className="relative flex-1">
				{current && (
					<iframe
						// Remounting on mute toggle restarts the trailer with/without sound.
						key={`${current.key}-${isMuted}`}
						title={`${current.title} — ${m.player_cinema_trailers_label()}`}
						className="absolute inset-0 size-full"
						src={currentSrc}
						allow={EMBED_ALLOW}
						sandbox={embedSandbox(currentSrc)}
						referrerPolicy={embedReferrerPolicy(currentSrc)}
						loading="lazy"
						tabIndex={-1}
					/>
				)}
				<div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent" />
			</div>

			<div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
				<div className="flex items-end justify-between gap-4">
					<div className="flex flex-col gap-1">
						<span className="font-bold text-[10px] text-white/60 uppercase tracking-widest">{m.player_cinema_trailers_label()}</span>
						{current && <span className="font-semibold text-lg leading-tight">{current.title}</span>}
						{featureTitle && <span className="text-sm text-white/70">{m.player_cinema_up_next({ title: featureTitle })}</span>}
					</div>
					<div className="pointer-events-auto flex items-center gap-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="text-white hover:bg-white/10 hover:text-white"
							onClick={() => setIsMuted(false)}
							disabled={!isMuted}
						>
							{m.player_cinema_unmute()}
						</Button>
						<Button type="button" variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white" onClick={advance}>
							{index + 1 >= entries.length ? m.player_cinema_skip_all() : m.player_cinema_next_trailer()}
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="border-white/30 text-white hover:bg-white/10 hover:text-white"
							onClick={onDone}
						>
							{m.player_cinema_skip_all()}
						</Button>
					</div>
				</div>
				<div className="flex items-center gap-1.5" aria-hidden="true">
					{entries.map((entry, dotIndex) => (
						<button
							key={entry.key}
							type="button"
							tabIndex={-1}
							aria-label={entry.title}
							className={cn("h-1 rounded-full transition-all", dotIndex === index ? "w-8 bg-primary" : "w-4 bg-white/30 hover:bg-white/50")}
							onClick={() => setIndex(dotIndex)}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
