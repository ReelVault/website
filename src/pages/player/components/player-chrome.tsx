import { cn } from "cn";
import { lazy, type PointerEvent as ReactPointerEvent, Suspense, useEffect } from "react";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { setPlayerBridgeState } from "@/plugin-host/player-bridge-state";
import { PluginSlotHost } from "@/plugin-host/slot-host";
import { usePlayerMediaSession } from "../hooks/use-player-media-session";
import type { usePlayerTouchGestures } from "../hooks/use-player-touch-gestures";
import { usePlayerActions, usePlayerInfo, usePlayerNextEpisode, usePlayerStatus, usePlayerTime, usePlayerVolume } from "../player-context";
import { PlayerFeedbackHud } from "./player-feedback-hud";
import { PlayerFooter } from "./player-footer";
import { PlayerHeader } from "./player-header";
import { PlayerMarkerButton } from "./player-marker-button";
import { PlayerNextEpisodeOverlay } from "./player-next-episode-overlay";
import { PlayerErrorOverlay, PlayerLoadingOverlay } from "./player-state-overlays";
import { PlayerSubtitleOverlay } from "./player-subtitle-overlay";

// Interaction-only player surfaces — lazy so their code (dialogs, drawers,
// menus, ~2k lines + their dep trees) never lands in the critical playback
// path. Mounted through Suspense fallback={null}, gated on open where the
// component is controlled (same pattern as metadata-card-dialogs).
const PlayerAudioSubtitlesDialog = lazy(async () => ({
	default: (await import("./player-audio-subtitles-dialog")).PlayerAudioSubtitlesDialog,
}));
const PlayerDiagnostics = lazy(async () => ({ default: (await import("./player-diagnostics")).PlayerDiagnostics }));
const PlayerEpisodesDrawer = lazy(async () => ({ default: (await import("./player-episodes-drawer")).PlayerEpisodesDrawer }));
const PlayerSettingsMenu = lazy(async () => ({ default: (await import("./player-settings-menu")).PlayerSettingsMenu }));
const PlayerShortcutsDialog = lazy(async () => ({ default: (await import("./player-shortcuts-dialog")).PlayerShortcutsDialog }));

export interface PlayerChromeProps {
	diagnosticsOpen: boolean;
	controlsVisible: boolean;
	surface: {
		onClick: () => void;
		onDoubleClick: () => void;
		onPointerUp: (event: ReactPointerEvent) => void;
	};
	touchGestures: ReturnType<typeof usePlayerTouchGestures>;
	keepControlsVisible: () => void;
	shortcutsOpen: boolean;
	onShortcutsOpenChange: (open: boolean) => void;
	shortcutsDisabled: boolean;
	onShortcutsDisabledChange: (disabled: boolean) => void;
}

// ---------------------------------------------------------------------------
// Chrome composition — overlays + controls rendered above the video surface.
// Pure wiring: every handler and state piece stays owned by AppPlayerSurface.
// ---------------------------------------------------------------------------

