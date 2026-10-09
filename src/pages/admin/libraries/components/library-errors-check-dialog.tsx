import type { ReactNode } from "react";
import { useLibraryErrorsCheckStatus } from "@/client/hooks/use-libraries";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { m } from "@/paraglide/messages";

/** Most problematic files the dialog lists; the summary still counts all of them. */
const LISTED_FILE_LIMIT = 200;
/** Longest FFmpeg message shown per file; the full text stays in the stored check result. */
const MESSAGE_PREVIEW_LENGTH = 300;

interface LibraryErrorsCheckDialogProps {
	operationId: string | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

/** The result of a queued FFmpeg error check: progress while it runs, then the files it found problems in. */
export function LibraryErrorsCheckDialog({ operationId, isOpen, onOpenChange }: LibraryErrorsCheckDialogProps) {
	const statusQuery = useLibraryErrorsCheckStatus(operationId);
	const status = statusQuery.data;
	const result = status?.result ?? null;
	const isRunning = !status || status.status === "pending" || status.status === "running";

	let content: ReactNode;
	if (isRunning) {
		content = (
			<p className="text-muted-foreground text-sm">
				{m.admin_libraries_errors_running({ percent: Math.round(status?.progressPercent ?? 0) })}
			</p>
		);
	} else if (result) {
		const listedFiles = result.problematicFiles.slice(0, LISTED_FILE_LIMIT);
		content = (
			<div className="flex flex-col gap-4">
				<p className="text-sm">
					{m.admin_libraries_errors_summary({
						scanned: result.scannedFiles,
						clean: result.cleanFiles,
						problematic: result.problematicFiles.length,
					})}
				</p>
				{result.problematicFiles.length === 0 ? (
					<p className="text-muted-foreground text-sm">{m.admin_libraries_errors_none()}</p>
				) : (
					<ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
						{listedFiles.map((file) => (
							<li key={file.filePath} className="flex flex-col gap-1 rounded-lg border border-border p-3">
								<span className="break-all font-mono text-xs">{file.filePath}</span>
								<span className="whitespace-pre-wrap break-words text-muted-foreground text-xs">
									{file.errors.slice(0, MESSAGE_PREVIEW_LENGTH)}
								</span>
							</li>
						))}
					</ul>
				)}
				{result.problematicFiles.length > LISTED_FILE_LIMIT && (
					<p className="text-muted-foreground text-xs">{m.admin_libraries_errors_truncated({ count: LISTED_FILE_LIMIT })}</p>
				)}
			</div>
		);
	} else {
		content = <p className="text-muted-foreground text-sm">{m.admin_libraries_errors_failed()}</p>;
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>{m.admin_libraries_errors_title()}</DialogTitle>
					<DialogDescription>{m.admin_libraries_errors_description()}</DialogDescription>
				</DialogHeader>
				{content}
			</DialogContent>
		</Dialog>
	);
}
