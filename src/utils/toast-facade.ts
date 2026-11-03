/**
 * Lazy facade over sonner's `toast`. Keeps the sonner chunk out of the eager
 * graph: calls made before the chunk loads are queued and replayed in order
 * once it arrives. Import `toast` from here instead of "sonner".
 */
import type { toast as sonnerToast } from "sonner";
import { detach } from "@/lib/detach";
import { importWithTimeout } from "@/lib/with-timeout";

type SonnerToast = typeof sonnerToast;
type MessageArgs = Parameters<SonnerToast["success"]>;
type DismissArgs = Parameters<SonnerToast["dismiss"]>;
type PromiseArgs = Parameters<SonnerToast["promise"]>;
type CustomArgs = Parameters<SonnerToast["custom"]>;

const MAX_PENDING_TOASTS = 50;
const LOAD_RETRY_MS = 30_000;

const pending: Array<(t: SonnerToast) => void> = [];
let sonner: SonnerToast | null = null;
let loadPromise: Promise<void> | undefined;
let retryAt = 0;

function load(): Promise<void> {
	if (sonner) return Promise.resolve();
	if (loadPromise) return loadPromise;
	if (Date.now() < retryAt) return Promise.resolve();

	loadPromise = (async () => {
		try {
			const mod = await importWithTimeout(() => import("sonner"), "sonner");
			sonner = mod.toast;
			for (const run of pending.splice(0)) {
				run(sonner);
			}
		} catch (error: unknown) {
			// A failed chunk load must not grow an unbounded queue of toast
			// callbacks; drop them and retry the import after a backoff.
			pending.splice(0);
			retryAt = Date.now() + LOAD_RETRY_MS;
			console.error("Toast module failed to load", error);
		} finally {
			loadPromise = undefined;
		}
	})();

	return loadPromise;
}

function enqueue(run: (t: SonnerToast) => void): void {
	if (sonner) {
		run(sonner);

		return;
	}

	if (Date.now() < retryAt) return;

	if (pending.length >= MAX_PENDING_TOASTS) pending.shift();
	pending.push(run);
	detach(load());
}

const facade = Object.assign(
	(...args: MessageArgs) => {
		enqueue((t) => t(...args));
	},
	{
		success: (...args: MessageArgs) => {
			enqueue((t) => t.success(...args));
		},
		error: (...args: MessageArgs) => {
			enqueue((t) => t.error(...args));
		},
		info: (...args: MessageArgs) => {
			enqueue((t) => t.info(...args));
		},
		warning: (...args: MessageArgs) => {
			enqueue((t) => t.warning(...args));
		},
		loading: (...args: MessageArgs) => {
			enqueue((t) => t.loading(...args));
		},
		dismiss: (...args: DismissArgs) => {
			enqueue((t) => t.dismiss(...args));
		},
		promise: (...args: PromiseArgs) => {
			enqueue((t) => t.promise(...args));
		},
		custom: (...args: CustomArgs) => {
			enqueue((t) => t.custom(...args));
		},
	},
);

export const toast: typeof facade = facade;
