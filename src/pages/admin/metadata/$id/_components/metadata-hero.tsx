import type { MetadataWithRelation } from "@reelvault/sdk";
import { Pencil } from "lucide-react";
import { ApiImage } from "@/components/ui/api-image";
import { Card } from "@/components/ui/card";
import { m } from "@/paraglide/messages";
import { getYearFromDate } from "@/utils/date-utils";
import { formatRating } from "@/utils/format-utils";
import { getMetadataPoster } from "@/utils/metadata-utils";
import { MetadataHeroActions } from "./metadata-hero-actions";
import { MetadataHeroBadges } from "./metadata-hero-badges";

const NO_LOCKED_FIELDS: string[] = [];

export function MetadataHero({
	metadata,
	lockedFields = NO_LOCKED_FIELDS,
	onLockAll,
	onUnlockAll,
	onGeneratePreviews,
	onOpenPosterDialog,
	onOpenIdentifyDialog,
	onOpenMergeDialog,
	onRefresh,
	onRefreshImages,
	onSave,
	onDelete,
	isRefreshing,
	isRefreshingImages,
	isSaving,
	isDeleting,
}: {
	metadata: MetadataWithRelation;
	lockedFields?: string[];
	onLockAll?: () => void;
	onUnlockAll?: () => void;
	onGeneratePreviews?: () => void;
	onOpenPosterDialog: () => void;
	onOpenIdentifyDialog: () => void;
	onOpenMergeDialog: () => void;
	onRefresh: () => void;
	onRefreshImages: () => void;
	onSave: () => void;
	onDelete: () => Promise<unknown>;
	isRefreshing: boolean;
	isRefreshingImages?: boolean;
	isSaving: boolean;
	isDeleting: boolean;
}) {
	const rating = formatRating(metadata.rating.avgScore);
	const releaseYear = metadata.releaseDate ? getYearFromDate(metadata.releaseDate) : "—";
	const poster = getMetadataPoster(metadata);
	const lockedCount = lockedFields.length;

	return (
		<Card variant="subtle" className="overflow-hidden">
			<div className="flex flex-col gap-5 p-6 sm:p-7">
				{/* Poster & title details */}
				<div className="flex flex-col gap-5 sm:flex-row sm:items-start">
					<div className="group border-border/80 bg-muted/40 relative h-36 w-24 shrink-0 overflow-hidden rounded-xl border shadow-sm sm:h-44 sm:w-30">
						<ApiImage
							fileId={poster?.id}
							cacheKey={poster?.updatedAt}
							alt={metadata.title}
							width={120}
							aspectRatio={2 / 3}
							sizes="120px"
							className="w-full object-cover"
						/>
						<button
							type="button"
							onClick={onOpenPosterDialog}
							className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
							title={m.admin_metadata_change_poster()}
						>
							<div className="bg-background/90 text-foreground flex size-9 items-center justify-center rounded-full shadow-sm">
								<Pencil className="size-4" />
							</div>
						</button>
					</div>

					{/* min-w-0 lets the title wrap/truncate instead of stretching the card */}
					<div className="flex min-w-0 flex-1 flex-col gap-2.5">
						<MetadataHeroBadges metadata={metadata} releaseYear={releaseYear} rating={rating} lockedCount={lockedCount} />

						<div>
							<h1 className="text-foreground text-2xl font-bold tracking-tight wrap-break-word sm:text-3xl">{metadata.title}</h1>
							{metadata.originalTitle && metadata.originalTitle !== metadata.title && (
								<p className="text-muted-foreground mt-1 text-sm italic">{metadata.originalTitle}</p>
							)}
						</div>

						{metadata.tagline !== null && (
							<p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
								{m.admin_metadata_quoted_tagline({ tagline: metadata.tagline })}
							</p>
						)}

						<div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
							<span>{m.common_id_label({ id: metadata.id })}</span>
							{metadata.stableKey && <span>{m.admin_metadata_stable_key_value({ key: metadata.stableKey })}</span>}
							{metadata.originCountry && <span>{m.admin_metadata_country_label({ country: metadata.originCountry })}</span>}
						</div>
					</div>
				</div>

				{/* Action toolbar */}
				<MetadataHeroActions
					title={metadata.title}
					isSaving={isSaving}
					isRefreshing={isRefreshing}
					isRefreshingImages={isRefreshingImages}
					isDeleting={isDeleting}
					onSave={onSave}
					onOpenIdentifyDialog={onOpenIdentifyDialog}
					onOpenMergeDialog={onOpenMergeDialog}
					onRefresh={onRefresh}
					onRefreshImages={onRefreshImages}
					onDelete={onDelete}
					onLockAll={onLockAll}
					onUnlockAll={onUnlockAll}
					onGeneratePreviews={onGeneratePreviews}
				/>
			</div>
		</Card>
	);
}
