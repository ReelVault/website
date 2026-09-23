import { WifiOff } from "lucide-react";
import { useSyncExternalStore } from "react";
import { m } from "@/paraglide/messages";

function subscribeOnline(callback: () => void) {
	window.addEventListener("online", callback);
	window.addEventListener("offline", callback);

	return () => {
		window.removeEventListener("online", callback);
		window.removeEventListener("offline", callback);
	};
}

function getSnapshot() {
	return !navigator.onLine;
}

function getServerSnapshot() {
	return false;
}

const subscribeNoop = () => {
	// No-op subscription: the mounted flag never changes after hydration.
	return () => {
		// Unsubscribe — nothing to clean up.
	};
};

function getMountedSnapshot() {
	return true;
}

/** Persistent banner when the browser reports no network access. */
export function OfflineBanner() {
	const isOffline = useSyncExternalStore(subscribeOnline, getSnapshot, getServerSnapshot);
	// Starts false on the server render and the first client (hydration) render,
	// then flips to true — same sequencing as the previous effect-based flag.
	const isMounted = useSyncExternalStore(subscribeNoop, getMountedSnapshot, getServerSnapshot);

	if (!(isMounted && isOffline)) return null;

	return (
		<div
			role="status"
			className="fixed inset-x-0 bottom-0 z-90 flex items-center justify-center gap-2 bg-warning px-4 py-2 font-semibold text-warning-foreground text-xs shadow-lg"
		>
			<WifiOff className="size-4" aria-hidden="true" />
			{m.common_offline_banner()}
		</div>
	);
}
