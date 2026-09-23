import { useQuery } from "@tanstack/react-query";
import { Server } from "lucide-react";
import { startTransition, useState } from "react";
import { reelvault } from "@/client/client";
import { adminKeys } from "@/client/utils/query-keys";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { m } from "@/paraglide/messages";
import { PathPickerBreadcrumbs } from "./path-picker/path-picker-breadcrumbs";
import { PathPickerDirectoryList } from "./path-picker/path-picker-directory-list";
import { PathPickerFooter } from "./path-picker/path-picker-footer";
import { PathPickerSearchForm } from "./path-picker/path-picker-search-form";
import type { AdminFilesystemBrowse, AdminFilesystemDirectory } from "./path-picker/path-picker-types";

export type { AdminFilesystemBrowse, AdminFilesystemDirectory };

interface PathPickerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialPath?: string;
	onSelectPath: (path: string) => void;
}

export function PathPickerDialog({ open, onOpenChange, initialPath = "/", onSelectPath }: PathPickerDialogProps) {
	const [activePath, setActivePath] = useState(initialPath || "/");

	// Reset the browsed path each time the dialog opens — adjusting state during
	// render (react.dev "adjusting state when props change") applies it in the
	// same pass as the open flip, without an effect.
	const [wasOpen, setWasOpen] = useState(open);
	if (open !== wasOpen) {
		setWasOpen(open);
		if (open) {
			setActivePath(initialPath.trim() ? initialPath : "/");
		}
	}

	const query = useQuery({
		queryKey: adminKeys.filesystemBrowse(activePath),
		queryFn: async () => {
			return await reelvault.admin.browseFilesystem(activePath);
		},
		enabled: open,
		staleTime: 30_000,
	});

	const handleRetry = (): void => {
		startTransition(async () => {
			await query.refetch();
		});
	};

	const handleNavigate = (path: string) => {
		setActivePath(path);
	};

	const handleCancel = () => {
		onOpenChange(false);
	};

	const handleConfirm = () => {
		onSelectPath(activePath);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90vh] w-full max-w-[calc(100%-2rem)] flex-col overflow-hidden border-border bg-popover p-0 shadow-2xl sm:max-w-2xl sm:rounded-2xl">
				{/* HEADER */}
				<DialogHeader className="shrink-0 border-border border-b bg-muted/30 p-6 pb-4">
					<div className="flex items-center gap-2.5">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
							<Server className="size-5" />
						</div>
						<div className="flex flex-col gap-0.5">
							<DialogTitle className="font-bold text-foreground text-lg tracking-tight">{m.components_path_picker_select()}</DialogTitle>
							<DialogDescription className="text-muted-foreground text-xs">{m.common_browse_server_dirs_hint()}</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				{/* FORMULARZ WYSZUKIWANIA I NAWIGACJI */}
				<div className="flex shrink-0 flex-col gap-3 border-border/60 border-b bg-background/50 p-4 sm:px-6">
					<PathPickerSearchForm key={activePath} activePath={activePath} onNavigate={handleNavigate} />
					<PathPickerBreadcrumbs activePath={activePath} onNavigate={handleNavigate} />
				</div>

				{/* SUBDIRECTORY LIST */}
				<PathPickerDirectoryList
					data={query.data}
					isPending={query.isPending}
					isError={query.isError}
					error={query.error}
					onRetry={handleRetry}
					onNavigate={handleNavigate}
				/>

				{/* FOOTER WITH STATUS AND CONFIRM BUTTON */}
				<PathPickerFooter exists={query.data?.exists} onCancel={handleCancel} onConfirm={handleConfirm} />
			</DialogContent>
		</Dialog>
	);
}
