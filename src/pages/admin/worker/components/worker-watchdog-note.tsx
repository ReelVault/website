import { AlertCircle } from "lucide-react";
import { useWorkerWatchdog } from "@/client/hooks/use-worker-watchdog";
import { m } from "@/paraglide/messages";
import { formatDateTime } from "@/utils/format-utils";

/** Shown only once the watchdog has requeued orphaned jobs since the server started, the usual sign of a crash or a stalled poll loop. */
export function WorkerWatchdogNote() {
	const { data } = useWorkerWatchdog();
	if (!data || data.recoveredJobs === 0) return null;

	return (
		<p role="status" className="flex items-center gap-2 text-warning text-xs">
			<AlertCircle className="size-3.5 shrink-0" />
			{m.admin_workers_watchdog_recovered({ count: data.recoveredJobs, time: formatDateTime(data.lastRecoveredAt) })}
		</p>
	);
}
