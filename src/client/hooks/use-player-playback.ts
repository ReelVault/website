import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TranscodeProgressResponse } from "@reelvault/sdk";
import { reelvault } from "../client";
import { playbackSessionKeys, subtitleKeys } from "../utils/query-keys";

export function usePlayerSubtitles(mediaFileId: string) {
	return useQuery({
		queryKey: subtitleKeys.list(mediaFileId),
		queryFn: () => reelvault.subtitles.getAll({ mediaFileId, limit: 100 }),
		enabled: Boolean(mediaFileId),
	});
}

export function useSubtitleContent(subtitleId: string | undefined) {
	return useQuery({
		queryKey: subtitleKeys.content(subtitleId),
		staleTime: Number.POSITIVE_INFINITY,
		// Subtitle files are immutable per id — never garbage-collect mid-session,
		// otherwise returning to the player after >10 min re-downloads the content.
		gcTime: Number.POSITIVE_INFINITY,
		queryFn: () => reelvault.subtitles.getContent(subtitleId ?? ""),
		enabled: Boolean(subtitleId),
	});
}

export function usePlaybackDiagnostics(sessionId: string, enabled: boolean, refetchInterval: number) {
	return useQuery({
		queryKey: playbackSessionKeys.diagnostics(sessionId),
		queryFn: () => reelvault.playbackSessions.getDiagnostics(sessionId),
		enabled: enabled && Boolean(sessionId),
		refetchInterval: enabled ? refetchInterval : false,
	});
}

export const TRANSCODE_POLL_INTERVAL_MS = 5000;

/**
 * Poll cadence while transcoding is under way. Only a finished encode stops the
 * poll (99% tolerance) — pending/inactive sessions keep polling because ffmpeg
 * may not have spawned yet (session init) or may be recovering from a crash,
 * and a permanent stop here would freeze the buffer bar for the whole session.
 */
export function transcodePollInterval(data: TranscodeProgressResponse | undefined): typeof TRANSCODE_POLL_INTERVAL_MS | false {
	if (!data) return TRANSCODE_POLL_INTERVAL_MS;

	if (data.state === "completed") return false;

	if (data.progressPercent != null && data.progressPercent >= 99) return false;

	if (data.duration != null && data.duration > 0 && data.transcodedUntil / data.duration >= 0.99) return false;

	return TRANSCODE_POLL_INTERVAL_MS;
}

/**
 * How far the server has gotten transcoding/remuxing — NOT the player buffer.
 * Polling stops once transcoding reaches completion (99-100% tolerance).
 */
export function useTranscodeProgress(sessionId: string | undefined, enabled: boolean) {
	return useQuery({
		queryKey: playbackSessionKeys.transcodeProgress(sessionId ?? ""),
		queryFn: () => reelvault.playbackSessions.getTranscodeProgress(sessionId ?? ""),
		enabled: enabled && Boolean(sessionId),
		refetchInterval: (query) => {
			if (!(enabled && sessionId)) return false;

			return transcodePollInterval(query.state.data);
		},
	});
}

export function useSubtitleSearch(mediaFileId: string, language: string) {
	// react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- on-demand provider search without cache invalidation
	return useMutation({ mutationFn: () => reelvault.subtitles.searchProviders({ mediaFileId, languages: [language] }) });
}

export function useSubtitleDownload(mediaFileId: string, onDownloaded: (subtitleId: string) => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ providerId, subtitleId }: { providerId: string; subtitleId: string }) =>
			reelvault.subtitles.downloadFromProvider(providerId, { mediaFileId, subtitleId }),
		onSuccess: async (subtitle) => {
			onDownloaded(subtitle.id);
			await queryClient.invalidateQueries({ queryKey: subtitleKeys.list(mediaFileId) });
		},
	});
}

export function seekPlaybackSession(sessionId: string, position: number) {
	return reelvault.playbackSessions.seek(sessionId, position);
}
