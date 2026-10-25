import type { LibraryWithRelations } from "@reelvault/sdk";
import { AlertTriangle, Copy, FileWarning, Pencil, RefreshCw, ScanSearch, Trash2, XCircle } from "lucide-react";
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
	onCancelScans: (id: string) => void;
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
	onCancelScans,
	onEdit,
	onDelete,
	onCheckErrors,
	onShowIgnoredAssets,
	onShowScanFindings,
	onCopyId,
}: LibraryCardContextMenuProps) {
	return (
		<ContextMenuContent className="w-64">
			<ContextMenuGroup>
				<ContextMenuLabel className="truncate">{lib.name}</ContextMenuLabel>
			</ContextMenuGroup>
			<ContextMenuSeparator />
			<ContextMenuGroup>
				<ContextMenuItem onClick={() => onScan(lib.id)} className="cursor-pointer">
					<RefreshCw className="text-primary size-4" />
					<span>{m.admin_libraries_scan_library()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onEdit(lib)} className="cursor-pointer">
					<Pencil className="text-muted-foreground size-4" />
					<span>{m.admin_libraries_edit_configuration()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onCopyId(lib.id, m.admin_libraries_library_id())} className="cursor-pointer">
					<Copy className="text-muted-foreground size-4" />
					<span>{m.admin_libraries_copy_library_id()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onCheckErrors(lib.paths.map((p) => p.path))} className="cursor-pointer">
					<ScanSearch className="text-primary size-4" />
					<span>{m.admin_libraries_check_error()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onShowIgnoredAssets(lib.id)} className="cursor-pointer">
					<AlertTriangle className="text-muted-foreground size-4" />
					<span>{m.admin_libraries_skipped_assets()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onCancelScans(lib.id)} className="cursor-pointer">
					<XCircle className="text-muted-foreground size-4" />
					<span>{m.admin_libraries_cancel_scans()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onShowScanFindings(lib.id)} className="cursor-pointer">
					<FileWarning className="text-muted-foreground size-4" />
					<span>{m.admin_libraries_needs_attention()}</span>
				</ContextMenuItem>
			</ContextMenuGroup>
			<ContextMenuSeparator />
			<ContextMenuGroup>
				<ContextMenuItem onClick={() => detach(onDelete(lib.id, lib.name))} variant="destructive" className="cursor-pointer">
					<Trash2 className="size-4" />
					<span>{m.admin_libraries_delete_library()}</span>
				</ContextMenuItem>
			</ContextMenuGroup>
		</ContextMenuContent>
	);
}
