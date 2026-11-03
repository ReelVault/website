import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { noopCleanup } from "@/lib/detach";

/**
 * Keeps the user on a page with unsaved edits. Closing or reloading the tab asks the
 * browser to confirm. An in-app navigation waits for the answer: `leaveRequested` is
 * true while the user decides, and `answerLeave(true)` lets the navigation through.
 */
export function useUnsavedChangesGuard(hasChanges: boolean) {
	useEffect(() => {
		const warnBeforeUnload = (event: BeforeUnloadEvent) => {
			if (hasChanges) event.preventDefault();
		};
		window.addEventListener("beforeunload", warnBeforeUnload);

		return () => window.removeEventListener("beforeunload", warnBeforeUnload);
	}, [hasChanges]);

	const router = useRouter();
	const [leaveRequested, setLeaveRequested] = useState(false);
	const leaveAnswer = useRef<((leave: boolean) => void) | null>(null);
	useEffect(() => {
		if (!hasChanges) return noopCleanup;

		const unblock = router.history.block({
			blockerFn: () =>
				new Promise<boolean>((resolve) => {
					leaveAnswer.current = (leave) => resolve(!leave);
					setLeaveRequested(true);
				}),
		});

		return () => {
			// A component can unmount while a navigation is waiting for the answer
			// (auth redirect, forced route change). Resolve it so navigation never
			// hangs on an orphaned promise.
			leaveAnswer.current?.(true);
			leaveAnswer.current = null;
			unblock();
		};
	}, [hasChanges, router]);

	const answerLeave = (leave: boolean) => {
		setLeaveRequested(false);
		leaveAnswer.current?.(leave);
		leaveAnswer.current = null;
	};

	return { leaveRequested, answerLeave };
}
