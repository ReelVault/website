import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CollectionSortMode } from "reelvault-sdk";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { collectionAdminFields } from "../utils/fields";
import { adminKeys, collectionKeys } from "../utils/query-keys";

export function useAdminCollections(search?: string) {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: adminKeys.collections(search),
		placeholderData: keepPreviousData,
		queryFn: () => reelvault.collections.getAll({ name: search === "" ? undefined : search, fields: collectionAdminFields }),
		staleTime: 120_000,
	});

	const invalidate = () =>
		Promise.all([
			queryClient.invalidateQueries({ queryKey: adminKeys.collections() }),
			queryClient.invalidateQueries({ queryKey: collectionKeys.all }),
		]);

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: { name?: string; sortMode?: CollectionSortMode } }) =>
			reelvault.collections.update(id, data, { fields: collectionAdminFields }),
		onSuccess: async () => {
			await invalidate();
			toast.success(m.toast_collections_updated());
		},
		onError: (error) => {
			toastError(m.toast_collections_update_error(), error);
		},
	});

	const updateOrderMutation = useMutation({
		mutationFn: ({ id, metadataIds }: { id: string; metadataIds: string[] }) => reelvault.collections.updateOrder(id, metadataIds),
		onSuccess: async () => {
			await invalidate();
			toast.success(m.toast_collections_order_saved());
		},
		onError: (error) => {
			toastError(m.toast_collections_order_save_error(), error);
		},
	});

	return {
		collections: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
		updateCollection: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		updateCollectionOrder: updateOrderMutation.mutateAsync,
		isUpdatingOrder: updateOrderMutation.isPending,
	};
}

export function useAdminCollection(collectionId: string) {
	return useQuery({
		queryKey: adminKeys.collectionDetail(collectionId),
		queryFn: () => reelvault.collections.getById(collectionId, { fields: collectionAdminFields }),
		enabled: Boolean(collectionId),
		staleTime: 1000 * 60 * 5,
	});
}
