import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { subtitleKeys } from "../utils/query-keys";

const emptyToUndefined = (value: string | undefined): string | undefined => (value === "" ? undefined : value);

export type AdminSubtitleSort = "added" | "updated" | "language" | "title";

// "added" is the server's default order, so an unset sort in the URL keeps the existing list.
const SUBTITLE_SORT_QUERY: Record<
	AdminSubtitleSort,
	{ sortBy: "createdAt" | "updatedAt" | "language" | "label"; sortOrder: "asc" | "desc" }
> = {
	added: { sortBy: "createdAt", sortOrder: "asc" },
	updated: { sortBy: "updatedAt", sortOrder: "desc" },
	language: { sortBy: "language", sortOrder: "asc" },
	title: { sortBy: "label", sortOrder: "asc" },
};

export function useAdminSubtitles(
	page: number,
	limit: number,
	filters: { mediaFileId?: string; language?: string; type?: "embedded" | "external"; q?: string },
	sort: AdminSubtitleSort = "added",
) {
	const sorting = SUBTITLE_SORT_QUERY[sort];

	return useQuery({
		queryKey: subtitleKeys.admin({ page, limit, ...filters, ...sorting }),
		placeholderData: keepPreviousData,
		queryFn: () =>
			reelvault.subtitles.getAll({
				page,
				limit,
				mediaFileId: emptyToUndefined(filters.mediaFileId),
				language: emptyToUndefined(filters.language),
				q: emptyToUndefined(filters.q),
				type: filters.type,
				...sorting,
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
