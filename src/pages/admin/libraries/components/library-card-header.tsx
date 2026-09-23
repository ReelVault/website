import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import {
	AlertTriangle,
	Check,
	Clapperboard,
	Copy,
	FileVideo,
	FileWarning,
	MoreVertical,
	Pencil,
	RefreshCw,
	ScanSearch,
	Trash2,
	Tv,
} from "lucide-react";
import type { LibraryWithRelations } from "@reelvault/sdk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { formatStorageMode } from "./library-card-utils";

interface LibraryCardHeaderProps {
	lib: LibraryWithRelations;
	onScan: (id: string) => void;
	onEdit: (lib: LibraryWithRelations) => void;
	onDelete: (id: string, name: string) => Promise<unknown>;
	onCheckErrors: (libraryPaths: string[]) => void;
	onShowIgnoredAssets: (libraryId: string) => void;
	onShowScanFindings: (libraryId: string) => void;
}

export function LibraryCardHeader({
	lib,
	onScan,
	onEdit,
	onDelete,
	onCheckErrors,
	onShowIgnoredAssets,
	onShowScanFindings,
}: LibraryCardHeaderProps) {
	const { hasCopied, copy } = useCopyToClipboard();
	const isMovie = lib.type === "movies";
	const globalStorageMode = formatStorageMode(lib.metadataStorageMode);

	const handleCopyId = () => copy(lib.id, m.admin_libraries_library_id());

	return (
		<CardHeader className="flex flex-row items-start justify-between gap-4 p-5 pb-4">
			<div className="flex min-w-0 items-center gap-3.5">
				<div
					className={cn(
						"flex size-11 shrink-0 items-center justify-center rounded-xl border font-semibold shadow-xs",
						isMovie
							? "border-primary/20 bg-primary/10 text-primary"
							: "border-secondary-foreground/20 bg-secondary/20 text-secondary-foreground",
					)}
				>
					{isMovie ? <Clapperboard className="size-5" /> : <Tv className="size-5" />}
				</div>

				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="truncate font-semibold text-foreground text-lg tracking-tight sm:text-xl">{lib.name}</h2>
						<Badge variant={isMovie ? "default" : "secondary"} size="sm" className="font-medium capitalize">
							{isMovie ? m.admin_libraries_type_movies() : m.admin_libraries_type_series()}
						</Badge>
						{globalStorageMode && (
							<Badge variant="outline" size="sm" className="text-[11px] text-muted-foreground">
								{globalStorageMode}
							</Badge>
						)}
					</div>
					<div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground/80">
						<span>{m.common_short_id({ id: lib.id.slice(0, 16) })}</span>
						<button
							type="button"
							onClick={() => {
								detach(handleCopyId());
							}}
							className="inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground/60 hover:text-foreground"
							title={m.admin_libraries_copy_full_id()}
							aria-label={m.admin_libraries_copy_full_id()}
						>
							{hasCopied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
						</button>
					</div>
				</div>
			</div>

			{/* Quick actions top right */}
			<div className="flex shrink-0 items-center gap-1.5">
				<Button
					variant="outline"
					size="sm"
					className="h-8 gap-1.5 px-2.5 text-xs"
					nativeButton={false}
					render={<Link to="/admin/media" search={{ libraryId: lib.id }} />}
					title={m.admin_libraries_show_files()}
				>
					<FileVideo className="size-3.5 text-primary" />
					<span className="hidden sm:inline">{m.admin_libraries_files_word()}</span>
				</Button>

				<Button
					variant="outline"
					size="sm"
					className="h-8 gap-1.5 px-2.5 text-xs"
					onClick={() => onEdit(lib)}
					title={m.admin_libraries_edit_library()}
					aria-label={m.admin_libraries_edit_named({ name: lib.name })}
				>
					<Pencil className="size-3.5 text-muted-foreground" />
					<span className="hidden sm:inline">{m.common_edit()}</span>
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="ghost" size="icon" className="size-8" aria-label={m.plugins_bugs_more_options()}>
								<MoreVertical className="size-4 text-muted-foreground" />
							</Button>
						}
					/>
					<DropdownMenuContent align="end" className="w-52">
						<DropdownMenuGroup>
							<DropdownMenuLabel className="font-semibold text-xs">{lib.name}</DropdownMenuLabel>
							<DropdownMenuSeparator />
						</DropdownMenuGroup>
						<DropdownMenuGroup>
							<DropdownMenuItem onClick={() => onScan(lib.id)} className="gap-2.5">
								<RefreshCw className="size-3.5 text-primary" />
								<span>{m.admin_libraries_scan_library()}</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onEdit(lib)} className="gap-2.5">
								<Pencil className="size-3.5 text-muted-foreground" />
								<span>{m.admin_libraries_edit_configuration()}</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									detach(handleCopyId());
								}}
								className="gap-2.5"
							>
								<Copy className="size-3.5 text-muted-foreground" />
								<span>{m.common_copy_id()}</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onCheckErrors(lib.paths.map((p) => p.path))} className="gap-2.5">
								<ScanSearch className="size-3.5 text-primary" />
								<span>{m.admin_libraries_check_error()}</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onShowIgnoredAssets(lib.id)} className="gap-2.5">
								<AlertTriangle className="size-3.5 text-muted-foreground" />
								<span>{m.admin_libraries_skipped_assets()}</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onShowScanFindings(lib.id)} className="gap-2.5">
								<FileWarning className="size-3.5 text-muted-foreground" />
								<span>{m.admin_libraries_needs_attention()}</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() => {
									detach(onDelete(lib.id, lib.name));
								}}
								className="gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
							>
								<Trash2 className="size-3.5" />
								<span>{m.admin_libraries_delete_library()}</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</CardHeader>
	);
}
