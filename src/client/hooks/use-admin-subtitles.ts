import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { subtitleKeys } from "../utils/query-keys";

const emptyToUndefined = (value: string | undefined): string | undefined => (value === "" ? undefined : value);

export function useAdminSubtitles(page: number, limit: number, filters: { mediaFileId?: string; language?: string }) {
	return useQuery({
		queryKey: subtitleKeys.admin({ page, limit, ...filters }),
		placeholderData: keepPreviousData,
		queryFn: () =>
			reelvault.subtitles.getAll({
				page,
				limit,
				mediaFileId: emptyToUndefined(filters.mediaFileId),
				language: emptyToUndefined(filters.language),
			}),
		staleTime: 60_000,
	});
}

export function useAdminSubtitle(id: string, enabled: boolean) {
	return useQuery({
		queryKey: subtitleKeys.adminDetail(id),
		queryFn: () => reelvault.subtitles.getById(id),
		enabled,
		staleTime: 60_000,
	});
}

export function useAdminSubtitleProviders() {
	return useQuery({
		queryKey: subtitleKeys.providers(),
		queryFn: () => reelvault.subtitles.listProviders(),
		// Static provider registry — refreshed only via invalidateProviderConsumers (use-admin-providers).
		staleTime: Number.POSITIVE_INFINITY,
	});
}

export function useAdminUpdateSubtitle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: Parameters<typeof reelvault.subtitles.update>[1] }) =>
			reelvault.subtitles.update(id, body),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: subtitleKeys.all });
			toast.success(m.toast_subtitle_updated());
		},
		onError: (error) => toastError(m.toast_subtitle_update_failed(), error),
	});
}

export function useAdminDeleteSubtitle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => reelvault.subtitles.delete(id),
		onSuccess: async (_, id) => {
			await queryClient.invalidateQueries({ queryKey: subtitleKeys.all });
			queryClient.removeQueries({ queryKey: subtitleKeys.adminDetail(id) });
			toast.success(m.toast_subtitle_deleted());
		},
		onError: (error) => toastError(m.toast_subtitle_delete_failed(), error),
	});
}
