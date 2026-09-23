import { cn } from "cn";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import {
	FullscreenDialog,
	FullscreenDialogContent,
	FullscreenDialogDescription,
	FullscreenDialogHeader,
	FullscreenDialogTitle,
} from "@/components/fullscreen-dialog";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { formatBytes } from "./plugin-upload-progress";

const ACCEPTED_EXTENSIONS = [".zip", ".tar", ".tgz", ".gz"] as const;

function isAcceptedArchive(file: File): boolean {
	const name = file.name.toLowerCase();

	return ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension));
}

interface PluginUploadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Starts the upload queue for the picked/dropped files. */
	onInstall: (files: File[]) => void;
	isBusy: boolean;
}

/**
 * Plugin archive install dialog: pick files with the picker or drop them onto
 * the dropzone (native HTML5 drag & drop — dnd-kit only handles in-app element
 * dragging, not OS file drops). Nothing uploads until the user confirms with
 * "Zainstaluj".
 */
export function PluginUploadDialog({ open, onOpenChange, onInstall, isBusy }: PluginUploadDialogProps) {
	const [selectedFiles, setSelectedFiles] = useState<Array<{ id: string; file: File }>>([]);
	const [skippedCount, setSkippedCount] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const addFiles = (incoming: FileList | File[]) => {
		const accepted: Array<{ id: string; file: File }> = [];
		let skipped = 0;
		for (const file of incoming) {
			if (isAcceptedArchive(file)) accepted.push({ id: `${file.name}-${file.size}-${Date.now()}-${accepted.length}`, file });
			else skipped += 1;
		}

		if (accepted.length > 0) setSelectedFiles((previous) => [...previous, ...accepted]);

		setSkippedCount((previous) => previous + skipped);
	};

	const handleClose = (next: boolean) => {
		if (!next) {
			setSelectedFiles([]);
			setSkippedCount(0);
			setIsDragging(false);
		}

		onOpenChange(next);
	};

	const removeFile = (id: string) => {
		setSelectedFiles((previous) => previous.filter((entry) => entry.id !== id));
	};

	const handleInstall = () => {
		if (selectedFiles.length === 0 || isBusy) return;

		onInstall(selectedFiles.map((entry) => entry.file));
		handleClose(false);
	};

	const handleDragLeave = (event: React.DragEvent<HTMLButtonElement>) => {
		event.preventDefault();
		// Moving across the dropzone's own children also fires dragleave — only
		// clear the highlight when the pointer truly left the zone.
		if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;

		setIsDragging(false);
	};

	return (
		<FullscreenDialog open={open} onOpenChange={handleClose}>
			<FullscreenDialogContent className="max-h-[85vh] w-full max-w-2xl overflow-y-auto">
				<FullscreenDialogHeader>
					<FullscreenDialogTitle>{m.admin_plugins_upload_dialog_title()}</FullscreenDialogTitle>
					<FullscreenDialogDescription>{m.admin_plugins_upload_dialog_description()}</FullscreenDialogDescription>
				</FullscreenDialogHeader>

				<div className="flex flex-col items-center gap-3">
					<button
						type="button"
						className={cn(
							"flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
							isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/40",
						)}
						onClick={() => inputRef.current?.click()}
						onDragOver={(event) => {
							event.preventDefault();
							setIsDragging(true);
						}}
						onDragLeave={handleDragLeave}
						onDrop={(event) => {
							event.preventDefault();
							setIsDragging(false);
							if (event.dataTransfer.files.length > 0) addFiles(event.dataTransfer.files);
						}}
					>
						<Upload className={cn("size-8 text-muted-foreground", { "text-primary": isDragging })} aria-hidden="true" />
						<span className="font-medium text-foreground text-sm">{m.admin_plugins_upload_dropzone()}</span>
						<span className="text-muted-foreground text-xs">{m.admin_plugins_upload_dropzone_or()}</span>
					</button>
					<input
						ref={inputRef}
						type="file"
						multiple
						accept=".zip,.tar,.tgz,.gz"
						className="hidden"
						onChange={(event) => {
							// Copy the live FileList before the reset clears it in place.
							const selected = event.target.files ? [...event.target.files] : [];
							event.target.value = "";
							if (selected.length > 0) addFiles(selected);
						}}
					/>
				</div>

				{skippedCount > 0 && (
					<p className="text-destructive text-xs">{m.admin_plugins_upload_unsupported_skipped({ count: skippedCount })}</p>
				)}

				{selectedFiles.length > 0 && (
					<div className="flex flex-col gap-2">
						<span className="font-semibold text-foreground text-sm">
							{m.admin_plugins_upload_selected_title({ count: selectedFiles.length })}
						</span>
						{selectedFiles.map((entry) => (
							<div key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2">
								<span className="min-w-0 flex-1 truncate text-sm" title={entry.file.name}>
									{entry.file.name}
								</span>
								<span className="shrink-0 font-mono text-muted-foreground text-xs">{formatBytes(entry.file.size)}</span>
								<Button type="button" variant="ghost" size="icon-sm" aria-label={m.common_delete()} onClick={() => removeFile(entry.id)}>
									<X className="size-4" />
								</Button>
							</div>
						))}
					</div>
				)}

				<div className="flex items-center justify-end gap-2 pt-2">
					<Button type="button" variant="outline" onClick={() => handleClose(false)}>
						{m.common_cancel()}
					</Button>
					<Button type="button" disabled={selectedFiles.length === 0 || isBusy} onClick={handleInstall}>
						<Upload className="size-4" aria-hidden="true" />
						{m.admin_plugins_catalog_install()}
					</Button>
				</div>
			</FullscreenDialogContent>
		</FullscreenDialog>
	);
}
