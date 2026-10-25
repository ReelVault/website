import type { MediaFileWithRelation } from "@reelvault/sdk";

import { Link } from "@tanstack/react-router";
import { Layers, Pencil, Play, Trash2 } from "lucide-react";
import { ConfirmAction } from "@/components/confirm-action";
import {
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { m } from "@/paraglide/messages";

/** Same projection the admin list requests — the menu renders ids/names only. */
type MediaListRow = Pick<MediaFileWithRelation, "id" | "fileName" | "filePath" | "library">;

interface MediaFileListContextMenuProps {
	file: MediaListRow;
	isDeleting: boolean;
	onDelete: (id: string, fileName: string) => Promise<unknown>;
	onOpenReassign: () => void;
}

export function MediaFileListContextMenu({ file, isDeleting, onDelete, onOpenReassign }: MediaFileListContextMenuProps) {
	return (
		<ContextMenuContent className="w-56">
			<ContextMenuGroup>
				<ContextMenuLabel className="truncate">{file.fileName}</ContextMenuLabel>
			</ContextMenuGroup>
			<ContextMenuSeparator />
			<ContextMenuGroup>
				<ContextMenuItem render={<Link to="/admin/media/$id" params={{ id: file.id }} />}>
					<Pencil className="text-muted-foreground size-3.5" />
					<span>{m.admin_media_edit_file()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={onOpenReassign}>
					<Layers className="text-primary size-3.5" />
					<span>{m.components_media_file_change_metadata_assignment()}</span>
				</ContextMenuItem>
				<ContextMenuItem render={<Link to="/player/$id" params={{ id: file.id }} target="_blank" rel="noopener noreferrer" />}>
					<Play className="text-muted-foreground size-3.5" />
					<span>{m.admin_markers_open_player()}</span>
				</ContextMenuItem>
			</ContextMenuGroup>
			<ContextMenuSeparator />
			<ContextMenuGroup>
				<ConfirmAction
					nativeButton={false}
					trigger={
						<ContextMenuItem variant="destructive" disabled={isDeleting}>
							<Trash2 className="size-3.5" />
							<span>{m.admin_logs_delete_file()}</span>
						</ContextMenuItem>
					}
					title={m.admin_media_delete_entry_confirm()}
					description={m.admin_media_entry_detach_notice_short({ fileName: file.fileName })}
					confirmLabel={m.admin_logs_delete_file()}
					onConfirm={() => onDelete(file.id, file.fileName)}
				/>
			</ContextMenuGroup>
		</ContextMenuContent>
	);
}
