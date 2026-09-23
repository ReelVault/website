import { useState } from "react";
import type { CreateMediaMarker, MediaMarker } from "@reelvault/sdk";
import { useAdminSetMarkers } from "@/client/hooks/use-admin-markers";
import type { MarkerFormData } from "../components/marker-dialog";

export function useMarkerOperations(markers: MediaMarker[]) {
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
		const fileMarkers = markers.filter((m) => m.mediaFileId === mediaFileId);

		let newMarkersList: CreateMediaMarker[];
		if (!editingMarker) {
			newMarkersList = [
				...fileMarkers.map((m) => ({
					type: m.type,
					startSeconds: m.startSeconds,
					endSeconds: m.endSeconds,
					label: m.label ?? undefined,
					source: m.source,
					pluginId: m.pluginId ?? undefined,
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
			newMarkersList = fileMarkers.map((m) => {
				if (m.id === editingMarker.id) {
					return {
						type,
						startSeconds,
						endSeconds,
						label,
						source: m.source,
						pluginId: m.pluginId ?? undefined,
					};
				}

				return {
					type: m.type,
					startSeconds: m.startSeconds,
					endSeconds: m.endSeconds,
					label: m.label ?? undefined,
					source: m.source,
					pluginId: m.pluginId ?? undefined,
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

		const remaining: CreateMediaMarker[] = [];
		for (const m of markers) {
			if (m.mediaFileId === marker.mediaFileId && m.id !== marker.id) {
				remaining.push({
					type: m.type,
					startSeconds: m.startSeconds,
					endSeconds: m.endSeconds,
					label: m.label ?? undefined,
					source: m.source,
					pluginId: m.pluginId ?? undefined,
				});
			}
		}

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
