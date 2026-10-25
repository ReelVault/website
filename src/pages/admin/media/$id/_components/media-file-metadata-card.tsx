import type { MediaFileWithRelation } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { Clapperboard, ExternalLink, Layers, Tv } from "lucide-react";
import type { ReactNode } from "react";
import { useMetadata } from "@/client/hooks/use-metadata-queries";
import { ApiImage } from "@/components/ui/api-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { getYearFromDate } from "@/utils/date-utils";
import { getMetadataPoster } from "@/utils/metadata-utils";

export function MediaFileMetadataCard({ file, onOpenReassign }: { file: MediaFileWithRelation; onOpenReassign: () => void }) {
	const isMovie = file.library.type === "movies";

	const { data: metadata, isLoading } = useMetadata(file.metadataId);

	const poster = getMetadataPoster(metadata);
	const releaseYear = metadata?.releaseDate ? getYearFromDate(metadata.releaseDate) : null;

	let cardBody: ReactNode;
	if (isLoading) {
		cardBody = (
			<div className="flex items-center gap-3">
				<Skeleton className="h-20 w-14" />
				<div className="flex flex-1 flex-col gap-2">
					<Skeleton className="h-4 w-48" />
					<Skeleton className="h-3 w-32" />
				</div>
			</div>
		);
	} else if (metadata) {
		cardBody = (
			<div className="border-border/80 bg-background flex flex-col gap-3 rounded-xl border p-3.5 shadow-xs">
				<div className="flex items-start gap-3">
					<div className="border-border/80 bg-muted/40 relative h-22 w-15 shrink-0 overflow-hidden rounded-lg border shadow-2xs">
						<ApiImage
							fileId={poster?.id}
							cacheKey={poster?.updatedAt}
							alt={metadata.title}
							width={80}
							aspectRatio={2 / 3}
							className="object-cover"
						/>
					</div>

					<div className="flex min-w-0 flex-1 flex-col gap-1">
						<div className="flex flex-wrap items-center gap-1.5">
							<Badge variant={isMovie ? "default" : "secondary"} size="sm" transform="capitalize">
								{isMovie ? <Clapperboard className="size-3" /> : <Tv className="size-3" />}
								<span>{isMovie ? m.common_movie_word() : m.common_series_word()}</span>
							</Badge>
							{releaseYear && (
								<Badge variant="outline" size="sm" font="mono">
									{releaseYear}
								</Badge>
							)}
						</div>

						<h4 className="text-foreground truncate text-sm font-bold tracking-tight">{metadata.title}</h4>

						{metadata.originalTitle && metadata.originalTitle !== metadata.title && (
							<p className="text-muted-foreground truncate text-xs italic">{metadata.originalTitle}</p>
						)}

						{file.episodeId && (
							<p className="text-primary text-xs font-medium">
								{m.admin_media_linked_to_episode({ episodeId: file.episodeId.slice(0, 12) })}
							</p>
						)}
					</div>
				</div>

				<div className="border-border/40 flex items-center justify-between border-t pt-2 text-xs">
					<span className="text-muted-foreground font-mono text-xs">{m.common_short_id({ id: metadata.id.slice(0, 16) })}</span>
					<Button
						variant="primary-ghost"
						size="sm"
						nativeButton={false}
						render={<Link to="/admin/metadata/$id" params={{ id: metadata.id }} />}
					>
						<span>{m.admin_media_open_metadata()}</span>
						<ExternalLink className="size-3" />
					</Button>
				</div>
			</div>
		);
	} else {
		cardBody = (
			<div className="border-border/80 bg-muted/20 rounded-xl border border-dashed p-4 text-center">
				<p className="text-foreground text-xs font-medium">{m.admin_media_no_metadata({ id: file.metadataId })}</p>
				<Button type="button" variant="outline" size="sm" onClick={onOpenReassign} className="mt-2">
					<Layers className="size-3.5" />
					<span>{m.admin_media_assign_to_metadata()}</span>
				</Button>
			</div>
		);
	}

	return (
		<AdminSection
			title={m.admin_media_assigned_metadata()}
			description={m.admin_media_catalog_title_description()}
			actions={
				<Button type="button" variant="outline" size="sm" onClick={onOpenReassign}>
					<Layers className="text-primary size-3.5" />
					<span>{m.admin_media_change_link()}</span>
				</Button>
			}
		>
			{cardBody}
		</AdminSection>
	);
}