export function PlayerChrome({
	diagnosticsOpen,
	controlsVisible,
	surface,
	touchGestures,
	keepControlsVisible,
	shortcutsOpen,
	onShortcutsOpenChange,
	shortcutsDisabled,
	onShortcutsDisabledChange,
}: PlayerChromeProps) {
	return (
		<>
			{/* Headless subscribers — media session sync; renders null */}
			<PlayerMediaSessionBridge />

			{/* Overlays */}
			<PlayerLoadingOverlay />
			<PlayerErrorOverlay />
			<PlayerNextEpisodeOverlay />
			{diagnosticsOpen && (
				<Suspense fallback={null}>
					<PlayerDiagnostics />
				</Suspense>
			)}
			<PlayerMarkerButton />
			<PlayerSubtitleOverlay controlsVisible={controlsVisible} />
			<PlayerFeedbackHud />

			{/* Controls chrome — pointer-events-none on container so clicks outside header/footer pass through to playback surface */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: controls overlay receives mouse events to pause auto-hide timer */}
			<div
				className={cn(
					"pointer-events-none absolute inset-0 z-20 flex flex-col justify-between bg-linear-to-t from-background/80 via-transparent to-background/60 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-opacity duration-300 sm:px-6 sm:pt-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))] lg:px-12 lg:pt-6 lg:pb-[max(1.5rem,env(safe-area-inset-bottom))]",
					{
						"opacity-100": controlsVisible,
						"opacity-0": !controlsVisible,
					},
				)}
				onMouseEnter={keepControlsVisible}
			>
				<div className={controlsVisible ? "pointer-events-auto" : "pointer-events-none"}>
					<PlayerHeader />
				</div>

				{/* Middle area between header and footer — click toggles play/pause, double-click toggles fullscreen */}
				<button
					type="button"
					tabIndex={-1}
					aria-label={m.player_toggle_playback()}
					className={cn("flex-1 cursor-pointer appearance-none border-none bg-transparent p-0 text-left outline-none", {
						"pointer-events-auto": controlsVisible,
						"pointer-events-none": !controlsVisible,
					})}
					onClick={surface.onClick}
					onDoubleClick={surface.onDoubleClick}
					onPointerDown={touchGestures.onPointerDown}
					onPointerMove={touchGestures.onPointerMove}
					onPointerUp={surface.onPointerUp}
					onPointerCancel={touchGestures.onPointerCancel}
				/>

				<div className={controlsVisible ? "pointer-events-auto" : "pointer-events-none"}>
					<PlayerFooter>
						<PlayerFooterPlugins />
						<Suspense fallback={null}>
							<PlayerEpisodesDrawer />
							<PlayerAudioSubtitlesDialog />
							<PlayerSettingsMenu
								onOpenShortcuts={() => onShortcutsOpenChange(true)}
								shortcutsDisabled={shortcutsDisabled}
								onShortcutsDisabledChange={onShortcutsDisabledChange}
							/>
						</Suspense>
					</PlayerFooter>
				</div>
			</div>

			{shortcutsOpen && (
				<Suspense fallback={null}>
					<PlayerShortcutsDialog
						open={shortcutsOpen}
						onOpenChange={onShortcutsOpenChange}
						shortcutsDisabled={shortcutsDisabled}
						onShortcutsDisabledChange={onShortcutsDisabledChange}
					/>
				</Suspense>
			)}
		</>
	);
}

// ---------------------------------------------------------------------------
// Headless bridge — the only place (besides the per-tick leaves) that follows
// the playhead. Keeps AppPlayerSurface free of fast-changing context values so
// the player chrome does not re-render on every timeupdate.
// ---------------------------------------------------------------------------

function PlayerMediaSessionBridge() {
	const info = usePlayerInfo();
	const actions = usePlayerActions();
	const nextEpisode = usePlayerNextEpisode();
	const status = usePlayerStatus();
	const { playbackRate } = usePlayerVolume();
	const time = usePlayerTime();

	usePlayerMediaSession({
		videoRef: actions.videoRef,
		title: info.title,
		currentEpisode: nextEpisode.currentEpisode,
		nextEpisode: nextEpisode.nextEpisode,
		duration: info.duration,
		currentTime: time.currentTime,
		playbackRate,
		isPaused: status.isPaused,
		seek: actions.seek,
		getAbsoluteTime: actions.getAbsoluteTime,
		playNextEpisode: nextEpisode.playNextEpisode,
	});

	return null;
}

// Live-playhead bridge for footer plugin buttons — same isolation as above:
// PluginSlotHost needs currentTime, but the surface must not.
function PlayerFooterPlugins() {
	const info = usePlayerInfo();
	const time = usePlayerTime();
	const { seek } = usePlayerActions();

	// Publish live playback state for plugin dialogs opened from the footer
	// (external global — never routed through React state at tick rate).
	useEffect(() => {
		setPlayerBridgeState({
			currentTime: time.currentTime,
			duration: info.duration,
			mediaFileId: info.mediaFileId,
			seek: (position) => {
				detach(seek(position));
			},
		});
	}, [time.currentTime, info.duration, info.mediaFileId, seek]);

	useEffect(() => () => setPlayerBridgeState({}), []);

	return (
		<PluginSlotHost
			name="player-footer"
			buttonClassName="h-10 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
			playerContext={{
				currentTime: time.currentTime,
				duration: info.duration,
				mediaFileId: info.mediaFileId,
			}}
		/>
	);
}
