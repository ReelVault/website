import type { MediaMarker } from "@reelvault/sdk";
import { ResponsiveDataList } from "@/components/responsive-data-list";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { m } from "@/paraglide/messages";
import { MarkerMobileCard } from "./marker-mobile-card";
import { MarkerTableRow } from "./marker-table-row";

interface MarkerTableProps {
	markers: MediaMarker[];
	onOpenEdit: (marker: MediaMarker) => void;
	onDelete: (marker: MediaMarker) => void;
	onCopy: (text: string, label: string) => void;
}

export function MarkerTable({ markers, onOpenEdit, onDelete, onCopy }: MarkerTableProps) {
	return (
		<ResponsiveDataList
			items={markers}
			getKey={(marker) => marker.id}
			renderTable={(items) => (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{m.plugins_markers_segment_type()}</TableHead>
							<TableHead>{m.admin_markers_time_range()}</TableHead>
							<TableHead>{m.admin_markers_media_file()}</TableHead>
							<TableHead>{m.admin_markers_source()}</TableHead>
							<TableHead>{m.common_created()}</TableHead>
							<TableHead className="text-right">{m.common_actions()}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((marker) => (
							<MarkerTableRow key={marker.id} marker={marker} onOpenEdit={onOpenEdit} onDelete={onDelete} onCopy={onCopy} />
						))}
					</TableBody>
				</Table>
			)}
			renderCard={(marker) => <MarkerMobileCard key={marker.id} marker={marker} onOpenEdit={onOpenEdit} onDelete={onDelete} />}
		/>
	);
}
