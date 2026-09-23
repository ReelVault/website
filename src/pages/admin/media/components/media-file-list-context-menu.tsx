import { Link } from "@tanstack/react-router";
import { Layers, Pencil, Play, Trash2 } from "lucide-react";
import type { MediaFileWithRelation } from "reelvault-sdk";
import { ConfirmAction } from "@/components/confirm-action";
import {
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { m } from "@/paraglide/messages";

interface MediaFileListContextMenuProps {
	file: MediaFileWithRelation;
	isDeleting: boolean;
	onDelete: (id: string, fileName: string) => Promise<unknown>;
	onOpenReassign: () => void;
}

export function MediaFileListContextMenu({ file, isDeleting, onDelete, onOpenReassign }: MediaFileListContextMenuProps) {
	return (
		<ContextMenuContent className="w-56">
			<ContextMenuGroup>
				<ContextMenuLabel className="truncate font-semibold text-xs">{file.fileName}</ContextMenuLabel>
			</ContextMenuGroup>
			<ContextMenuSeparator />
			<ContextMenuGroup>
				<ContextMenuItem render={<Link to="/admin/media/$id" params={{ id: file.id }} />} className="gap-2.5">
					<Pencil className="size-3.5 text-muted-foreground" />
					<span>{m.admin_media_edit_file()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={onOpenReassign} className="gap-2.5">
					<Layers className="size-3.5 text-primary" />
					<span>{m.components_media_file_change_metadata_assignment()}</span>
				</ContextMenuItem>
				<ContextMenuItem render={<Link to="/player/$id" params={{ id: file.id }} target="_blank" />} className="gap-2.5">
					<Play className="size-3.5 text-muted-foreground" />
					<span>{m.admin_markers_open_player()}</span>
				</ContextMenuItem>
			</ContextMenuGroup>
			<ContextMenuSeparator />
			<ContextMenuGroup>
				<ConfirmAction
					nativeButton={false}
					trigger={
						<ContextMenuItem variant="destructive" disabled={isDeleting} className="gap-2.5 text-destructive focus:text-destructive">
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
