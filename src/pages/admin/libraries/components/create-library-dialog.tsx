import { FullscreenDialog, FullscreenDialogContent } from "@/components/fullscreen-dialog";
import { CreateLibraryForm } from "./create-library-form";

export function CreateLibraryDialog({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
	return (
		<FullscreenDialog open={isOpen} onOpenChange={onOpenChange}>
			<FullscreenDialogContent className="max-h-[92vh] w-full max-w-3xl gap-6 overflow-y-auto p-6">
				{isOpen && <CreateLibraryForm onClose={() => onOpenChange(false)} />}
			</FullscreenDialogContent>
		</FullscreenDialog>
	);
}
