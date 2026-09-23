import { addTransitionType, startTransition } from "react";

/**
 * Runs a state update as a Transition with a named type,
 * so `<ViewTransition update={{ [type]: ... }}>` can pick the animation
 * for a specific change reason (tab, filter, ...).
 */
export function runTransition(type: string, update: () => void) {
	startTransition(() => {
		addTransitionType(type);
		update();
	});
}
