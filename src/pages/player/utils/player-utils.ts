import { setNativeLandscapeLock } from "@/lib/capacitor-native";
import { detach as detachTask, noopCleanup as noopCleanupTask } from "@/lib/detach";

// Shared fire-and-forget helpers live in @/lib/detach; re-exported here for
// the player module's local convenience imports.
export const detach = detachTask;

export const noopCleanup = noopCleanupTask;

/**
 * Format seconds into mm:ss or hh:mm:ss string.
 * If totalDuration is provided, hours are shown when the duration warrants it.
 */
export function formatTime(time: number, totalDuration?: number): string {
	const totalSeconds = Math.max(0, Math.floor(time));
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	const hasHours = totalDuration !== undefined ? totalDuration >= 3600 || hours > 0 : hours > 0;

	if (hasHours) {
		return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	}

	return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/** Toggle play/pause on a video element. */
export function togglePlayPause(video: HTMLVideoElement): void {
	if (video.paused) {
		detach(() => video.play());

		return;
	}

	video.pause();
}

/** iPhone Safari exposes a proprietary native-video fullscreen entry point. */
interface WebkitVideoElement extends HTMLVideoElement {
	webkitEnterFullscreen?: () => void;
}

function isWebkitVideo(video: HTMLVideoElement): video is WebkitVideoElement {
	return "webkitEnterFullscreen" in video;
}

/** Toggle fullscreen, falling back to native video fullscreen on iPhone Safari. */
export function toggleFullscreen(_container?: HTMLElement | null, video?: HTMLVideoElement | null): void {
	if (document.fullscreenElement) {
		detach(() => document.exitFullscreen());
		detach(() => setNativeLandscapeLock(false));

		return;
	}

	// iPhone Safari doesn't expose Element.requestFullscreen for video — use the
	// WebKit proprietary native-video fullscreen instead.
	if (!document.fullscreenEnabled && video && isWebkitVideo(video) && typeof video.webkitEnterFullscreen === "function") {
		video.webkitEnterFullscreen();
		detach(() => setNativeLandscapeLock(true));

		return;
	}

	detach(() => document.documentElement.requestFullscreen());
	detach(() => setNativeLandscapeLock(true));
}

/** Toggle picture-in-picture on a video element. */
export function togglePiP(video: HTMLVideoElement): void {
	if (document.pictureInPictureElement) {
		detach(() => document.exitPictureInPicture());
	} else {
		detach(() => video.requestPictureInPicture());
	}
}

/** Check if the browser has buffered data at a given local offset. */
export function hasBufferAt(video: HTMLVideoElement, position: number): boolean {
	const buf = video.buffered;
	for (let i = 0; i < buf.length; i++) {
		if (position >= buf.start(i) - 0.5 && position < buf.end(i)) {
			return true;
		}
	}

	return false;
}

export interface BufferedRange {
	startTime: number;
	endTime: number;
}

/** Check if a given time position falls inside any of the provided ranges. */
export function isPositionInRanges(position: number, ranges: BufferedRange[], tolerance = 0.5): boolean {
	for (const range of ranges) {
		if (position >= range.startTime - tolerance && position <= range.endTime + tolerance) {
			return true;
		}
	}

	return false;
}

/** Check if seeking to targetPosition is safe (already buffered in browser or transcoded on server). */
export function isSafeSeek(
	targetPosition: number,
	streamStartTime: number,
	video: HTMLVideoElement | null,
	transcodedRanges: BufferedRange[],
): boolean {
	const targetLocalOffset = video ? targetPosition - streamStartTime : -1;
	if (video && targetLocalOffset >= 0 && hasBufferAt(video, targetLocalOffset)) {
		return true;
	}

	return isPositionInRanges(targetPosition, transcodedRanges);
}
