import { Suspense } from "react";
import { useMetadata } from "@/client/hooks/use-metadata-queries";
import { LazyIdentifyDialog } from "@/components/lazy-dialogs";

interface MediaFileReidentifyDialogProps {
	metadataId: string;
	mediaType: "movie" | "tv_show";
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/** Re-identifies the title a media file belongs to; the title is only fetched while the dialog is open. */
export function MediaFileReidentifyDialog(props: MediaFileReidentifyDialogProps) {
	if (!props.open) return null;

	return <ReidentifyDialogContent {...props} />;
}

function ReidentifyDialogContent({ metadataId, mediaType, onOpenChange }: Omit<MediaFileReidentifyDialogProps, "open">) {
	const { data: metadata } = useMetadata(metadataId);

	if (!metadata) return null;

	return (
		<Suspense fallback={null}>
			<LazyIdentifyDialog
				metadataId={metadataId}
				mediaType={mediaType}
				initialTitle={metadata.title}
				initialYear={metadata.releaseDate ? Number(metadata.releaseDate.slice(0, 4)) : undefined}
				open
				onOpenChange={onOpenChange}
			/>
		</Suspense>
	);
}
