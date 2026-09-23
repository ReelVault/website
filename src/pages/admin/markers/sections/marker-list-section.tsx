import type { ReactNode } from "react";
import type { MediaMarker } from "reelvault-sdk";
import { AppEmptyState } from "@/components/app-states";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { MarkerTable } from "../components/marker-table";

const SKELETON_KEYS = ["1", "2", "3", "4", "5"] as const;

interface MarkerListSectionProps {
	isLoading: boolean;
	filteredMarkers: MediaMarker[];
	search: string;
	typeFilter: string;
	sourceFilter: string;
	onOpenEdit: (marker: MediaMarker) => void;
	onDelete: (marker: MediaMarker) => void;
	onCopy: (text: string, label: string) => void;
}

export function MarkerListSection({
	isLoading,
	filteredMarkers,
	search,
	typeFilter,
	sourceFilter,
	onOpenEdit,
	onDelete,
	onCopy,
}: MarkerListSectionProps) {
	const hasActiveFilters = search !== "" || typeFilter !== "all" || sourceFilter !== "all";
	const emptyDescription = hasActiveFilters ? m.admin_markers_no_results_for_filters() : m.admin_markers_none_in_database();

	let sectionBody: ReactNode;
	if (isLoading) {
		sectionBody = (
			<div className="flex flex-col gap-3">
				{SKELETON_KEYS.map((key) => (
					<Skeleton key={key} className="h-20 rounded-lg" />
				))}
			</div>
		);
	} else if (filteredMarkers.length === 0) {
		sectionBody = <AppEmptyState title={m.admin_markers_none_registered()} description={emptyDescription} />;
	} else {
		sectionBody = <MarkerTable markers={filteredMarkers} onOpenEdit={onOpenEdit} onDelete={onDelete} onCopy={onCopy} />;
	}

	return <AdminSection title={m.admin_markers_list({ length: filteredMarkers.length })}>{sectionBody}</AdminSection>;
}
