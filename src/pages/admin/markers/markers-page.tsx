import type { MediaMarker } from "@reelvault/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { lazy, Suspense } from "react";
import { getReelVaultApiUrl } from "@/client/client";
import { useAdminMediaMarkers, useImportAdminMarkers } from "@/client/hooks/use-admin-markers";
import { useAdminStats } from "@/client/hooks/use-admin-stats";
import { useRealtimeEvent } from "@/client/hooks/use-realtime";
import { adminKeys } from "@/client/utils/query-keys";
import { AppErrorState } from "@/components/app-states";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { AdminPageHeader } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { copyToClipboard } from "@/utils/clipboard-utils";
import { MarkerFilterBar } from "./components/marker-filter-bar";
import { MarkerStats } from "./components/marker-stats";
import { isMediaMarkerType } from "./components/marker-types";
import { useMarkerOperations } from "./hooks/use-marker-operations";
import { MarkerListSection } from "./sections/marker-list-section";

const MarkerDialog = lazy(async () => ({ default: (await import("./components/marker-dialog")).MarkerDialog }));

const MARKER_SOURCES: ReadonlyArray<MediaMarker["source"]> = ["automatic", "manual", "plugin"];
const isMarkerSource = (value: string): value is MediaMarker["source"] => MARKER_SOURCES.some((source) => source === value);

export default function AdminMediaMarkersPage() {
	const queryClient = useQueryClient();

	const searchParams = useSearch({ from: "/admin/markers" });
	const navigate = useNavigate({ from: "/admin/markers" });
	const search = searchParams.q ?? "";
	const typeFilter = searchParams.type ?? "all";
	const sourceFilter = searchParams.source ?? "all";
	// The filters run on the server, so the text query waits until typing pauses.
	const debouncedSearch = useDebounce({ value: search, delay: 300 });

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

	const markersQuery = useAdminMediaMarkers({
		type: isMediaMarkerType(typeFilter) ? typeFilter : undefined,
		source: isMarkerSource(sourceFilter) ? sourceFilter : undefined,
		q: debouncedSearch.trim() || undefined,
	});

	const importMutation = useImportAdminMarkers();

	const handleExport = () => {
		const params = new URLSearchParams();
		if (typeFilter !== "all") params.set("type", typeFilter);
		if (sourceFilter !== "all") params.set("source", sourceFilter);
		if (search.trim()) params.set("q", search.trim());
		const query = params.toString();
		window.open(`${getReelVaultApiUrl()}/v1/media-files/markers/export${query ? `?${query}` : ""}`, "_blank", "noopener,noreferrer");
	};

	const handleImportFile = (file: File) => {
		detach(async () => {
			const text = await file.text();
			try {
				await importMutation.mutateAsync(text);
			} catch {
				// Toast is handled by hook
			}
		});
	};

	const statsQuery = useAdminStats();
	// The list is the filtered result, so the header count is the number of markers shown.
	const markers = markersQuery.data ?? [];

	const { dialogOpen, setDialogOpen, editingMarker, openCreateDialog, openEditDialog, isPending, handleFormSubmit, handleDeleteMarker } =
		useMarkerOperations();

	const stats = {
		intros: statsQuery.data?.markers?.introsCount ?? 0,
		credits: statsQuery.data?.markers?.creditsCount ?? 0,
		highlights: statsQuery.data?.markers?.highlightsCount ?? 0,
		fromPlugins: statsQuery.data?.markers?.fromPluginsCount ?? 0,
	};

	return (
		<div className="flex flex-col gap-6">
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
						onExport={handleExport}
						onImportFile={handleImportFile}
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
				filteredMarkers={markers}
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
		</div>
	);
}
