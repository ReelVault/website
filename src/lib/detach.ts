// Fire-and-forget helper for background promises that must not block the
// caller (for example route-loader prefetches or fire-and-forget native calls).
// Accepts either a promise or a thunk returning one; failures are logged
// instead of surfacing as unhandled rejections, so `detach` itself never
// rejects. The bounded store keeps bookkeeping entries for the most recent
// wrappers and discards older ones so the queue cannot grow without limit.
interface DetachedTask {
	promise: Promise<void>;
}

const recentTasks: DetachedTask[] = [];
const maxTrackedTasks = 16;

async function settle(task: Promise<unknown> | (() => Promise<unknown>)): Promise<void> {
	try {
		await (typeof task === "function" ? task() : task);
	} catch (error: unknown) {
		console.error("Detached background task failed", error);
	}
}

export function detach(task: Promise<unknown> | (() => Promise<unknown>)): void {
	recentTasks.push({ promise: settle(task) });
	if (recentTasks.length > maxTrackedTasks) {
		recentTasks.splice(0, recentTasks.length - maxTrackedTasks);
	}
}

/** Cleanup handle for effects with nothing to dispose (consistent-return). */
export const noopCleanup = () => {
	// Intentionally empty — there is nothing to dispose.
};
