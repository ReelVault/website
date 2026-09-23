import { cn } from "cn";
import { useState } from "react";
import { m } from "@/paraglide/messages";
import { usePlayerTrickplay } from "../hooks/use-player-trickplay";
import { usePlayerActions, usePlayerInfo, usePlayerMarkers, usePlayerProgressRanges, usePlayerTime } from "../player-context";
import { detach, formatTime } from "../utils/player-utils";

const SEGMENT_COLORS: Record<string, { bg: string; title: string }> = {
	intro: {
		bg: "bg-[#00c5ff]",
		title: m.plugins_markers_intro_word(),
	},
	credits: {
		bg: "bg-[#818cf8]",
		title: m.plugins_markers_credits_word(),
	},
	recap: {
		bg: "bg-[#a855f7]",
		title: m.plugins_markers_recap_word(),
	},
	chapter: {
		bg: "bg-[#f1f5f9]",
		title: m.plugins_markers_chapter(),
	},
	highlight: {
		bg: "bg-[#f43f5e]",
		title: m.plugins_markers_highlight_word(),
	},
};

export function PlayerProgressBar() {
	const info = usePlayerInfo();
	const { duration, mediaFileId } = info;
	const { currentTime, finishTime } = usePlayerTime();
	const { seek } = usePlayerActions();
	const { markers } = usePlayerMarkers();
	// Trickplay artifacts + VTT are only fetched after the first pointer
	// interaction with the bar — they are useless until the user hovers/scrubs.
	const [wantsTrickplay, setWantsTrickplay] = useState(false);
	const { getThumbnailAt } = usePlayerTrickplay(mediaFileId, { enabled: wantsTrickplay });

	// Two layers: transcoded (server, darker — can span hours) under buffered
	// (what hls.js appended to video.buffered, brighter — right at the playhead)
	const { bufferedRanges, transcodedRanges } = usePlayerProgressRanges();

	const [isScrubbing, setIsScrubbing] = useState(false);
	const [scrubTime, setScrubTime] = useState(currentTime);
	const [isHovering, setIsHovering] = useState(false);
	const [hoverTime, setHoverTime] = useState<number | null>(null);
	const [hoverPercent, setHoverPercent] = useState<number | null>(null);

	const displayedTime = isScrubbing ? scrubTime : currentTime;
	const safeDuration = Math.max(duration, 0.001); // avoid div-by-zero
	const playedPercent = Math.min(100, Math.max(0, (displayedTime / safeDuration) * 100));

	const activeTooltipTime = isScrubbing ? scrubTime : hoverTime;
	const activeTooltipPercent = isScrubbing ? playedPercent : hoverPercent;
	const hoveredMarker =
		activeTooltipTime !== null
			? markers.find((segment) => activeTooltipTime >= segment.startSeconds && activeTooltipTime <= segment.endSeconds)
			: undefined;

	const trickplayFrame = activeTooltipTime !== null ? getThumbnailAt(activeTooltipTime) : { found: false };

	// Keep the controlled thumb on the playhead while not scrubbing — synced
	// during render (single commit per tick) instead of a follow-up effect.
	if (!isScrubbing && scrubTime !== currentTime) {
		setScrubTime(currentTime);
	}

	const commitSeek = () => {
		setIsScrubbing(false);
		detach(() => seek(scrubTime));
	};

	const updateHoverFromEvent = (clientX: number, currentTarget: HTMLElement) => {
		const rect = currentTarget.getBoundingClientRect();
		if (rect.width <= 0) return;

		const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		setHoverTime(ratio * safeDuration);
		setHoverPercent(ratio * 100);
	};

	const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
		setWantsTrickplay(true);
		setIsHovering(true);
		updateHoverFromEvent(event.clientX, event.currentTarget);
	};

	const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		updateHoverFromEvent(event.clientX, event.currentTarget);
	};

	const handlePointerLeave = () => {
		setIsHovering(false);
		setHoverTime(null);
		setHoverPercent(null);
	};

	return (
		<>
			<div className="flex w-full items-center justify-between">
				<div className="flex items-center gap-2 font-mono text-foreground/80 text-sm">
					<span>{formatTime(displayedTime)}</span>
					<span className="text-muted-foreground">{m.common_breadcrumb_separator()}</span>
					<span>{formatTime(duration)}</span>
				</div>
				<div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
					<span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">{m.player_finishing_at()}</span>
					<span className="font-bold font-mono text-primary text-sm">{finishTime}</span>
				</div>
			</div>

			<div
				className="group/track relative flex h-10 w-full cursor-pointer items-center"
				onPointerEnter={handlePointerEnter}
				onPointerMove={handlePointerMove}
				onPointerLeave={handlePointerLeave}
			>
				{/* Seek hover & scrubbing tooltip with Trickplay preview */}
				{(isHovering || isScrubbing) && activeTooltipTime !== null && activeTooltipPercent !== null && (
					<div
						className="pointer-events-none absolute bottom-8 z-40 flex -translate-x-1/2 select-none flex-col items-center gap-1 transition-[border-color,background-color,color,box-shadow] duration-75"
						style={{
							left: `clamp(${trickplayFrame.found ? "88px" : "36px"}, ${activeTooltipPercent}%, calc(100% - ${trickplayFrame.found ? "88px" : "36px"}))`,
						}}
					>
						{trickplayFrame.found && trickplayFrame.url ? (
							<div className="flex flex-col items-center gap-1.5 overflow-hidden rounded-xl border border-white/20 bg-black/95 p-1.5 shadow-2xl">
								<div
									className="relative overflow-hidden rounded-lg bg-black"
									style={{
										width: trickplayFrame.width ?? 160,
										height: trickplayFrame.height ?? 90,
										backgroundImage: `url(${trickplayFrame.url})`,
										backgroundPosition: `-${trickplayFrame.x ?? 0}px -${trickplayFrame.y ?? 0}px`,
										backgroundRepeat: "no-repeat",
									}}
								/>
								<div className="flex flex-col items-center px-1 pb-0.5">
									{hoveredMarker?.label && (
										<span className="max-w-36 truncate font-medium text-[10px] text-white/70 leading-tight">{hoveredMarker.label}</span>
									)}
									<span className="font-bold font-mono text-white text-xs leading-tight tracking-tight">
										{formatTime(activeTooltipTime, duration)}
									</span>
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center gap-0.5 rounded-md bg-black/90 px-2.5 py-1 text-white shadow-xl ring-1 ring-white/10">
								{hoveredMarker?.label && (
									<span className="max-w-50 truncate font-medium text-[10px] text-white/70 leading-tight">{hoveredMarker.label}</span>
								)}
								<span className="font-mono font-semibold text-xs leading-tight tracking-tight">
									{formatTime(activeTooltipTime, duration)}
								</span>
							</div>
						)}
					</div>
				)}

				{/* Main track background */}
				<div aria-hidden className="absolute h-1.5 w-full rounded-full bg-white/20 transition-[height] duration-150 group-hover/track:h-2">
					{/* Transcoded so far (server) — darker underlay reaching hours ahead */}
					{transcodedRanges.map((range) => {
						const start = Math.min(100, Math.max(0, (range.startTime / safeDuration) * 100));
						const end = Math.min(100, Math.max(start, (range.endTime / safeDuration) * 100));

						return (
							<span
								key={`transcoded-${range.startTime}-${range.endTime}`}
								className="absolute inset-y-0 rounded-full bg-white/15"
								style={{ left: `${start}%`, width: `${end - start}%` }}
							/>
						);
					})}

					{/* Actually buffered by the player (video.buffered) — brighter sliver at the playhead */}
					{bufferedRanges.map((range) => {
						const start = Math.min(100, Math.max(0, (range.startTime / safeDuration) * 100));
						const end = Math.min(100, Math.max(start, (range.endTime / safeDuration) * 100));

						return (
							<span
								key={`buffered-${range.startTime}-${range.endTime}`}
								className="absolute inset-y-0 rounded-full bg-white/40"
								style={{ left: `${start}%`, width: `${end - start}%` }}
							/>
						);
					})}

					{/* Played progress */}
					<span className="absolute inset-y-0 left-0 rounded-full bg-primary shadow-xs" style={{ width: `${playedPercent}%` }} />

					{/* Media markers overlay */}
					{markers.map((segment) => {
						const isPoint = segment.type === "highlight" || segment.startSeconds === segment.endSeconds;
						const start = Math.min(100, Math.max(0, (segment.startSeconds / safeDuration) * 100));
						const end = Math.min(100, Math.max(start, (segment.endSeconds / safeDuration) * 100));
						const colorConfig = SEGMENT_COLORS[segment.type] ?? {
							bg: "bg-warning",
							title: segment.type,
						};

						if (isPoint) {
							return (
								<span
									key={segment.id}
									title={`📌 ${segment.label ?? colorConfig.title} (${formatTime(segment.startSeconds)})`}
									className="group/pin pointer-events-none absolute -top-1 z-25 flex -translate-x-1/2 flex-col items-center"
									style={{ left: `${start}%` }}
								>
									<span className={cn("size-3 rounded-full border-2 border-background shadow-md", colorConfig.bg)} />
								</span>
							);
						}

						const width = Math.max(0.4, end - start);

						return (
							<span
								key={segment.id}
								title={`${segment.label ?? colorConfig.title} (${formatTime(segment.startSeconds)} - ${formatTime(segment.endSeconds)})`}
								className={cn("absolute inset-y-0 z-20 transition-opacity", colorConfig.bg)}
								style={{ left: `${start}%`, width: `${width}%` }}
							/>
						);
					})}
				</div>

				{/* Range slider for interaction */}
				<input
					type="range"
					min={0}
					max={safeDuration}
					step={0.1}
					value={scrubTime}
					aria-label={m.player_playback_position_aria()}
					aria-valuetext={m.player_progress_position({ position: formatTime(displayedTime), duration: formatTime(safeDuration) })}
					className="absolute z-30 h-10 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-progress]:bg-transparent [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
					onPointerDown={(event) => {
						try {
							event.currentTarget.setPointerCapture(event.pointerId);
						} catch {
							// ignore
						}

						setWantsTrickplay(true);
						setIsScrubbing(true);
					}}
					onChange={(event) => setScrubTime(Number(event.target.value))}
					onPointerUp={(event) => {
						try {
							event.currentTarget.releasePointerCapture(event.pointerId);
						} catch {
							// ignore
						}

						commitSeek();
					}}
					onPointerCancel={() => {
						setIsScrubbing(false);
					}}
					onKeyUp={(event) => {
						if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Home" || event.key === "End") {
							commitSeek();
						}
					}}
				/>
			</div>
		</>
	);
}
