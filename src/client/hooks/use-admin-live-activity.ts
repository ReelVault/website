import type { AdminLiveActivityResponse, BulkTerminateSessions } from "@reelvault/sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

export function useAdminLiveActivity() {
	return useQuery<AdminLiveActivityResponse>({
		queryKey: adminKeys.liveActivity(),
		queryFn: () => reelvault.admin.getLiveActivity(),
		// Live telemetry while sessions are active; backoff on an idle server,
		// so an empty response does not poll every 3 s (the biggest network offender in admin).
		refetchInterval: (query) => {
			const data = query.state.data;
			const hasActivity = (data?.activeStreams.length ?? 0) > 0 || (data?.activeDevices.length ?? 0) > 0;

			return hasActivity ? 3000 : 15_000;
		},
		staleTime: 1500,
	});
}

/** Stops several streams at once; the outcome says how many stopped and how many could not be stopped. */
export function useTerminateLiveStreams() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (body: BulkTerminateSessions) => reelvault.admin.terminateLiveStreams(body),
		onSuccess: async (result) => {
			const message = m.admin_live_stop_selected_done({ terminated: result.terminated, failed: result.failed });
			if (result.failed > 0) toast.error(message);
			else toast.success(message);
			await queryClient.invalidateQueries({ queryKey: adminKeys.liveActivity() });
		},
		onError: (error) => {
			toastError(m.admin_session_stop_error(), error);
		},
	});
}

export function useTerminateLiveStream() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ sessionId, reason }: { sessionId: string; reason?: string }) => reelvault.admin.terminateLiveStream(sessionId, reason),
		onSuccess: async () => {
			toast.success(m.toast_stream_stopped());
			await queryClient.invalidateQueries({ queryKey: adminKeys.liveActivity() });
		},
		onError: (error) => {
			toastError(m.hooks_stream_stop_failed_with({ message: error.message }), error);
		},
	});
}
