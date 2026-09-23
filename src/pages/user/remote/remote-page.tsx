import type { PlaybackCommand, PlaybackSessionSummary } from "@reelvault/sdk";
import { Tv } from "lucide-react";
import { useEffect, useState } from "react";
import { useMyPlaybackSessions, usePlaybackCommand } from "@/client/hooks/use-playback-session";
import { realtimeConnection, useRealtimeEvent } from "@/client/hooks/use-realtime";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { UserPageHeader } from "../components/user-ui";
import { RemotePlaybackControlsSection } from "./sections/remote-playback-controls-section";
import { RemoteSessionsListSection } from "./sections/remote-sessions-list-section";

// Realtime session events already refetch on start/end — the shared hook's
// 15 s interval is just a slow safety net (was 5 s).
const SKELETON_KEYS = ["1", "2"] as const;

export default function RemotePage() {
	const sessionsQuery = useMyPlaybackSessions();
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

	const sessions: PlaybackSessionSummary[] = sessionsQuery.data?.sessions ?? [];
	const effectiveSessionId =
		selectedSessionId && sessions.some((s) => s.sessionId === selectedSessionId) ? selectedSessionId : (sessions[0]?.sessionId ?? null);
	const selectedSession = sessions.find((session) => session.sessionId === effectiveSessionId) ?? null;
	const commandMutation = usePlaybackCommand(effectiveSessionId ?? undefined);

	const refreshSessions = () => detach(sessionsQuery.refetch());

	// Progress events are routed only to WS clients subscribed to the HLS
	// session id. The player subscribes to its own session; the remote must do
	// the same for the selected session or the controls never receive progress.
	useEffect(() => {
		const sessionId = effectiveSessionId;
		if (sessionId) realtimeConnection.subscribeToSession(sessionId);

		return () => {
			if (sessionId) realtimeConnection.unsubscribeFromSession(sessionId);
		};
	}, [effectiveSessionId]);

	// Keep the list fresh without waiting for the poll interval.
	useRealtimeEvent("playback:session:started", refreshSessions);
	useRealtimeEvent("playback:session:ended", refreshSessions);

	const send = (command: PlaybackCommand) => {
		if (!effectiveSessionId || commandMutation.isPending) return;

		commandMutation.mutate(command, {
			onSuccess: (result) => {
				if (!result.delivered) {
					toast.warning(m.user_command_player_offline());
				}
			},
			onError: (error) => {
				console.error("Playback command failed", error);
			},
		});
	};

	const renderSessionArea = () => {
		if (sessionsQuery.isLoading) {
			return (
				<div className="flex flex-col gap-4" aria-busy="true">
					{SKELETON_KEYS.map((key) => (
						<Skeleton key={key} className="h-24 rounded-2xl" />
					))}
				</div>
			);
		}

		if (sessionsQuery.isError) {
			return <AppErrorState title={m.user_playback_sessions_fetch_failed()} error={sessionsQuery.error} onRetry={refreshSessions} />;
		}

		if (sessions.length === 0) {
			return <AppEmptyState icon={Tv} title={m.user_no_active_playback()} description={m.user_start_on_any_device()} />;
		}

		return <RemoteSessionsListSection sessions={sessions} selectedSessionId={effectiveSessionId} onSelectSession={setSelectedSessionId} />;
	};

	return (
		<main className="flex flex-col gap-10 pb-10">
			<UserPageHeader
				eyebrow={m.user_remote_control_eyebrow()}
				title={m.user_remote_pilot_heading()}
				description={m.user_control_other_devices()}
			/>

			{renderSessionArea()}

			{selectedSession && (
				<RemotePlaybackControlsSection session={selectedSession} onSendCommand={send} isPending={commandMutation.isPending} />
			)}
		</main>
	);
}
