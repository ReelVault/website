import { MAX_PLAYER_VOLUME } from "../utils/player-audio-boost";

const PLAYBACK_RATE_STORAGE_KEY = "reelvault:player:playbackRate";

/** Error fields the player reacts to across client/server failure paths. */
export interface PlaybackErrorShape {
	status?: number;
	code?: string;
	message?: string;
}

/** Extracts known error fields without asserting an unknown rejection's shape. */
export function toPlaybackError(value: unknown): PlaybackErrorShape {
	const shape: PlaybackErrorShape = {};
	if (typeof value === "object" && value !== null) {
		if ("status" in value && typeof value.status === "number") shape.status = value.status;

		if ("code" in value && typeof value.code === "string") shape.code = value.code;

		if ("message" in value && typeof value.message === "string") shape.message = value.message;
	}

	return shape;
}

/** The server ends the session on admin stop or expiry — both surface as 403. */
export function isForbiddenPlaybackError(error: PlaybackErrorShape): boolean {
	return (
		error.status === 403 ||
		error.code === "forbidden" ||
		(typeof error.message === "string" && (error.message.includes("administratora") || error.message.includes("admin")))
	);
}

export const getStoredVolume = (): number => {
	if (typeof window === "undefined") return 1;

	try {
		const stored = localStorage.getItem("reelvault:player:volume");
		if (stored !== null) {
			const parsed = Number.parseFloat(stored);
			if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= MAX_PLAYER_VOLUME) return parsed;
		}
	} catch {
		// ignore
	}

	return 1;
};

export const getStoredMuted = (): boolean => {
	if (typeof window === "undefined") return false;

	try {
		return localStorage.getItem("reelvault:player:muted") === "true";
	} catch {
		// ignore
	}

	return false;
};

export const getStoredPlaybackRate = (): number => {
	if (typeof window === "undefined") return 1;

	try {
		const parsed = Number.parseFloat(localStorage.getItem(PLAYBACK_RATE_STORAGE_KEY) ?? "");
		if (Number.isNaN(parsed)) return 1;

		return Math.min(2, Math.max(0.25, parsed));
	} catch {
		return 1;
	}
};
