import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

/**
 * What FFmpeg supports on this machine and which hardware accelerator the server
 * actually uses. `refresh` re-runs server-side detection (probe + test encode)
 * and additionally runs a one-off hardware decode test.
 */
export function useFfmpegCapabilities() {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: adminKeys.ffmpegCapabilities(),
		queryFn: () => reelvault.admin.getFfmpegCapabilities(),
		// Data changes only through refreshMutation (setQueryData) — no other invalidation path.
		staleTime: Number.POSITIVE_INFINITY,
	});

	const refreshMutation = useMutation({
		mutationFn: async () => {
			return await reelvault.admin.refreshFfmpegCapabilities();
		},
		onSuccess: (data) => {
			queryClient.setQueryData(adminKeys.ffmpegCapabilities(), data);
			toast.success(m.toast_ffmpeg_redetected());
		},
		onError: (error) => {
			console.error("Failed to refresh FFmpeg capabilities", error);
			toastError(m.toast_ffmpeg_redetect_failed(), error);
		},
	});

	return {
		capabilities: query.data,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
		refresh: refreshMutation.mutate,
		isRefreshing: refreshMutation.isPending,
	};
}
