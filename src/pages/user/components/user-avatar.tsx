import { useState } from "react";
import { FullscreenDialog, FullscreenDialogTrigger } from "@/components/fullscreen-dialog";
import { Button } from "@/components/ui/button";
import { AvatarPickerDialogContent } from "./avatar/avatar-dialog-content";
import { AvatarDisplay } from "./avatar/avatar-display";

export function AvatarPicker({
	currentAvatar,
	onSave,
	onUpload,
}: {
	currentAvatar?: string;
	onSave?: (newAvatar: string) => Promise<void> | void;
	/** Uploads the file to the server and returns the persisted avatar URL. */
	onUpload?: (file: File) => Promise<string>;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<FullscreenDialog open={isOpen} onOpenChange={setIsOpen}>
			<FullscreenDialogTrigger render={<Button size="inline" type="button" variant="ghost" className="group relative sm:min-h-8" />}>
				<AvatarDisplay currentAvatar={currentAvatar} size="lg" editable />
			</FullscreenDialogTrigger>

			{isOpen && (
				<AvatarPickerDialogContent currentAvatar={currentAvatar} onClose={() => setIsOpen(false)} onSave={onSave} onUpload={onUpload} />
			)}
		</FullscreenDialog>
	);
}
