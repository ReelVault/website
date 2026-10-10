import { History } from "lucide-react";
import { reelvault } from "@/client/client";
import { useAdminEndedLiveSessions } from "@/client/hooks/use-admin-live-activity";
import { ResponsiveDataList } from "@/components/responsive-data-list";
import { m } from "@/paraglide/messages";
import { formatDateTime, formatTimestamp } from "@/utils/format-utils";
import { translateByKey } from "@/utils/translate-error";

type EndedSession = NonNullable<ReturnType<typeof useAdminEndedLiveSessions>["data"]>["data"][number];

function EndedSessionCard({ session }: { session: EndedSession }) {
	return (
		<div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-background/40 p-4">
			<p className="break-words font-semibold text-foreground text-sm">{session.title ?? m.admin_live_ended_untitled()}</p>
			<dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
				<div className="flex flex-col gap-0.5">
					<dt className="text-muted-foreground">{m.admin_live_ended_col_profile()}</dt>
					<dd>{session.profileName ?? "—"}</dd>
				</div>
				<div className="flex flex-col gap-0.5">
					<dt className="text-muted-foreground">{m.admin_live_ended_col_reason()}</dt>
					<dd>{translateByKey(session.reason)}</dd>
				</div>
				<div className="flex flex-col gap-0.5">
					<dt className="text-muted-foreground">{m.admin_live_ended_col_duration()}</dt>
					<dd className="tabular-nums">{formatTimestamp(session.durationSeconds)}</dd>
				</div>
				<div className="flex flex-col gap-0.5">
					<dt className="text-muted-foreground">{m.admin_live_ended_col_ended()}</dt>
					<dd>{formatDateTime(session.endedAt)}</dd>
				</div>
			</dl>
			<a
				href={reelvault.admin.getLiveSessionLogUrl(session.sessionId)}
				download
				className="inline-flex min-h-10 items-center text-primary text-sm underline-offset-4 hover:underline"
			>
				{m.admin_live_ended_download_log()}
			</a>
		</div>
	);
}

/** Playback sessions that ended recently, newest first; the server keeps a bounded history. */
export function EndedSessionsList() {
	const query = useAdminEndedLiveSessions();
	const sessions = query.data?.data ?? [];

	return (
		<section className="flex flex-col gap-3 pt-2">
			<div className="flex items-center gap-2">
				<History className="size-4 text-muted-foreground" />
				<h4 className="font-bold text-foreground text-xs">{m.admin_live_ended_title()}</h4>
			</div>

			{sessions.length === 0 ? (
				<p className="text-muted-foreground text-sm">{m.admin_live_ended_empty()}</p>
			) : (
				<ResponsiveDataList
					items={sessions}
					getKey={(session) => session.sessionId}
					renderTable={(items) => (
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead className="text-muted-foreground text-xs">
									<tr>
										<th className="px-2 py-1 font-medium">{m.admin_live_ended_col_title()}</th>
										<th className="px-2 py-1 font-medium">{m.admin_live_ended_col_profile()}</th>
										<th className="px-2 py-1 font-medium">{m.admin_live_ended_col_reason()}</th>
										<th className="px-2 py-1 font-medium">{m.admin_live_ended_col_duration()}</th>
										<th className="px-2 py-1 font-medium">{m.admin_live_ended_col_ended()}</th>
										<th className="px-2 py-1 font-medium">{m.admin_live_ended_col_log()}</th>
									</tr>
								</thead>
								<tbody>
									{items.map((session) => (
										<tr key={session.sessionId} className="border-border border-t">
											<td className="px-2 py-1.5">{session.title ?? m.admin_live_ended_untitled()}</td>
											<td className="px-2 py-1.5">{session.profileName ?? "—"}</td>
											<td className="px-2 py-1.5">{translateByKey(session.reason)}</td>
											<td className="px-2 py-1.5 tabular-nums">{formatTimestamp(session.durationSeconds)}</td>
											<td className="px-2 py-1.5">{formatDateTime(session.endedAt)}</td>
											<td className="px-2 py-1.5">
												<a
													href={reelvault.admin.getLiveSessionLogUrl(session.sessionId)}
													download
													className="text-primary underline-offset-4 hover:underline"
												>
													{m.admin_live_ended_download_log()}
												</a>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
					renderCard={(session) => <EndedSessionCard session={session} />}
				/>
			)}
		</section>
	);
}
