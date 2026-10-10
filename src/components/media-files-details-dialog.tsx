import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { isAdminUser } from "@/components/auth/admin-access";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MediaFilesDialogHeader } from "./media-files/media-files-dialog-header";
import { MediaFilesList } from "./media-files/media-files-list";
import { useMediaFiles } from "./media-files/use-media-files";
import { useMediaFilesRefresh } from "./media-files/use-media-files-refresh";

interface MediaFilesDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	metadataId?: string;
	episodeId?: string;
	title?: string;
}

export function MediaFilesDetailsDialog({ open, onOpenChange, metadataId, episodeId, title }: MediaFilesDetailsDialogProps) {
	const { query, files, filteredFiles, searchQuery, setSearchQuery, retry } = useMediaFiles({
		metadataId,
		episodeId,
		enabled: open,
	});
	const refresh = useMediaFilesRefresh({ metadataId, episodeId });
	const { user } = useCurrentUser();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90vh] w-full max-w-[calc(100%-2rem)] flex-col overflow-hidden border-border bg-popover p-0 shadow-2xl sm:max-w-4xl sm:rounded-2xl">
				{/* HEADER */}
				<MediaFilesDialogHeader
					filesCount={files.length}
					title={title}
					isAdmin={isAdminUser(user)}
					episodeId={episodeId}
					metadataId={metadataId}
					{...refresh}
				/>

				<MediaFilesList
					isPending={query.isPending}
					isError={query.isError}
					error={query.error}
					files={files}
					filteredFiles={filteredFiles}
					metadataId={metadataId}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					onRetry={retry}
				/>
			</DialogContent>
		</Dialog>
	);
}
