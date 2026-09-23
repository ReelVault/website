import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MetadataImageOption, UpdateMetadata } from "reelvault-sdk";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { metadataKeys } from "../utils/query-keys";
import { useRefreshMetadata, useRefreshMetadataImages } from "./use-admin-metadata";

export function useAdminMetadataEditor(metadataId: string, onDeleted: () => void) {
	const queryClient = useQueryClient();
	const metadataQuery = useQuery({
		queryKey: metadataKeys.adminEditor(metadataId),
		enabled: Boolean(metadataId),
		queryFn: () => reelvault.metadata.getById(metadataId),
		staleTime: 300_000,
	});
	// Metadata edits surface in every domain view (lists, search, details,
	// related) — a domain-wide invalidation is the correct scope here.
	const invalidateMetadata = () => queryClient.invalidateQueries({ queryKey: metadataKeys.all });
	const updateMutation = useMutation({
		mutationFn: (body: UpdateMetadata) => reelvault.metadata.update(metadataId, body),
		onSuccess: async () => {
			await invalidateMetadata();
			toast.success(m.toast_metadata_saved());
		},
		onError: (error) => toastError(m.toast_metadata_save_failed(), error),
	});
	const deleteMutation = useMutation({
		mutationFn: () => reelvault.metadata.delete(metadataId),
		onSuccess: async () => {
			queryClient.removeQueries({ queryKey: metadataKeys.byId(metadataId) });
			queryClient.removeQueries({ queryKey: metadataKeys.details(metadataId) });
			queryClient.removeQueries({ queryKey: metadataKeys.detailsView(metadataId) });
			await invalidateMetadata();
			toast.success(m.toast_metadata_deleted_editor());
			onDeleted();
		},
		onError: (error) => {
			console.error("Failed to delete metadata", error);
			toastError(m.toast_metadata_delete_failed(), error);
		},
	});
	const refreshImagesMutationRaw = useRefreshMetadataImages();
	const refreshMutationRaw = useRefreshMetadata();
	const refreshImagesMutation = { ...refreshImagesMutationRaw, mutate: () => refreshImagesMutationRaw.mutate(metadataId) };
	const refreshMutation = { ...refreshMutationRaw, mutate: () => refreshMutationRaw.mutate(metadataId) };
	const mergeMutation = useMutation({
		mutationFn: (sourceMetadataId: string) => reelvault.metadata.merge(metadataId, sourceMetadataId),
		onSuccess: async () => {
			await Promise.all([
				invalidateMetadata(),
				queryClient.refetchQueries({ queryKey: metadataKeys.adminEditor(metadataId), type: "active" }),
			]);
			toast.success(m.toast_metadata_linked());
		},
		onError: (error) => {
			console.error("Failed to merge metadata", error);
			toastError(m.toast_metadata_link_failed(), error);
		},
	});
	const deleteImageMutation = useMutation({
		mutationFn: (imageId: string) => reelvault.images.delete(imageId, true),
		onSuccess: async () => {
			await invalidateMetadata();
			toast.success(m.toast_artwork_deleted());
		},
		onError: (error) => toastError(m.toast_artwork_delete_failed(), error),
	});

	return {
		metadataQuery,
		updateMutation,
		deleteMutation,
		refreshMutation,
		refreshImagesMutation,
		deleteImageMutation,
		mergeMutation,
	};
}

export function useMetadataArtwork(metadataId: string, type: MetadataImageOption["type"], open: boolean, onSelected: () => void) {
	const queryClient = useQueryClient();
	const optionsQuery = useQuery({
		queryKey: metadataKeys.imageOptions(metadataId, type),
		enabled: open,
		queryFn: () => reelvault.metadata.getImageOptions(metadataId),
		staleTime: 600_000,
	});
	const selectMutation = useMutation({
		mutationFn: (option: MetadataImageOption) =>
			reelvault.metadata.selectImage(metadataId, { providerId: option.providerId, type: option.type, url: option.url }),
		onSuccess: async () => {
			await Promise.all([
				queryClient.refetchQueries({ queryKey: metadataKeys.adminEditor(metadataId), type: "active" }),
				queryClient.invalidateQueries({ queryKey: metadataKeys.byId(metadataId) }),
			]);
			toast.success(m.toast_artwork_selected_downloaded());
			onSelected();
		},
		onError: (error) => toastError(m.toast_artwork_download_failed(), error),
	});
	const uploadMutation = useMutation({
		mutationFn: ({ type: imageType, file }: { type: MetadataImageOption["type"]; file: Blob }) =>
			reelvault.metadata.uploadImage(metadataId, imageType, file),
		onSuccess: async () => {
			await Promise.all([
				queryClient.refetchQueries({ queryKey: metadataKeys.adminEditor(metadataId), type: "active" }),
				queryClient.invalidateQueries({ queryKey: metadataKeys.byId(metadataId) }),
			]);
			toast.success(m.toast_artwork_uploaded());
			onSelected();
		},
		onError: (error) => toastError(m.toast_artwork_upload_failed(), error),
	});

	return { optionsQuery, selectMutation, uploadMutation };
}
