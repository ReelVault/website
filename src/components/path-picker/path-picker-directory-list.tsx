import { ChevronRight, CornerLeftUp, Folder } from "lucide-react";
import type { MouseEvent } from "react";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { ScrollArea } from "@/components/ui/scroll-area";
import { m } from "@/paraglide/messages";
import type { AdminFilesystemBrowse, AdminFilesystemDirectory } from "./path-picker-types";

interface PathPickerDirectoryListProps {
	data?: AdminFilesystemBrowse;
	isPending: boolean;
	isError: boolean;
	error: Error | null;
	onRetry: () => void;
	onNavigate: (path: string) => void;
}

export function PathPickerDirectoryList({ data, isPending, isError, error, onRetry, onNavigate }: PathPickerDirectoryListProps) {
	const handleNavigateClick = (event: MouseEvent<HTMLButtonElement>) => {
		const path = event.currentTarget.dataset.path;
		if (path) {
			onNavigate(path);
		}
	};

	return (
		<div className="min-h-0 flex-1 overflow-hidden p-4 sm:p-6 sm:pt-4">
			{isPending && (
				<AppLoadingState label={m.components_path_picker_loading()} className="border-border min-h-64 rounded-xl border border-dashed" />
			)}

			{isError && (
				<AppErrorState
					title={m.components_path_picker_fetch_failed()}
					description={m.components_path_picker_permissions_hint()}
					error={error}
					onRetry={onRetry}
				/>
			)}

			{!(isPending || isError) && (
				<div className="flex flex-col gap-2">
					{/* PARENT LEVEL BUTTON */}
					{data?.parentPath !== null && data?.parentPath !== undefined && (
						<button
							type="button"
							data-path={data.parentPath}
							onClick={handleNavigateClick}
							className="border-border/60 bg-muted/40 text-foreground hover:bg-accent/60 flex w-full items-center gap-3 rounded-xl border p-3 text-xs font-semibold transition-colors"
						>
							<CornerLeftUp className="text-primary size-4 shrink-0" />
							<span>{m.components_path_picker_parent_directory()}</span>
						</button>
					)}

					<ScrollArea className="h-80 w-full p-1.5">
						{data?.directories.length === 0 ? (
							<AppEmptyState title={m.components_path_picker_no_subdirs()} />
						) : (
							<div className="flex flex-col gap-1">
								{data?.directories.map((dir: AdminFilesystemDirectory) => (
									<button
										key={dir.path}
										type="button"
										data-path={dir.path}
										onClick={handleNavigateClick}
										className="group text-foreground hover:bg-accent/70 hover:text-accent-foreground flex w-full items-center justify-between rounded-lg p-2.5 text-xs transition-colors"
									>
										<div className="flex min-w-0 flex-1 items-center gap-3">
											<Folder className="text-primary/80 group-hover:text-primary size-4 shrink-0 transition-transform group-hover:scale-110" />
											<span className="truncate font-mono font-medium">{dir.name}</span>
										</div>
										<ChevronRight className="text-muted-foreground/60 group-hover:text-foreground size-4 transition-transform group-hover:translate-x-0.5" />
									</button>
								))}
							</div>
						)}
					</ScrollArea>
				</div>
			)}
		</div>
	);
}
