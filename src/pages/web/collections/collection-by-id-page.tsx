import type { CollectionSortMode, MetadataSorting } from "@reelvault/sdk";
import { useCollectionDetails } from "@/client/hooks/use-collections";
import { usePlaybackSuggestion } from "@/client/hooks/use-me-playback";
import { useMetadataCollection } from "@/client/hooks/use-metadata-queries";
import { Button } from "@/components/ui/button";
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

	if (collectionQuery.isError || collectionDetailsQuery.isError) {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<div role="alert" className="cinema-surface max-w-xl p-6 text-center">
					<p className="font-semibold">{m.admin_collections_failed_to_fetch()}</p>
					<p className="mt-1 text-muted-foreground text-sm">{m.web_check_connection()}</p>
					<Button
						type="button"
						variant="outline"
						className="mt-4"
						onClick={() => {
							detach(Promise.all([collectionQuery.refetch(), collectionDetailsQuery.refetch()]));
						}}
					>
						{m.common_try_again()}
					</Button>
				</div>
			</div>
		);
	}

	const collectionName = collectionDetailsQuery.data?.name ?? "Kolekcja";
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

			<CollectionTimeline items={items} />
		</div>
	);
}
