import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { metadataKeys } from "../utils/query-keys";

export const adminMetadataQueryOptions = ({
	page,
	pageSize,
	search,
	hasMediaFiles,
	lowConfidence,
	missingTranslation,
}: {
	page: number;
	pageSize: number;
	search: string;
	hasMediaFiles?: boolean;
	lowConfidence?: boolean;
	missingTranslation?: boolean;
}) => ({
	queryKey: metadataKeys.admin(page, pageSize, search, hasMediaFiles, lowConfidence, missingTranslation),
	placeholderData: keepPreviousData,
	queryFn: () =>
		reelvault.metadata.getAll({
			page,
			limit: pageSize,
			title: search || undefined,
			hasMediaFiles,
			lowConfidence: lowConfidence ? true : undefined,
			missingTranslation: missingTranslation ? true : undefined,
		}),
	staleTime: 120_000,
});

export function useAdminMetadata(
	currentPage: number,
	pageSize: number,
	debouncedSearch: string,
	hasMediaFiles?: boolean,
	lowConfidence?: boolean,
	missingTranslation?: boolean,
) {
	const queryClient = useQueryClient();
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
	const query = useQuery(
		adminMetadataQueryOptions({
			page: currentPage,
			pageSize,
			search: debouncedSearch,
			hasMediaFiles,
			lowConfidence,
			missingTranslation,
		}),
	);
	const deleteMutation = useMutation({
		mutationFn: async ({ id }: { id: string; title: string }) => {
			setDeletingIds((previous) => new Set(previous).add(id));
			await reelvault.metadata.delete(id);
		},
		onSuccess: async (_, variables) => {
			toast.success(m.hooks_metadata_deleted_named({ title: variables.title }));
			queryClient.removeQueries({ queryKey: metadataKeys.byId(variables.id) });
			queryClient.removeQueries({ queryKey: metadataKeys.details(variables.id) });
			queryClient.removeQueries({ queryKey: metadataKeys.detailsView(variables.id) });
			await queryClient.invalidateQueries({ queryKey: metadataKeys.adminAll() });
		},
		onError: (error, variables) => {
			console.error("Failed to delete metadata", error);
			toastError(m.hooks_metadata_delete_error_named({ title: variables.title }), error);
		},
		onSettled: (_, __, variables) => {
			setDeletingIds((previous) => {
				const next = new Set(previous);
				next.delete(variables.id);

				return next;
			});
		},
	});

	const deleteOrphansMutation = useMutation({
		mutationFn: async () => {
			return await reelvault.admin.deleteOrphanMetadata();
		},
		onSuccess: async (result) => {
			toast.success(m.hooks_orphans_deleted_count({ count: result.count }));
			await queryClient.invalidateQueries({ queryKey: metadataKeys.adminAll() });
		},
		onError: (error) => {
			console.error("Failed to delete orphan metadata", error);
			toastError(m.toast_metadata_orphan_delete_error(), error);
		},
	});

	const refreshAllMetadataMutation = useMutation({
		mutationFn: async () => {
			return await reelvault.admin.refreshMetadata();
		},
		onSuccess: async () => {
			toast.success(m.toast_artwork_job_scheduled());
			await queryClient.invalidateQueries({ queryKey: metadataKeys.all });
		},
		onError: (error) => {
			console.error("Failed to queue metadata refresh", error);
			toastError(m.toast_artwork_schedule_error(), error);
		},
	});

	// Refreshes every title matching the missing-translation filter — the admin
	// repairs exactly the flagged subset instead of sweeping the whole catalog.
	// The list endpoint caps at 20/page, so collect pages up to a sane batch;
	// anything past the cap stays flagged and a later run picks it up.
	const refreshMissingTranslationsMutation = useMutation({
		mutationFn: async () => {
			const MAX_IDS = 1000;
			const ids: string[] = [];
			let page = 1;
			for (;;) {
				const response = await reelvault.metadata.getAll({ missingTranslation: true, limit: 20, page });
				ids.push(...response.data.map((item) => item.id));
				if (ids.length === 0 || ids.length >= MAX_IDS || page >= response.totalPages) break;

				page += 1;
			}

			if (ids.length === 0) {
				return { operationId: "" };
			}

			return await reelvault.admin.refreshMetadata(undefined, ids);
		},
		onSuccess: async (result) => {
			if (result.operationId) {
				toast.success(m.toast_metadata_refresh_scheduled());
			} else {
				toast.success(m.hooks_metadata_no_missing_translations());
			}

			await queryClient.invalidateQueries({ queryKey: metadataKeys.adminAll() });
		},
		onError: (error) => {
			console.error("Failed to queue missing-translation refresh", error);
			toastError(m.toast_metadata_refresh_schedule_failed(), error);
		},
	});

	return {
		data: query.data ?? { data: [], total: 0, page: currentPage, limit: pageSize, totalPages: 0 },
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
		deletingIds,
		deleteMetadata: deleteMutation.mutateAsync,
		deleteOrphans: deleteOrphansMutation.mutateAsync,
		isDeletingOrphans: deleteOrphansMutation.isPending,
		refreshAllMetadata: refreshAllMetadataMutation.mutateAsync,
		isRefreshingAll: refreshAllMetadataMutation.isPending,
		refreshMissingTranslations: refreshMissingTranslationsMutation.mutateAsync,
		isRefreshingMissingTranslations: refreshMissingTranslationsMutation.isPending,
	};
}

export function useRefreshMetadata() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (metadataId: string) => reelvault.admin.refreshMetadata(metadataId),
		onSuccess: async (_, metadataId) => {
			toast.success(m.toast_metadata_refresh_scheduled());
			// The refresh job runs server-side async — revalidating the entity's own
			// queries plus the admin list is enough; blasting metadataKeys.all would
			// refetch every library grid/rail/collection in the cache for data that
			// isn't updated yet anyway.
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: metadataKeys.byId(metadataId) }),
				queryClient.invalidateQueries({ queryKey: metadataKeys.details(metadataId) }),
				queryClient.invalidateQueries({ queryKey: metadataKeys.detailsView(metadataId) }),
				queryClient.invalidateQueries({ queryKey: metadataKeys.adminAll() }),
			]);
		},
		onError: (error) => {
			toastError(m.toast_metadata_refresh_schedule_failed(), error);
		},
	});
}

export function useRefreshMetadataImages() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (metadataId: string) => reelvault.metadata.refreshImages(metadataId, { force: true }),
		onSuccess: async (_, metadataId) => {
			toast.success(m.hooks_artwork_force_fetched());
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: metadataKeys.byId(metadataId) }),
				queryClient.invalidateQueries({ queryKey: metadataKeys.details(metadataId) }),
				queryClient.invalidateQueries({ queryKey: metadataKeys.detailsView(metadataId) }),
				queryClient.invalidateQueries({ queryKey: metadataKeys.adminAll() }),
			]);
		},
		onError: (error) => {
			toastError(m.toast_artwork_fetch_failed(), error);
		},
	});
}
