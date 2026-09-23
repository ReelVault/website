import { AlertTriangle, Copy, FileWarning, Pencil, RefreshCw, ScanSearch, Trash2 } from "lucide-react";
import type { LibraryWithRelations } from "@reelvault/sdk";
import {
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

interface LibraryCardContextMenuProps {
	lib: LibraryWithRelations;
	onScan: (id: string) => void;
	onEdit: (lib: LibraryWithRelations) => void;
	onDelete: (id: string, name: string) => Promise<unknown>;
	onCheckErrors: (libraryPaths: string[]) => void;
	onShowIgnoredAssets: (libraryId: string) => void;
	onShowScanFindings: (libraryId: string) => void;
	onCopyId: (text: string, label: string) => void;
}

export function LibraryCardContextMenu({
	lib,
	onScan,
	onEdit,
	onDelete,
	onCheckErrors,
	onShowIgnoredAssets,
	onShowScanFindings,
	onCopyId,
}: LibraryCardContextMenuProps) {
	return (
		<ContextMenuContent className="w-64 border-border bg-popover shadow-xl">
			<ContextMenuGroup>
				<ContextMenuLabel className="truncate font-bold text-foreground text-xs uppercase tracking-wider">{lib.name}</ContextMenuLabel>
			</ContextMenuGroup>
			<ContextMenuSeparator />
			<ContextMenuGroup>
				<ContextMenuItem onClick={() => onScan(lib.id)} className="cursor-pointer gap-2.5">
					<RefreshCw className="size-4 text-primary" />
					<span>{m.admin_libraries_scan_library()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onEdit(lib)} className="cursor-pointer gap-2.5">
					<Pencil className="size-4 text-muted-foreground" />
					<span>{m.admin_libraries_edit_configuration()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onCopyId(lib.id, m.admin_libraries_library_id())} className="cursor-pointer gap-2.5">
					<Copy className="size-4 text-muted-foreground" />
					<span>{m.admin_libraries_copy_library_id()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onCheckErrors(lib.paths.map((p) => p.path))} className="cursor-pointer gap-2.5">
					<ScanSearch className="size-4 text-primary" />
					<span>{m.admin_libraries_check_error()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onShowIgnoredAssets(lib.id)} className="cursor-pointer gap-2.5">
					<AlertTriangle className="size-4 text-muted-foreground" />
					<span>{m.admin_libraries_skipped_assets()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onShowScanFindings(lib.id)} className="cursor-pointer gap-2.5">
					<FileWarning className="size-4 text-muted-foreground" />
					<span>{m.admin_libraries_needs_attention()}</span>
				</ContextMenuItem>
			</ContextMenuGroup>
			<ContextMenuSeparator />
			<ContextMenuGroup>
				<ContextMenuItem
					onClick={() => detach(onDelete(lib.id, lib.name))}
					className="cursor-pointer gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
				>
					<Trash2 className="size-4" />
					<span>{m.admin_libraries_delete_library()}</span>
				</ContextMenuItem>
			</ContextMenuGroup>
		</ContextMenuContent>
	);
}
