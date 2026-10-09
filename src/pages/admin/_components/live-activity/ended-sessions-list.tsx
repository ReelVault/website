import { History } from "lucide-react";
import { useAdminEndedLiveSessions } from "@/client/hooks/use-admin-live-activity";
import { m } from "@/paraglide/messages";
import { formatDateTime, formatTimestamp } from "@/utils/format-utils";

/** Playback sessions that ended recently, newest first; the server keeps a bounded history. */
export function EndedSessionsList() {
	const query = useAdminEndedLiveSessions();
	const sessions = query.data?.sessions ?? [];

	return (
		<section className="flex flex-col gap-3 pt-2">
			<div className="flex items-center gap-2">
				<History className="size-4 text-muted-foreground" />
				<h4 className="font-bold text-foreground text-xs uppercase tracking-wider">{m.admin_live_ended_title()}</h4>
			</div>

			{sessions.length === 0 ? (
				<p className="text-muted-foreground text-sm">{m.admin_live_ended_empty()}</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead className="text-muted-foreground text-xs">
							<tr>
								<th className="px-2 py-1 font-medium">{m.admin_live_ended_col_title()}</th>
								<th className="px-2 py-1 font-medium">{m.admin_live_ended_col_profile()}</th>
								<th className="px-2 py-1 font-medium">{m.admin_live_ended_col_reason()}</th>
								<th className="px-2 py-1 font-medium">{m.admin_live_ended_col_duration()}</th>
								<th className="px-2 py-1 font-medium">{m.admin_live_ended_col_ended()}</th>
							</tr>
						</thead>
						<tbody>
							{sessions.map((session) => (
								<tr key={session.sessionId} className="border-border border-t">
									<td className="px-2 py-1.5">{session.title ?? m.admin_live_ended_untitled()}</td>
									<td className="px-2 py-1.5">{session.profileName ?? "—"}</td>
									<td className="px-2 py-1.5">{session.reason}</td>
									<td className="px-2 py-1.5 tabular-nums">{formatTimestamp(session.durationSeconds)}</td>
									<td className="px-2 py-1.5">{formatDateTime(session.endedAt)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
