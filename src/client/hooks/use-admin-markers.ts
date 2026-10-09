import type { CreateMediaMarker, MediaMarker, MediaMarkerFilters, PaginatedResponse } from "@reelvault/sdk";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

/** Markers per page in the admin list. */
export const MARKERS_PAGE_SIZE = 50;

/** One page of markers in the library (admin list). Filters run on the server; without them every marker is listed. */
export function useAdminMediaMarkers(filters: MediaMarkerFilters & { page?: number; limit?: number } = {}) {
	return useQuery<PaginatedResponse<MediaMarker>>({
		queryKey: adminKeys.mediaMarkersList(filters),
		placeholderData: keepPreviousData,
		queryFn: () => reelvault.media.getAllMarkers(filters),
		staleTime: 60_000,
	});
}

/** Replaces the markers of every media file an NDJSON export names; the outcome says what was written. */
export function useImportAdminMarkers() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (ndjson: string) => reelvault.media.importMarkers(ndjson),
		onSuccess: async (result) => {
			await queryClient.invalidateQueries({ queryKey: adminKeys.mediaMarkers() });
			toast.success(m.admin_markers_import_done({ markers: result.markers, mediaFiles: result.mediaFiles }));
		},
		onError: (err) => {
			toastError(m.admin_markers_import_failed(), err);
		},
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
