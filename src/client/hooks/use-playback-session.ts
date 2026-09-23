import { useMutation, useQuery } from "@tanstack/react-query";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClientCapabilities, PlaybackCommand, PlaybackSession } from "reelvault-sdk";
import { m } from "@/paraglide/messages";
import { safeUuid } from "@/utils/id-utils";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { playbackSessionKeys } from "../utils/query-keys";
import { realtimeConnection } from "./use-realtime";

export function usePlaybackSession(
	mediaFileId: string | undefined,
	capabilities: ClientCapabilities | undefined,
	maxBitrate?: number,
	audioStreamIndex?: number,
	options?: { enabled?: boolean },
) {
	const enabled = options?.enabled ?? true;
	const [session, setSession] = useState<PlaybackSession>();
	const activeSessionIdRef = useRef<string | null>(null);
	const requestedConfigurationRef = useRef<string | null>(null);
	const isMountedRef = useRef<boolean>(true);
	// Explicit boolean return keeps control-flow narrowing from freezing the
	// ref's initial value inside the memoized callbacks below.
	const isMounted = useCallback((): boolean => isMountedRef.current, []);

	// Client-state gates only: no session without a file, and codec capabilities
	// must be known before asking the server for a decision. Everything else
	// (ranges, defaults, null/undefined handling) is owned by the server
	// contract — raw values go out as-is.
	const request = useMemo(
		() =>
			enabled && mediaFileId?.trim() && capabilities
				? {
						mediaFileId,
						videoCodecs: capabilities.videoCodecs,
						audioCodecs: capabilities.audioCodecs,
						maxBitrate,
						audioStreamIndex,
						// HDR render path — sent only when non-empty so SDR clients keep the
						// exact same request shape as before (no session-shape churn).
						...(capabilities.hdrTransfers?.length ? { hdrTransfers: capabilities.hdrTransfers } : {}),
					}
				: undefined,
		[enabled, mediaFileId, capabilities, maxBitrate, audioStreamIndex],
	);
	const configurationKey = request ? JSON.stringify(request) : undefined;

	// One idempotency key per logical session request: react-query retries reuse the
	// same key (server dedupes the duplicate), while a config change or an explicit
	// reconnect gets a fresh key so the server actually creates a new session.
	const idempotencyKeysRef = useRef(new Map<string, string>());

	// react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- transient playback session created directly into local state
	const mutation = useMutation({
		mutationFn: (body: NonNullable<typeof request>) => {
			const configKey = JSON.stringify(body);
			let idempotencyKey = idempotencyKeysRef.current.get(configKey);
			if (!idempotencyKey) {
				idempotencyKey = safeUuid();
				idempotencyKeysRef.current.set(configKey, idempotencyKey);
			}

			return reelvault.playbackSessions.create(body, { idempotencyKey });
		},
	});
	const { mutateAsync } = mutation;

	const create = useCallback(async () => {
		if (!(request && configurationKey && isMounted())) return;

		requestedConfigurationRef.current = configurationKey;
		try {
			const nextSession = await mutateAsync(request);
			// A newer configuration request superseded this one while it was in
			// flight (bitrate/audio/HDR changes). Discard the stale session instead
			// of overwriting — and then releasing — the session the user is on.
			if (requestedConfigurationRef.current !== configurationKey) {
				await reelvault.playbackSessions.release(nextSession.sessionId);

				return;
			}

			if (!isMounted()) {
				await reelvault.playbackSessions.release(nextSession.sessionId);

				return;
			}

			const previousSessionId = activeSessionIdRef.current;
			activeSessionIdRef.current = nextSession.sessionId;
			setSession(nextSession);
			if (previousSessionId && previousSessionId !== nextSession.sessionId) {
				await reelvault.playbackSessions.release(previousSessionId);
			}
		} catch (error) {
			requestedConfigurationRef.current = null;
			throw error;
		}
	}, [request, configurationKey, mutateAsync, isMounted]);

	useEffect(() => {
		if (!(request && configurationKey) || requestedConfigurationRef.current === configurationKey) return;

		// Transition keeps the session swap from blocking other renders; failures
		// are logged exactly like the previous detached .catch did.
		startTransition(async () => {
			try {
				await create();
			} catch (error) {
				console.error(error);
			}
		});
	}, [configurationKey, request, create]);

	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
			requestedConfigurationRef.current = null;
			const sessionId = activeSessionIdRef.current;
			activeSessionIdRef.current = null;
			if (sessionId) {
				startTransition(async () => {
					try {
						await reelvault.playbackSessions.release(sessionId);
					} catch (error) {
						console.error(error);
					}
				});
			}
		};
	}, []);

	const reconnect = async () => {
		if (!isMountedRef.current) return;

		requestedConfigurationRef.current = null;
		// A reconnect means the previous session is unusable — never dedupe against it.
		idempotencyKeysRef.current.clear();
		await create();
	};

	return {
		data: session,
		isPending: mutation.isPending && !session,
		isFetching: mutation.isPending,
		isError: mutation.isError && !session,
		error: mutation.error,
		refetch: create,
		reconnect,
	};
}

export function getPlaybackPlaylistUrl(sessionId: string, revision?: string) {
	const url = new URL(reelvault.playbackSessions.getPlaylistUrl(sessionId));
	if (revision) url.searchParams.set("revision", revision);

	return url.toString();
}

export function usePlaybackCommand(sessionId?: string) {
	// react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- transient remote playback command sent to active player
	return useMutation({
		mutationFn: async (command: PlaybackCommand) => {
			if (!sessionId) throw new Error("sessionId is required");

			// Prefer WS but only trust it when the server acked delivery to a player;
			// otherwise (no socket, nobody subscribed, or a lost ack) fall back to HTTP.
			const deliveredOverWs = await realtimeConnection.sendCommandWithAck(sessionId, command);
			if (deliveredOverWs === true) {
				return { delivered: true, command: command.type };
			}

			return await reelvault.playbackSessions.sendCommand(sessionId, command);
		},
		onError: (error) => toastError(m.toast_command_send_failed(), error),
	});
}

/** Composite session-init payload (progress, stream selection, completed state). */
export const playbackViewQueryOptions = (mediaFileId: string) => ({
	queryKey: playbackSessionKeys.playbackView(mediaFileId),
	queryFn: () => reelvault.playbackSessions.getView(mediaFileId),
	staleTime: 15_000,
});

/** Sessions started by this user on any device — remote-control page. */
export function useMyPlaybackSessions(options?: { refetchInterval?: number }) {
	return useQuery({
		queryKey: playbackSessionKeys.mine(),
		queryFn: () => reelvault.playbackSessions.listMine(),
		refetchInterval: options?.refetchInterval ?? 15_000,
		refetchIntervalInBackground: false,
	});
}
