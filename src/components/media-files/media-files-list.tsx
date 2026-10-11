import type { MediaFileWithRelation } from "@reelvault/sdk";
import { Search } from "lucide-react";
import type { ChangeEvent } from "react";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { LazyRender } from "@/components/lazy-render";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { m } from "@/paraglide/messages";
import { MediaFileCard } from "./media-file-card";

interface MediaFilesListProps {
	isPending: boolean;
	isError: boolean;
	error: Error | null;
	files: MediaFileWithRelation[];
	filteredFiles: MediaFileWithRelation[];
	metadataId?: string;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	onRetry: () => void;
}

/** Search bar, loading, error and empty states, and the scrollable file cards. Shared by the files dialog and page. */
export function MediaFilesList({
	isPending,
	isError,
	error,
	files,
	filteredFiles,
	metadataId,
	searchQuery,
	onSearchChange,
	onRetry,
}: MediaFilesListProps) {
	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
		onSearchChange(event.target.value);
	};

	const hasLoaded = !(isPending || isError);

	return (
		<>
			{/* SEARCH BAR (when there are many files, e.g. in a series) */}
			{files.length > 2 && (
				<div className="shrink-0 border-border/60 border-b bg-background/50 px-6 py-3">
					<div className="relative">
						<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							leadingIcon
							type="text"
							placeholder={m.components_media_files_search_placeholder()}
							value={searchQuery}
							onChange={handleSearchChange}
							className=""
						/>
					</div>
				</div>
			)}

			<div className="min-h-0 flex-1 overflow-hidden p-6 pt-4">
				{isPending && (
					<AppLoadingState label={m.components_media_files_loading()} className="min-h-48 rounded-xl border border-border border-dashed" />
				)}

				{isError && (
					<AppErrorState
						title={m.components_media_files_fetch_failed()}
						description={m.components_media_files_server_error()}
						error={error}
						onRetry={onRetry}
					/>
				)}

				{hasLoaded && files.length === 0 && <AppEmptyState title={m.components_media_files_none_assigned()} />}

				{hasLoaded && filteredFiles.length === 0 && files.length > 0 && <AppEmptyState title={m.components_media_files_no_matches()} />}

				{hasLoaded && filteredFiles.length > 0 && (
					<ScrollArea className="h-[60vh] w-full pr-3">
						<div className="flex flex-col gap-4 pb-4">
							{filteredFiles.map((file) => (
								<LazyRender key={file.id} minHeight={80}>
									{() => <MediaFileCard file={file} metadataId={metadataId} />}
								</LazyRender>
							))}
						</div>
					</ScrollArea>
				)}
			</div>
		</>
	);
}
