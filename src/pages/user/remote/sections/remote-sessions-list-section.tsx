import type { PlaybackSessionSummary } from "@reelvault/sdk";
import { cn } from "cn";
import { Tv } from "lucide-react";
import { ConfirmAction } from "@/components/confirm-action";
import { ApiImage } from "@/components/ui/api-image";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { formatDuration } from "@/utils/duration-utils";
import { formatDateTime } from "@/utils/format-utils";
import { UserSectionTitle } from "../../components/user-ui";

interface RemoteSessionsListSectionProps {
	sessions: PlaybackSessionSummary[];
	selectedSessionId: string | null;
	onSelectSession: (id: string) => void;
	onCloseAll: () => void;
	isClosing: boolean;
}

export function RemoteSessionsListSection({
	sessions,
	selectedSessionId,
	onSelectSession,
	onCloseAll,
	isClosing,
}: RemoteSessionsListSectionProps) {
	return (
		<section>
			<UserSectionTitle title={m.user_active_playback()} description={m.user_select_session_to_control()} />
			<div className="mb-3 flex justify-end">
				<ConfirmAction
					trigger={
						<Button variant="outline" size="sm" disabled={isClosing}>
							{m.user_playback_sessions_close_all()}
						</Button>
					}
					title={m.user_playback_sessions_close_all_title()}
					description={m.user_playback_sessions_close_all_description()}
					confirmLabel={m.user_playback_sessions_close_all()}
					onConfirm={onCloseAll}
				/>
			</div>
			<div className="flex flex-col gap-3">
				{sessions.map((session) => (
					<button
						key={session.sessionId}
						type="button"
						onClick={() => onSelectSession(session.sessionId)}
						className={cn(
							"flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors",
							selectedSessionId === session.sessionId
								? "border-primary/60 bg-primary/5"
								: "border-border/70 bg-card/70 hover:border-primary/40",
						)}
					>
						<div className="bg-primary/10 text-primary relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl">
							{session.posterImageId ? (
								<ApiImage
									fileId={session.posterImageId}
									cacheKey={session.posterImageUpdatedAt}
									alt={session.title ?? "Poster"}
									fill
									sizes="48px"
									className="object-cover"
								/>
							) : (
								<Tv className="size-5" aria-hidden="true" />
							)}
						</div>
						<div className="min-w-0 flex-1">
							<h2 className="truncate font-bold">{session.title ?? m.common_playback()}</h2>
							<p className="text-muted-foreground mt-1 text-xs">
								{m.user_remote_mode_activity({
									mode: session.mode === "transcode" ? m.common_transcoding() : m.common_direct_stream(),
									activity: m.user_remote_last_activity({ time: formatDateTime(new Date(session.lastActivity)) }),
								})}
							</p>
							{session.positionSeconds != null && (
								<p className="text-muted-foreground mt-0.5 text-xs">
									{m.user_playback_position({ time: formatDuration(session.positionSeconds) })}
									{session.paused ? ` · ${m.user_playback_paused()}` : ""}
								</p>
							)}
						</div>
					</button>
				))}
			</div>
		</section>
	);
}
