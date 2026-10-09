import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

export function useAdminCacheStats() {
	return useQuery({
		queryKey: adminKeys.cacheStats(),
		queryFn: () => reelvault.admin.getCacheStats(),
		refetchInterval: 30_000,
		refetchIntervalInBackground: false,
		staleTime: 20_000,
	});
}

/** Deletes the optimized image copies; the cache stats are measured again once the purge finishes. */
export function usePurgeImageCache() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => reelvault.admin.purgeImageCache(),
		onSuccess: async ({ removedFiles }) => {
			await queryClient.invalidateQueries({ queryKey: adminKeys.cacheStats() });
			toast.success(m.admin_resources_image_cache_cleared({ count: removedFiles }));
		},
		onError: (error) => {
			toastError(m.admin_resources_image_cache_clear_failed(), error);
		},
	});
}
