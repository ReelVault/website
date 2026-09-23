import { lazy, Suspense } from "react";
import { LazyIdentifyDialog } from "@/components/lazy-dialogs";

const OfflineDownloadDialog = lazy(async () => {
	const mod = await import("@/components/offline-download-dialog");

	return { default: mod.OfflineDownloadDialog };
});

interface DetailsHeaderDialogsProps {
	metadataId: string;
	title: string;
	mediaType: "movie" | "tv_show";
	year?: string | number;
	playableMediaFileId?: string;
	downloadOpen: boolean;
	onDownloadOpenChange: (open: boolean) => void;
	isAdmin?: boolean;
	identifyOpen: boolean;
	onIdentifyOpenChange: (open: boolean) => void;
}

export function DetailsHeaderDialogs({
	metadataId,
	title,
	mediaType,
	year,
	playableMediaFileId,
	downloadOpen,
	onDownloadOpenChange,
	isAdmin,
	identifyOpen,
	onIdentifyOpenChange,
}: DetailsHeaderDialogsProps) {
	return (
		<>
			{playableMediaFileId && downloadOpen && (
				<Suspense fallback={null}>
					<OfflineDownloadDialog open={downloadOpen} onOpenChange={onDownloadOpenChange} mediaFileId={playableMediaFileId} title={title} />
				</Suspense>
			)}

			{isAdmin && identifyOpen && (
				<Suspense fallback={null}>
					<LazyIdentifyDialog
						metadataId={metadataId}
						mediaType={mediaType}
						initialTitle={title}
						initialYear={year === "N/A" || !year ? undefined : Number(year)}
						open={identifyOpen}
						onOpenChange={onIdentifyOpenChange}
					/>
				</Suspense>
			)}
		</>
	);
}
