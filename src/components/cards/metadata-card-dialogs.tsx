import { Suspense } from "react";
import { LazyIdentifyDialog } from "@/components/lazy-dialogs";

interface MetadataCardDialogsProps {
	metadataId: string;
	title: string;
	mediaType: "movie" | "tv_show";
	year?: string | number;
	isAdmin: boolean;
	identifyOpen: boolean;
	onIdentifyOpenChange: (open: boolean) => void;
}

export function MetadataCardDialogs({
	metadataId,
	title,
	mediaType,
	year,
	isAdmin,
	identifyOpen,
	onIdentifyOpenChange,
}: MetadataCardDialogsProps) {
	return (
		<>
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
