import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminLiveActivityResponse } from "@reelvault/sdk";
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
