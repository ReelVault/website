import { useEffect, useRef, useSyncExternalStore } from "react";
import { getRealtimeStatus, type RealtimeStatus, subscribeRealtimeStatus } from "@/client/hooks/use-realtime";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";

function subscribe(callback: () => void) {
	return subscribeRealtimeStatus(callback);
}

function getSnapshot() {
	return getRealtimeStatus();
}

function getServerSnapshot(): "idle" {
	return "idle";
}

/**
 * Renders a persistent "reconnecting" pill while the realtime socket is down
 * and toasts once when the connection is restored. Hidden while connected.
 */
export function RealtimeStatusIndicator() {
	const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	const prevStatus = useRef<RealtimeStatus>(status);

	useEffect(() => {
		if (prevStatus.current === "reconnecting" && status === "open") {
			toast.success(m.realtime_reconnected());
		}

		prevStatus.current = status;
	}, [status]);

	if (status !== "reconnecting") return null;

	return (
		<div
			role="status"
			className="border-warning/30 bg-warning/10 text-warning flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
		>
			<span className="relative flex size-2">
				<span className="bg-warning absolute inline-flex size-full animate-ping rounded-full opacity-60" />
				<span className="bg-warning relative inline-flex size-2 rounded-full" />
			</span>
			{m.realtime_reconnecting()}
		</div>
	);
}
