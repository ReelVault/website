import { FolderOpen, HardDrive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { m } from "@/paraglide/messages";
import type { PathField } from "./library-constants";
import { STORAGE_MODE_LABELS } from "./library-constants";

interface LibraryPathInputRowProps {
	path: PathField;
	index: number;
	idPrefix: string;
	canRemove: boolean;
	onUpdate: (index: number, update: Partial<Omit<PathField, "id">>) => void;
	onRemove: (index: number) => void;
	onOpenPicker: (index: number) => void;
}

export function LibraryPathInputRow({ path, index, idPrefix, canRemove, onUpdate, onRemove, onOpenPicker }: LibraryPathInputRowProps) {
	const currentMode = path.metadataStorageMode ?? "default";

	return (
		<div className="flex flex-col gap-3.5 rounded-xl border border-border/80 bg-muted/20 p-4 transition-[border-color,background-color,color,box-shadow] duration-150 hover:border-border/90 hover:bg-muted/30">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<FolderOpen className="size-4 text-primary" />
					<span className="font-semibold text-foreground text-xs uppercase tracking-wide">
						{m.admin_libraries_directory_number({ index: index + 1 })}
					</span>
				</div>
				{canRemove && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => onRemove(index)}
						className="h-7 gap-1 px-2 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive"
					>
						<Trash2 className="size-3.5" />
						<span>{m.common_delete()}</span>
					</Button>
				)}
			</div>

			{/* Path input */}
			<div className="flex flex-col gap-1.5">
				<span className="text-muted-foreground text-xs">{m.admin_libraries_system_path()}</span>
				<div className="flex items-center gap-2">
					<Input
						id={`${idPrefix}-path-${index}`}
						name={`library-path-${index}`}
						autoComplete="off"
						aria-label={m.admin_libraries_directory_path_label({ index: index + 1 })}
						required
						value={path.value}
						onChange={(e) => onUpdate(index, { value: e.target.value })}
						placeholder={m.admin_libraries_path_placeholder()}
						className="h-10 flex-1 bg-background font-mono text-xs sm:text-sm"
					/>
					<Button
						type="button"
						variant="secondary"
						size="default"
						onClick={() => onOpenPicker(index)}
						title={m.admin_libraries_browse_server_folders()}
						aria-label={m.admin_libraries_browse_server_folders()}
						className="h-10 shrink-0 gap-1.5 px-3"
					>
						<FolderOpen className="size-4 text-primary" />
						<span className="hidden font-medium text-xs sm:inline">{m.admin_libraries_browse()}</span>
					</Button>
				</div>
			</div>

			{/* Metadata mode selector */}
			<div className="flex flex-col gap-1.5 border-border/50 border-t pt-2.5">
				<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
					<HardDrive className="size-3.5" />
					<span>{m.admin_libraries_metadata_write_mode()}</span>
				</div>
				<Select
					value={currentMode}
					onValueChange={(value) => {
						if (value === "database" || value === "sidecar" || value === "database_and_sidecar") {
							onUpdate(index, { metadataStorageMode: value });
						} else {
							onUpdate(index, { metadataStorageMode: undefined });
						}
					}}
				>
					<SelectTrigger
						aria-label={m.admin_libraries_metadata_mode_aria({ index: index + 1 })}
						className="h-9 w-full bg-background text-xs"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="w-[calc(100vw-4rem)] sm:w-120">
						<SelectGroup>
							<SelectItem value="default" label={STORAGE_MODE_LABELS.default}>
								<div className="flex flex-col py-0.5">
									<span className="font-medium text-foreground text-xs">{m.admin_libraries_default_server_mode()}</span>
									<span className="text-[11px] text-muted-foreground">{m.admin_libraries_use_global_config()}</span>
								</div>
							</SelectItem>
							<SelectItem value="database" label={STORAGE_MODE_LABELS.database}>
								<div className="flex flex-col py-0.5">
									<span className="font-medium text-foreground text-xs">{m.admin_libraries_mode_database()}</span>
									<span className="text-[11px] text-muted-foreground">{m.admin_libraries_db_storage_note()}</span>
								</div>
							</SelectItem>
							<SelectItem value="sidecar" label={STORAGE_MODE_LABELS.sidecar}>
								<div className="flex flex-col py-0.5">
									<span className="font-medium text-foreground text-xs">{m.admin_libraries_sidecar_mode_label()}</span>
									<span className="text-[11px] text-muted-foreground">{m.admin_libraries_write_nfo_thumbnails()}</span>
								</div>
							</SelectItem>
							<SelectItem value="database_and_sidecar" label={STORAGE_MODE_LABELS.database_and_sidecar}>
								<div className="flex flex-col py-0.5">
									<span className="font-medium text-foreground text-xs">{m.admin_libraries_both_mode_label()}</span>
									<span className="text-[11px] text-muted-foreground">{m.admin_libraries_dual_metadata_sync()}</span>
								</div>
							</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
