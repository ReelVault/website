import { useState } from "react";
import { FullscreenDialog, FullscreenDialogTrigger } from "@/components/fullscreen-dialog";
import { Button } from "@/components/ui/button";
import type { AvatarPickerSize } from "./avatar/avatar-constants";
import { AvatarPickerDialogContent } from "./avatar/avatar-dialog-content";
import { AvatarDisplay } from "./avatar/avatar-display";

export function AvatarPicker({
	currentAvatar,
	onSave,
	onUpload,
	size = "lg",
	editable = true,
}: {
	currentAvatar?: string;
	onSave?: (newAvatar: string) => Promise<void> | void;
	/** Uploads the file to the server and returns the persisted avatar URL. */
	onUpload?: (file: File) => Promise<string>;
	size?: AvatarPickerSize;
	editable?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<FullscreenDialog open={isOpen} onOpenChange={setIsOpen}>
			<FullscreenDialogTrigger
				disabled={!editable}
				render={<Button type="button" variant="ghost" className="group relative h-auto rounded-[2rem] p-0" />}
			>
				<AvatarDisplay currentAvatar={currentAvatar} size={size} editable={editable} />
			</FullscreenDialogTrigger>

			{isOpen && (
				<AvatarPickerDialogContent currentAvatar={currentAvatar} onClose={() => setIsOpen(false)} onSave={onSave} onUpload={onUpload} />
			)}
		</FullscreenDialog>
	);
}
