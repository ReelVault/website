import type { LibraryWithRelations } from "reelvault-sdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EditLibraryForm } from "./edit-library-form";

export function EditLibraryDialog({
	library,
	isOpen,
	onOpenChange,
}: {
	library: LibraryWithRelations | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[92vh] w-full gap-6 overflow-y-auto p-6 sm:max-w-2xl sm:p-8 lg:max-w-3xl">
				{library && <EditLibraryForm key={library.id} library={library} onClose={() => onOpenChange(false)} />}
			</DialogContent>
		</Dialog>
	);
}
