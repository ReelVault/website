/**
 * The view transitions TanStack Router starts drop their `ready` and `finished` promises. When the browser replaces
 * or skips a transition (a second navigation starts, or the page is hidden), those promises reject with nothing
 * listening, and the console shows an uncaught error. The navigation itself still completes. Upstream: TanStack
 * Router issue #7906, fix in PR #7907 (not released in 1.170.42). Remove this filter once a release contains the fix.
 */
const SKIPPED_TRANSITIONS: ReadonlyArray<readonly [name: string, message: string]> = [
	["AbortError", "Transition was skipped"],
	["InvalidStateError", "Transition was aborted because of invalid state"],
];

export function isSkippedViewTransitionRejection(reason: unknown): boolean {
	if (typeof reason !== "object" || reason === null || !("name" in reason) || !("message" in reason)) return false;

	return SKIPPED_TRANSITIONS.some(([name, message]) => reason.name === name && reason.message === message);
}

/** Silences only the skipped-transition rejections; every other unhandled rejection is still reported. */
export function silenceSkippedViewTransitions(target: Window = window): void {
	target.addEventListener("unhandledrejection", (event) => {
		if (isSkippedViewTransitionRejection(event.reason)) event.preventDefault();
	});
}
