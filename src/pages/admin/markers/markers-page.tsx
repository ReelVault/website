import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { lazy, Suspense } from "react";
import { useAdminMediaMarkers } from "@/client/hooks/use-admin-markers";
import { useAdminStats } from "@/client/hooks/use-admin-stats";
import { useRealtimeEvent } from "@/client/hooks/use-realtime";
import { adminKeys } from "@/client/utils/query-keys";
import { AppErrorState } from "@/components/app-states";
import { detach } from "@/lib/detach";
import { AdminPageHeader } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { copyToClipboard } from "@/utils/clipboard-utils";
import { MarkerFilterBar } from "./components/marker-filter-bar";
import { MarkerStats } from "./components/marker-stats";
import { useMarkerOperations } from "./hooks/use-marker-operations";
import { MarkerListSection } from "./sections/marker-list-section";

const MarkerDialog = lazy(async () => ({ default: (await import("./components/marker-dialog")).MarkerDialog }));

export default function AdminMediaMarkersPage() {
	const queryClient = useQueryClient();

	const searchParams = useSearch({ from: "/admin/markers" });
	const navigate = useNavigate({ from: "/admin/markers" });
	const search = searchParams.q ?? "";
	const typeFilter = searchParams.type ?? "all";
	const sourceFilter = searchParams.source ?? "all";

	const setSearch = (value: string) => {
		detach(() => navigate({ search: (prev) => ({ ...prev, q: value || undefined }), replace: true }));
	};
	const setTypeFilter = (value: string) => {
		detach(() => navigate({ search: (prev) => ({ ...prev, type: value !== "all" ? value : undefined }), replace: true }));
	};
	const setSourceFilter = (value: string) => {
		detach(() => navigate({ search: (prev) => ({ ...prev, source: value !== "all" ? value : undefined }), replace: true }));
	};

	// Real-time synchronization
	useRealtimeEvent("media-markers:changed", () => {
		detach(() => queryClient.invalidateQueries({ queryKey: adminKeys.mediaMarkers() }));
	});

	const markersQuery = useAdminMediaMarkers();

	const statsQuery = useAdminStats();
	const markers = markersQuery.data ?? [];

	const { dialogOpen, setDialogOpen, editingMarker, openCreateDialog, openEditDialog, isPending, handleFormSubmit, handleDeleteMarker } =
		useMarkerOperations(markers);

	const normalizedSearch = search.trim().toLowerCase();
	const isIdle = !normalizedSearch && typeFilter === "all" && sourceFilter === "all";

	const filteredMarkers = isIdle
		? markers
		: markers.filter((marker) => {
				if (typeFilter !== "all" && marker.type !== typeFilter) return false;

				if (sourceFilter !== "all" && marker.source !== sourceFilter) return false;

				if (normalizedSearch) {
					const matchLabel = marker.label?.toLowerCase().includes(normalizedSearch);
					const matchFile = marker.mediaFileId.toLowerCase().includes(normalizedSearch);
					const matchPlugin = marker.pluginId?.toLowerCase().includes(normalizedSearch);
					const matchType = marker.type.toLowerCase().includes(normalizedSearch);
					if (!(matchLabel || matchFile || matchPlugin || matchType)) return false;
				}

				return true;
			});

	const stats = {
		intros: statsQuery.data?.markers?.introsCount ?? 0,
		credits: statsQuery.data?.markers?.creditsCount ?? 0,
		highlights: statsQuery.data?.markers?.highlightsCount ?? 0,
		fromPlugins: statsQuery.data?.markers?.fromPluginsCount ?? 0,
	};

	return (
		<main className="flex flex-col gap-6 text-foreground">
			<AdminPageHeader
				icon={Bookmark}
				eyebrow={m.admin_markers_content_player()}
				title={m.admin_markers_heading()}
				count={markers.length}
				description={m.admin_markers_manage_description()}
				actions={
					<MarkerFilterBar
						search={search}
						onSearchChange={setSearch}
						typeFilter={typeFilter}
						onTypeFilterChange={setTypeFilter}
						sourceFilter={sourceFilter}
						onSourceFilterChange={setSourceFilter}
						onOpenCreateDialog={openCreateDialog}
					/>
				}
			/>

			<MarkerStats stats={stats} />

			{markersQuery.isError && (
				<AppErrorState
					title={m.admin_markers_failed_to_fetch()}
					description={m.admin_markers_check_permissions()}
					error={markersQuery.error}
					onRetry={() => detach(() => markersQuery.refetch())}
				/>
			)}

			<MarkerListSection
				isLoading={markersQuery.isLoading}
				filteredMarkers={filteredMarkers}
				search={search}
				typeFilter={typeFilter}
				sourceFilter={sourceFilter}
				onOpenEdit={(marker) => openEditDialog(marker)}
				onDelete={(id) => detach(() => handleDeleteMarker(id))}
				onCopy={(value) => detach(() => copyToClipboard(value))}
			/>

			{dialogOpen && (
				<Suspense fallback={null}>
					<MarkerDialog
						open={dialogOpen}
						onOpenChange={setDialogOpen}
						editingMarker={editingMarker}
						isPending={isPending}
						onSubmit={handleFormSubmit}
					/>
				</Suspense>
			)}
		</main>
	);
}
