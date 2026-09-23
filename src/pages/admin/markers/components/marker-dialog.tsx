import type { MediaMarker, MediaMarkerType } from "@reelvault/sdk";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { m } from "@/paraglide/messages";
import { MarkerDialogForm } from "./marker-dialog-form";

export interface MarkerFormData {
	mediaFileId: string;
	type: MediaMarkerType;
	startSeconds: number;
	endSeconds: number;
	label?: string;
}

interface MarkerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingMarker: MediaMarker | null;
	isPending: boolean;
	onSubmit: (data: MarkerFormData) => Promise<void>;
}

export function MarkerDialog({ open, onOpenChange, editingMarker, isPending, onSubmit }: MarkerDialogProps) {
	const isCreating = !editingMarker;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{isCreating ? m.admin_markers_add() : m.admin_markers_editing()}</DialogTitle>
					<DialogDescription>{isCreating ? m.admin_markers_new_marker_params() : m.admin_markers_edit_segment_params()}</DialogDescription>
				</DialogHeader>

				{open && (
					<MarkerDialogForm
						key={editingMarker?.id ?? "new"}
						editingMarker={editingMarker}
						isPending={isPending}
						onSubmit={onSubmit}
						onCancel={() => onOpenChange(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}
