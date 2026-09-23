/**
 * Lazy facade over sonner's `toast`. Keeps the sonner chunk out of the eager
 * graph: calls made before the chunk loads are queued and replayed in order
 * once it arrives. Import `toast` from here instead of "sonner".
 */
import type { toast as sonnerToast } from "sonner";
import { detach } from "@/lib/detach";

type SonnerToast = typeof sonnerToast;
type MessageArgs = Parameters<SonnerToast["success"]>;
type DismissArgs = Parameters<SonnerToast["dismiss"]>;
type PromiseArgs = Parameters<SonnerToast["promise"]>;
type CustomArgs = Parameters<SonnerToast["custom"]>;

const pending: Array<(t: SonnerToast) => void> = [];
let sonner: SonnerToast | null = null;

async function load(): Promise<void> {
	if (sonner) return;

	const mod = await import("sonner");
	sonner = mod.toast;
	for (const run of pending.splice(0)) {
		run(sonner);
	}
}

function enqueue(run: (t: SonnerToast) => void): void {
	if (sonner) {
		run(sonner);

		return;
	}

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
