import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { ReelVaultError } from "@reelvault/sdk/client";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { mediaFileQueryOptions } from "@/client/hooks/use-media";
import { playbackViewQueryOptions, usePlaybackSession } from "@/client/hooks/use-playback-session";
import { usePlaybackPreRoll } from "@/client/hooks/use-plugin-ui";
import { useProfilePreferences } from "@/client/hooks/use-profiles";
import { AppErrorState, AppLoadingState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";
import { m } from "@/paraglide/messages";
import { AppPlayer } from "./app-player";
import { CinemaPreRollOverlay } from "./components/cinema-pre-roll-overlay";
import { useClientCapabilities } from "./hooks/use-client-capabilities";
import { detach } from "./utils/player-utils";

const getStoredBitrate = (): number | undefined => {
	if (typeof window === "undefined") return undefined;

	try {
		const parsed = Number.parseInt(localStorage.getItem("reelvault:player:maxBitrate") ?? "", 10);

		return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
	} catch {
		return undefined;
	}
};

export default function PlayerByIdPage() {
	const { id } = useParams({ from: "/player/$id" });

	const { profile, isLoading: isProfileLoading } = useCurrentUser();
	const profilePreferencesQuery = useProfilePreferences(profile?.id);
	const mediaFileQuery = useQuery({ ...mediaFileQueryOptions(id), enabled: Boolean(id) });
	const clientCapabilities = useClientCapabilities();

	// One composite request for session-init data (progress: position, audio
	// stream selection, completed) — the full media-file fetch runs in parallel
	// and only gates the player surface, not session creation.
	const viewQuery = useQuery({ ...playbackViewQueryOptions(id), enabled: Boolean(id) });
	usePageTitle(viewQuery.data?.metadata.title);

	const [hasInitializedState, setHasInitializedState] = useState(false);
	// Quality choice persists locally (same scope as volume/muted) so it survives
	// reloads and carries over to the next episode without re-selecting it.
	const [maxBitrate, setMaxBitrateState] = useState<number | undefined>(getStoredBitrate);
	const setMaxBitrate = (value: number | undefined) => {
		setMaxBitrateState(value);
		try {
			if (value === undefined) localStorage.removeItem("reelvault:player:maxBitrate");
			else localStorage.setItem("reelvault:player:maxBitrate", String(value));
		} catch {
			// ignore
		}
	};
	// Only a manual in-session audio switch sets this — the initial session is
	// always decided server-side (preferences, per-title resume state).
	const [audioStreamIndex, setAudioStreamIndex] = useState<number | undefined>();

	const isInitialDataLoading = isProfileLoading || profilePreferencesQuery.isLoading || viewQuery.isPending;

	useEffect(() => {
		if (hasInitializedState || isInitialDataLoading) return;

		setHasInitializedState(true);
	}, [hasInitializedState, isInitialDataLoading]);

	// Cinema mode: a plugin declaring playbackPreRoll (e.g. Cinemamode) supplies
	// trailers shown before the title starts. While they play, session creation
	// is held back — the session only starts when the actual feature does.
	const preRoll = usePlaybackPreRoll(id);
	const [hasPreRollFinished, setHasPreRollFinished] = useState(false);
	const isPreRollBlocking = preRoll.isEnabled && !hasPreRollFinished && (preRoll.isPending || preRoll.entries.length > 0);

	const sessionQuery = usePlaybackSession(id, clientCapabilities, maxBitrate, audioStreamIndex, {
		enabled: hasInitializedState && Boolean(id) && Boolean(clientCapabilities) && !isPreRollBlocking,
	});

	if (isPreRollBlocking && preRoll.entries.length > 0) {
		return (
			<CinemaPreRollOverlay
				entries={preRoll.entries}
				featureTitle={viewQuery.data?.metadata.title}
				onDone={() => setHasPreRollFinished(true)}
			/>
		);
	}

	if (isInitialDataLoading || sessionQuery.isPending || mediaFileQuery.isPending || !id) {
		return <AppLoadingState label={m.player_preparing_playback()} className="min-h-screen bg-background" />;
	}

	if (
		profilePreferencesQuery.error ||
		!profile ||
		(sessionQuery.isError && !sessionQuery.data) ||
		mediaFileQuery.isError ||
		!sessionQuery.data
	) {
		const isTerminatedError = sessionQuery.error instanceof ReelVaultError && sessionQuery.error.code === "stream.session_terminated";
		const title = isTerminatedError ? (sessionQuery.error?.message ?? m.player_stopped_by_admin()) : m.player_playback_start_failed();
		const description = isTerminatedError ? m.player_stopped_by_admin_notice() : m.user_check_server_connection();

		// TODO: Add error
		return (
			<main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
				<AppErrorState
					title={title}
					description={description}
					onRetry={
						isTerminatedError
							? undefined
							: () => detach(() => Promise.all([profilePreferencesQuery.refetch(), sessionQuery.refetch(), mediaFileQuery.refetch()]))
					}
				/>
				<div className="flex flex-wrap justify-center gap-3">
					<Button type="button" variant="outline" onClick={() => window.history.back()}>
						<ArrowLeft className="size-4" aria-hidden="true" /> {m.common_back()}
					</Button>
				</div>
			</main>
		);
	}

	return (
		<AppPlayer
			mediaFileId={id}
			mediaFile={mediaFileQuery.data}
			session={sessionQuery.data}
			onSessionExpired={sessionQuery.reconnect}
			settings={{ maxBitrate, audioStreamIndex }}
			settingsActions={{
				onQualityChange: setMaxBitrate,
				onAudioStreamChange: setAudioStreamIndex,
			}}
			isChangingQuality={sessionQuery.isFetching}
			profileId={profile.id}
			profilePreferences={profilePreferencesQuery.preferences}
		/>
	);
}
