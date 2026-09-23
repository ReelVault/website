import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateMediaMarker, MediaMarker } from "reelvault-sdk";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

/** Wszystkie markery w bibliotece (lista admina). */
export function useAdminMediaMarkers() {
	return useQuery<MediaMarker[]>({
		queryKey: adminKeys.mediaMarkers(),
		queryFn: () => reelvault.media.getAllMarkers(),
		staleTime: 60_000,
	});
}

/** Overwrite markers for one file (save = full list). */
export function useAdminSetMarkers() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ mediaFileId, updatedMarkers }: { mediaFileId: string; updatedMarkers: CreateMediaMarker[] }) =>
			reelvault.media.setMarkers(mediaFileId, updatedMarkers),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: adminKeys.mediaMarkers() });
			toast.success(m.admin_markers_saved());
		},
		onError: (err) => {
			toastError(m.admin_markers_failed_to_save(), err);
		},
	});
}
