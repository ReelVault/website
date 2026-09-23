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
			className="flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-warning text-xs"
		>
			<span className="relative flex size-2">
				<span className="absolute inline-flex size-full animate-ping rounded-full bg-warning opacity-60" />
				<span className="relative inline-flex size-2 rounded-full bg-warning" />
			</span>
			{m.realtime_reconnecting()}
		</div>
	);
}
