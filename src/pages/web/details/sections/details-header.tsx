import { useState } from "react";
import type { MetadataWithRelation, RequireFields } from "@reelvault/sdk";
import { useRefreshMetadata, useRefreshMetadataImages } from "@/client/hooks/use-admin-metadata";
import { useDetailsView } from "@/client/hooks/use-metadata-queries";
import { PageContainer } from "@/components/page-container";
import { SimpleAnimation } from "@/components/simple-animation";
import { ApiImage } from "@/components/ui/api-image";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { PluginSlotHost } from "@/plugin-host/slot-host";
import { copyToClipboard } from "@/utils/clipboard-utils";
import { getYearFromDate } from "@/utils/date-utils";
import { getMetadataBackdrop, getMetadataPoster } from "@/utils/metadata-utils";
import { DetailsHeaderDesktopTitle } from "../components/details-header-desktop-title";
import { DetailsHeaderDialogs } from "../components/details-header-dialogs";
import { DetailsHeaderMenu } from "../components/details-header-menu";
import { DetailsHeaderMobile } from "../components/details-header-mobile";
import { DetailsHeaderPoster } from "../components/details-header-poster";
import { DetailsHeaderSpecs } from "../components/details-header-specs";
import { extractDirectors, extractStudios } from "../components/details-header-utils";
import { DetailsPlayButton } from "../components/details-play-button";
import { DetailsUserRating } from "../components/details-user-rating";
import { DetailsWatchlistButton } from "../components/details-watchlist-button";

const handleCopyLink = async () => {
	await copyToClipboard(window.location.href, m.components_collection_card_title_link());
};

export default function DetailsHeader({
	metadata,
	isAdmin,
}: {
	metadata: RequireFields<
		MetadataWithRelation,
		"id,originalTitle,type,title,overview,releaseDate,rating,genres.id,genres.name,images.imageType,images.data.id,images.data.updatedAt,crew.job,crew.data.id,crew.data.name,companies.id,companies.name,providers.id,providers.name,providers.externalId,providers.type,keywords.id,keywords.name"
	>;
	isAdmin?: boolean;
}) {
	const [identifyOpen, setIdentifyOpen] = useState(false);
	const [downloadOpen, setDownloadOpen] = useState(false);
	const refreshMetadataMutation = useRefreshMetadata();
	const refreshImagesMutation = useRefreshMetadataImages();

	// Smart play comes with the composite details payload — no extra request.
	const { data: view } = useDetailsView(metadata.id);
	const playableMediaFileId = view?.smartPlay?.mediaFileId;

	const backdrop = getMetadataBackdrop(metadata);
	const primary = getMetadataPoster(metadata);
	const year = getYearFromDate(metadata.releaseDate);

	const directors = extractDirectors(metadata.crew);
	const studios = extractStudios(metadata.companies);

	const handleCopyId = async () => {
		await copyToClipboard(metadata.id, m.components_copy_metadata_id());
	};

	return (
		<div className="relative overflow-hidden lg:min-h-[80vh]">
			{/* Background with Gradient */}
			<div className="absolute inset-0">
				<ApiImage
					fileId={backdrop?.id}
					cacheKey={backdrop?.updatedAt}
					alt=""
					fill
					priority
					sizes="100vw"
					className="size-full object-cover opacity-25"
				/>
				<div className="absolute inset-0 bg-linear-to-b from-background/90 via-background/70 to-background" />
				<div className="absolute inset-0 bg-linear-to-r from-background via-transparent to-background/30" />
			</div>

			{/* Main Content */}
			<PageContainer className="relative pt-24 pb-12 lg:pt-32">
				<div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
					{/* Compact mobile header: mini poster + title and genres */}
					<DetailsHeaderMobile
						title={metadata.title}
						originalTitle={metadata.originalTitle}
						posterId={primary?.id}
						posterUpdatedAt={primary?.updatedAt}
						avgScore={metadata.rating.avgScore}
						year={year}
						genres={metadata.genres}
					/>

					{/* Left: Poster */}
					<DetailsHeaderPoster
						metadataId={metadata.id}
						title={metadata.title}
						posterId={primary?.id}
						posterUpdatedAt={primary?.updatedAt}
						rating={metadata.rating}
					/>

					{/* Right: Content */}
					<SimpleAnimation direction="right" delay={100} className="flex-1">
						{/* Title & Genres (Desktop) */}
						<DetailsHeaderDesktopTitle
							title={metadata.title}
							originalTitle={metadata.originalTitle}
							year={year}
							genres={metadata.genres}
							metadataId={metadata.id}
						/>

						{/* Action Buttons & Rating */}
						<div className="mb-8 flex flex-wrap items-center gap-3">
							<DetailsPlayButton metadataId={metadata.id} />
							<DetailsWatchlistButton metadataId={metadata.id} />
							<PluginSlotHost
								name="details-action-bar"
								buttonClassName="h-9"
								params={{
									metadataId: metadata.id,
									title: metadata.title,
									mediaType: metadata.type === "tv_show" ? "tv_show" : "movie",
									year: year === "N/A" ? "" : String(year),
								}}
							/>

							{/* Actions / Admin tools dropdown */}
							<DetailsHeaderMenu
								metadataId={metadata.id}
								playableMediaFileId={playableMediaFileId}
								isAdmin={isAdmin}
								pluginParams={{
									metadataId: metadata.id,
									title: metadata.title,
									mediaType: metadata.type === "tv_show" ? "tv_show" : "movie",
									year: year === "N/A" ? "" : String(year),
								}}
								onCopyLink={() => {
									detach(handleCopyLink());
								}}
								onDownloadOpen={() => setDownloadOpen(true)}
								onRefreshMetadata={() => refreshMetadataMutation.mutate(metadata.id)}
								onRefreshImages={() => refreshImagesMutation.mutate(metadata.id)}
								onIdentifyOpen={() => setIdentifyOpen(true)}
								onCopyId={() => {
									detach(handleCopyId());
								}}
							/>
						</div>

						{/* Mobile: user rating under the actions (desktop: under the poster) */}
						<div className="mb-8 lg:hidden">
							<DetailsUserRating metadataId={metadata.id} />
						</div>

						{/* Overview */}
						<div className="max-w-3xl">
							<h2 className="mb-3 font-bold text-foreground text-lg">{m.admin_metadata_plot_description()}</h2>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								{metadata.overview ?? m.web_metadata_overview_no_description()}
							</p>
						</div>

						{/* Specs Grid */}
						<DetailsHeaderSpecs
							directors={directors}
							studios={studios}
							keywords={metadata.keywords}
							providers={metadata.providers}
							mediaType={metadata.type === "tv_show" ? "tv_show" : "movie"}
						/>
					</SimpleAnimation>
				</div>
			</PageContainer>

			{/* Dialogi akcyjne (lazy) */}
			<DetailsHeaderDialogs
				metadataId={metadata.id}
				title={metadata.title}
				mediaType={metadata.type === "tv_show" ? "tv_show" : "movie"}
				year={year}
				playableMediaFileId={playableMediaFileId}
				downloadOpen={downloadOpen}
				onDownloadOpenChange={setDownloadOpen}
				isAdmin={isAdmin}
				identifyOpen={identifyOpen}
				onIdentifyOpenChange={setIdentifyOpen}
			/>
		</div>
	);
}
