import { lazy, Suspense } from "react";
import { LazyIdentifyDialog } from "@/components/lazy-dialogs";

const MediaFilesDetailsDialog = lazy(async () => {
	const mod = await import("@/components/media-files-details-dialog");

	return { default: mod.MediaFilesDetailsDialog };
});

interface MetadataCardDialogsProps {
	metadataId: string;
	title: string;
	mediaType: "movie" | "tv_show";
	year?: string | number;
	fileDetailsOpen: boolean;
	onFileDetailsOpenChange: (open: boolean) => void;
	isAdmin: boolean;
	identifyOpen: boolean;
	onIdentifyOpenChange: (open: boolean) => void;
}

export function MetadataCardDialogs({
	metadataId,
	title,
	mediaType,
	year,
	fileDetailsOpen,
	onFileDetailsOpenChange,
	isAdmin,
	identifyOpen,
	onIdentifyOpenChange,
}: MetadataCardDialogsProps) {
	return (
		<>
			{fileDetailsOpen && (
				<Suspense fallback={null}>
					<MediaFilesDetailsDialog open={fileDetailsOpen} onOpenChange={onFileDetailsOpenChange} metadataId={metadataId} title={title} />
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
