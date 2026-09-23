import type { MetadataWithRelation } from "reelvault-sdk";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { getMetadataBackdrop, getMetadataPoster } from "@/utils/metadata-utils";
import type { ArtworkKind } from "./metadata-artwork-slot";
import { ArtworkSlot } from "./metadata-artwork-slot";
import { MetadataLockToggle } from "./metadata-lock-toggle";

export function MetadataArtworkSection({
	metadata,
	lockedFields,
	onToggleLock,
	onOpenDialog,
	onRemoveImage,
	isDeletingImage,
}: {
	metadata: MetadataWithRelation;
	lockedFields: string[];
	onToggleLock: (field: string) => void;
	onOpenDialog: (type: ArtworkKind) => void;
	onRemoveImage: (imageId: string) => Promise<unknown>;
	isDeletingImage: boolean;
}) {
	const poster = getMetadataPoster(metadata);
	const backdrop = getMetadataBackdrop(metadata);
	const lockedSet = new Set(lockedFields);
	const isImagesLocked = lockedSet.has("images");

	return (
		<div className="flex flex-col gap-6">
			<AdminSection
				title={m.admin_metadata_poster_2_3()}
				description={m.admin_metadata_poster_description()}
				actions={
					<MetadataLockToggle
						field="posters"
						label={m.admin_metadata_posters()}
						isLocked={isImagesLocked || lockedSet.has("posters") || lockedSet.has("poster")}
						onToggle={onToggleLock}
					/>
				}
			>
				<ArtworkSlot
					kind="poster"
					metadataTitle={metadata.title}
					altSuffix={m.admin_metadata_poster_alt()}
					image={poster}
					aspectClass="aspect-2/3"
					aspectRatio={2 / 3}
					imageWidth={360}
					sizes="(max-width: 1024px) 100vw, 360px"
					changeLabel={m.admin_metadata_change_poster()}
					emptyTitle={m.admin_metadata_select_poster()}
					onOpenDialog={onOpenDialog}
					onRemoveImage={onRemoveImage}
					isDeletingImage={isDeletingImage}
				/>
			</AdminSection>

			<AdminSection
				title={m.admin_metadata_panoramic_backdrop()}
				description={m.admin_metadata_banner_artwork_description()}
				actions={
					<MetadataLockToggle
						field="backdrops"
						label={m.admin_metadata_panoramic_backdrops()}
						isLocked={isImagesLocked || lockedSet.has("backdrops") || lockedSet.has("backdrop")}
						onToggle={onToggleLock}
					/>
				}
			>
				<ArtworkSlot
					kind="backdrop"
					metadataTitle={metadata.title}
					altSuffix={m.admin_metadata_background()}
					image={backdrop}
					aspectClass="aspect-video"
					aspectRatio={16 / 9}
					imageWidth={500}
					sizes="(max-width: 1024px) 100vw, 500px"
					changeLabel={m.admin_metadata_change_background()}
					emptyTitle={m.admin_metadata_select_panoramic_backdrop()}
					onOpenDialog={onOpenDialog}
					onRemoveImage={onRemoveImage}
					isDeletingImage={isDeletingImage}
				/>
			</AdminSection>
		</div>
	);
}
