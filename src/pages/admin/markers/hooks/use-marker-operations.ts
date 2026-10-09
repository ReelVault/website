import type { CreateMediaMarker, MediaMarker } from "@reelvault/sdk";
import { useState } from "react";
import { reelvault } from "@/client/client";
import { useAdminSetMarkers } from "@/client/hooks/use-admin-markers";
import { m } from "@/paraglide/messages";
import { toastError } from "@/utils/toast-utils";
import type { MarkerFormData } from "../components/marker-dialog";

/**
 * The file's whole marker list. The admin list is filtered on the server, so a save must
 * rebuild the list from here: rebuilding from the filtered list would drop unmatched markers.
 */
async function loadFileMarkers(mediaFileId: string): Promise<MediaMarker[] | null> {
	try {
		return await reelvault.media.getMarkers(mediaFileId);
	} catch (error) {
		toastError(m.admin_markers_failed_to_save(), error);

		return null;
	}
}

export function useMarkerOperations() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingMarker, setEditingMarker] = useState<MediaMarker | null>(null);

	const openCreateDialog = () => {
		setEditingMarker(null);
		setDialogOpen(true);
	};

	const openEditDialog = (marker: MediaMarker) => {
		setEditingMarker(marker);
		setDialogOpen(true);
	};

	const saveMutation = useAdminSetMarkers();

	const handleFormSubmit = async (formData: MarkerFormData) => {
		if (saveMutation.isPending) return;

		const { mediaFileId, type, startSeconds, endSeconds, label } = formData;
		const fileMarkers = await loadFileMarkers(mediaFileId);
		if (!fileMarkers) return;

		let newMarkersList: CreateMediaMarker[];
		if (!editingMarker) {
			newMarkersList = [
				...fileMarkers.map((item) => ({
					type: item.type,
					startSeconds: item.startSeconds,
					endSeconds: item.endSeconds,
					label: item.label ?? undefined,
					source: item.source,
					pluginId: item.pluginId ?? undefined,
				})),
				{
					type,
					startSeconds,
					endSeconds,
					label,
					source: "manual" as const,
				},
			];
		} else {
			newMarkersList = fileMarkers.map((item) => {
				if (item.id === editingMarker.id) {
					return {
						type,
						startSeconds,
						endSeconds,
						label,
						source: item.source,
						pluginId: item.pluginId ?? undefined,
					};
				}

				return {
					type: item.type,
					startSeconds: item.startSeconds,
					endSeconds: item.endSeconds,
					label: item.label ?? undefined,
					source: item.source,
					pluginId: item.pluginId ?? undefined,
				};
			});
		}

		await saveMutation.mutateAsync({
			mediaFileId,
			updatedMarkers: newMarkersList,
		});
		setDialogOpen(false);
	};

	const handleDeleteMarker = async (marker: MediaMarker) => {
		if (saveMutation.isPending) return;

		const fileMarkers = await loadFileMarkers(marker.mediaFileId);
		if (!fileMarkers) return;

		const remaining: CreateMediaMarker[] = fileMarkers
			.filter((item) => item.id !== marker.id)
			.map((item) => ({
				type: item.type,
				startSeconds: item.startSeconds,
				endSeconds: item.endSeconds,
				label: item.label ?? undefined,
				source: item.source,
				pluginId: item.pluginId ?? undefined,
			}));

		await saveMutation.mutateAsync({
			mediaFileId: marker.mediaFileId,
			updatedMarkers: remaining,
		});
	};

	return {
		dialogOpen,
		setDialogOpen,
		editingMarker,
		openCreateDialog,
		openEditDialog,
		isPending: saveMutation.isPending,
		handleFormSubmit,
		handleDeleteMarker,
	};
}
