import { Pencil } from "lucide-react";
import type { MetadataWithRelation } from "reelvault-sdk";
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
		<Card className="overflow-hidden border-border/80 bg-card shadow-xs">
			<div className="flex flex-col gap-5 p-6 sm:p-7">
				{/* Poster & title details */}
				<div className="flex flex-col gap-5 sm:flex-row sm:items-start">
					<div className="group relative h-36 w-24 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted/40 shadow-sm sm:h-44 sm:w-30">
						<ApiImage
							fileId={poster?.id}
							cacheKey={poster?.updatedAt}
							alt={metadata.title}
							width={120}
							aspectRatio={2 / 3}
							sizes="120px"
							className="h-full w-full object-cover"
						/>
						<button
							type="button"
							onClick={onOpenPosterDialog}
							className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
							title={m.admin_metadata_change_poster()}
						>
							<div className="flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm">
								<Pencil className="size-4" />
							</div>
						</button>
					</div>

					{/* min-w-0 lets the title wrap/truncate instead of stretching the card */}
					<div className="flex min-w-0 flex-1 flex-col gap-2.5">
						<MetadataHeroBadges metadata={metadata} releaseYear={releaseYear} rating={rating} lockedCount={lockedCount} />

						<div>
							<h1 className="wrap-break-word font-bold text-2xl text-foreground tracking-tight sm:text-3xl lg:text-4xl">
								{metadata.title}
							</h1>
							{metadata.originalTitle && metadata.originalTitle !== metadata.title && (
								<p className="mt-1 text-muted-foreground text-sm italic">{metadata.originalTitle}</p>
							)}
						</div>

						{metadata.tagline !== null && (
							<p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
								{m.admin_metadata_quoted_tagline({ tagline: metadata.tagline })}
							</p>
						)}

						<div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
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
				/>
			</div>
		</Card>
	);
}
