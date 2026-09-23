import type { PlaybackSessionSummary } from "@reelvault/sdk";
import { cn } from "cn";
import { Tv } from "lucide-react";
import { ApiImage } from "@/components/ui/api-image";
import { m } from "@/paraglide/messages";
import { formatDateTime } from "@/utils/format-utils";
import { UserSectionTitle } from "../../components/user-ui";

interface RemoteSessionsListSectionProps {
	sessions: PlaybackSessionSummary[];
	selectedSessionId: string | null;
	onSelectSession: (id: string) => void;
}

export function RemoteSessionsListSection({ sessions, selectedSessionId, onSelectSession }: RemoteSessionsListSectionProps) {
	return (
		<section>
			<UserSectionTitle title={m.user_active_playback()} description={m.user_select_session_to_control()} />
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
						<div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
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
							<p className="mt-1 text-muted-foreground text-xs">
								{m.user_remote_mode_activity({
									mode: session.mode === "transcode" ? m.common_transcoding() : m.common_direct_stream(),
									activity: m.user_remote_last_activity({ time: formatDateTime(new Date(session.lastActivity)) }),
								})}
							</p>
						</div>
					</button>
				))}
			</div>
		</section>
	);
}
