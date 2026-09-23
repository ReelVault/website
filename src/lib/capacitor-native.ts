interface CapacitorGlobal {
	isNativePlatform?: () => boolean;
	Plugins?: {
		KeepAwake?: {
			keepAwake: () => Promise<void>;
			allowSleep: () => Promise<void>;
		};
		ScreenOrientation?: {
			lock: (options: { orientation: string }) => Promise<void>;
			unlock: () => Promise<void>;
		};
	};
}

function hasCapacitor(value: object): value is { Capacitor?: CapacitorGlobal } {
	return "Capacitor" in value;
}

function getCapacitor(): CapacitorGlobal | undefined {
	if (typeof window !== "undefined" && hasCapacitor(window)) {
		return window.Capacitor;
	}

	return undefined;
}

/**
 * Native-only player integrations for the Capacitor shells (Android/iOS).
 * Everything is a no-op in the browser and in Tauri, so the player can call
 * these unconditionally without forking its logic per platform.
 */

export function isNativeApp(): boolean {
	return Boolean(getCapacitor()?.isNativePlatform?.());
}

/** True when the build runs inside a Tauri desktop shell. */
export function isTauriShell(): boolean {
	return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/** True for any native wrapper of the web build (Capacitor mobile / Tauri desktop). */
export function isNativeShell(): boolean {
	return isNativeApp() || isTauriShell();
}

/** Keeps the screen on while playback runs. Native platforms only. */
export async function setNativeKeepAwake(on: boolean): Promise<void> {
	if (!isNativeApp()) return;

	try {
		const keepAwake = getCapacitor()?.Plugins?.KeepAwake;
		if (on) {
			await keepAwake?.keepAwake();
		} else {
			await keepAwake?.allowSleep();
		}
	} catch (error) {
		console.error("keep-awake failed", error);
	}
}

/** Locks orientation to landscape during fullscreen playback. Native only. */
export async function setNativeLandscapeLock(on: boolean): Promise<void> {
	if (!isNativeApp()) return;

	try {
		const screenOrientation = getCapacitor()?.Plugins?.ScreenOrientation;
		if (on) {
			await screenOrientation?.lock({ orientation: "landscape" });
		} else {
			await screenOrientation?.unlock();
		}
	} catch (error) {
		console.error("orientation lock failed", error);
	}
}
