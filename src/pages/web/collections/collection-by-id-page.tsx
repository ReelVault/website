import type { CollectionSortMode, MetadataSorting } from "@reelvault/sdk";
import { Layers } from "lucide-react";
import type { ReactNode } from "react";
import { useCollectionDetails } from "@/client/hooks/use-collections";
import { usePlaybackSuggestion } from "@/client/hooks/use-me-playback";
import { useMetadataCollection } from "@/client/hooks/use-metadata-queries";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { CollectionByIdSkeleton } from "./components/collection-by-id-skeleton";
import { CollectionHero } from "./sections/collection-hero";
import { CollectionTimeline } from "./sections/collection-timeline";

const COLLECTION_SORT: Record<
	CollectionSortMode,
	{ sortBy: NonNullable<MetadataSorting["sortBy"]>; sortOrder: "asc" | "desc"; description: string }
> = {
	release_date: {
		sortBy: "releaseDate",
		sortOrder: "asc",
		description: m.web_chronological_collection_description(),
	},
	manual: {
		sortBy: "collectionOrder",
		sortOrder: "asc",
		description: m.web_manual_order_description(),
	},
	alphabetical: {
		sortBy: "title",
		sortOrder: "asc",
		description: m.web_collection_alphabetical_description(),
	},
	recently_added: {
		sortBy: "createdAt",
		sortOrder: "desc",
		description: m.web_collection_newest_description(),
	},
};

export default function CollectionByIdPage({ id = "" }: { id?: string }) {
	const collectionDetailsQuery = useCollectionDetails(id);
	const collection = collectionDetailsQuery.data;
	const sortMode = collection?.sortMode ?? "release_date";
	const sortConfig = COLLECTION_SORT[sortMode];
	const collectionQuery = useMetadataCollection(id, { sortBy: sortConfig.sortBy, sortOrder: sortConfig.sortOrder });
	const items = collectionQuery.data?.data ?? [];

	const firstItem = items[0];
	const { data: streamData } = usePlaybackSuggestion(firstItem?.id ?? "");
	const playableMediaFileId = streamData?.suggestion?.mediaFileId;

	if (collectionQuery.isLoading || collectionDetailsQuery.isLoading) {
		return <CollectionByIdSkeleton />;
	}

	if (collectionDetailsQuery.isError) {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<AppErrorState
					title={m.web_collection_fetch_failed()}
					description={m.web_check_connection()}
					onRetry={() => detach(Promise.all([collectionQuery.refetch(), collectionDetailsQuery.refetch()]))}
					className="max-w-xl"
				/>
			</div>
		);
	}

	let timelineContent: ReactNode;
	if (collectionQuery.isError) {
		timelineContent = (
			<AppErrorState
				title={m.web_collection_fetch_failed()}
				description={m.web_check_connection()}
				onRetry={() => detach(collectionQuery.refetch())}
				className="mx-auto max-w-xl"
			/>
		);
	} else if (items.length === 0) {
		timelineContent = <AppEmptyState icon={Layers} title={m.web_collection_no_titles()} className="mx-auto max-w-xl" />;
	} else {
		timelineContent = <CollectionTimeline items={items} />;
	}

	const collectionName = collectionDetailsQuery.data?.name ?? m.web_collection_fallback_name();
	const posterImages = collectionDetailsQuery.data?.posterImages;

	return (
		<div className="min-h-screen overflow-x-hidden bg-background text-foreground">
			<CollectionHero
				collectionName={collectionName}
				posterImages={posterImages}
				itemsCount={items.length}
				sortDescription={sortConfig.description}
				collectionId={id}
				playableMediaFileId={playableMediaFileId}
				firstItemId={firstItem?.id}
			/>

			{timelineContent}
		</div>
	);
}
