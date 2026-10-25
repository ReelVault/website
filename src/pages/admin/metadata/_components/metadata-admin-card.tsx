import type { MetadataWithRelation } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Clapperboard, Copy, ImageDown, Pencil, RefreshCw, Star, Trash2, Tv } from "lucide-react";
import { useRefreshMetadata, useRefreshMetadataImages } from "@/client/hooks/use-admin-metadata";
import { ConfirmAction } from "@/components/confirm-action";
import { ApiImage } from "@/components/ui/api-image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { copyToClipboard } from "@/utils/clipboard-utils";
import { getYearFromDate } from "@/utils/date-utils";
import { formatRating } from "@/utils/format-utils";
import { getMetadataPoster } from "@/utils/metadata-utils";

interface MetadataAdminCardProps {
	item: MetadataWithRelation;
	isOrphanView?: boolean;
	isDeleting: boolean;
	onDelete: (id: string, title: string) => Promise<unknown>;
	selected: boolean;
	onToggleSelect: (id: string) => void;
}

export function MetadataAdminCard({ item, isOrphanView, isDeleting, onDelete, selected, onToggleSelect }: MetadataAdminCardProps) {
	const poster = getMetadataPoster(item);
	const rating = formatRating(item.rating.avgScore);
	const isMovie = item.type === "movie";
	const year = item.releaseDate ? getYearFromDate(item.releaseDate) : "—";
	const lowConfidence = item.matchScore !== null && item.matchScore < 0.75;
	const refreshMetadataMutation = useRefreshMetadata();
	const refreshImagesMutation = useRefreshMetadataImages();

	const copyId = () => {
		detach(copyToClipboard(item.id, m.components_copy_metadata_id()));
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger className="group relative flex cursor-pointer flex-col">
				<label className="bg-background/85 absolute top-2 right-2 z-10 flex size-7 cursor-pointer items-center justify-center rounded-md backdrop-blur-sm">
					<input
						type="checkbox"
						className="accent-primary size-4"
						checked={selected}
						onChange={() => onToggleSelect(item.id)}
						aria-label={m.admin_metadata_select_title({ title: item.title })}
					/>
				</label>
				<Link
					to="/admin/metadata/$id"
					params={{ id: item.id }}
					className="bg-card ring-primary/0 ring-offset-background relative overflow-hidden rounded-xl ring-offset-4 transition-shadow duration-200 group-hover:ring-2"
				>
					<AspectRatio ratio={2 / 3}>
						<ApiImage
							fileId={poster?.id}
							cacheKey={poster?.updatedAt}
							alt={item.title}
							width={208}
							aspectRatio={2 / 3}
							sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 208px"
							className="object-cover group-hover:scale-[1.03] group-hover:opacity-50"
						/>

						{(Boolean(isOrphanView) || lowConfidence || item.hasMissingTranslation) && (
							<div className="absolute top-2 left-2 flex flex-col items-start gap-1.5">
								{isOrphanView && (
									<Badge variant="warning-outline">
										<AlertTriangle className="size-2.5" />
										{m.admin_metadata_no_file_chip()}
									</Badge>
								)}
								{lowConfidence && (
									<Badge variant="warning-outline">
										<AlertTriangle className="size-2.5" />
										{m.common_percent_value({ value: Math.round((item.matchScore ?? 0) * 100) })}
									</Badge>
								)}
								{item.hasMissingTranslation && (
									<Badge variant="warning-outline">
										<AlertTriangle className="size-2.5" />
										{m.admin_metadata_no_pl_fallback()}
									</Badge>
								)}
							</div>
						)}
					</AspectRatio>
				</Link>

				<div className="flex flex-col gap-1 px-0.5">
					<p className="text-foreground group-hover:text-primary line-clamp-1 text-sm font-bold tracking-tight transition-colors">
						{item.title}
					</p>
					<div className="flex flex-wrap items-center gap-1.5">
						<Badge variant={isMovie ? "default" : "secondary"} size="sm" transform="capitalize">
							{isMovie ? <Clapperboard className="size-2.5" /> : <Tv className="size-2.5" />}
							<span>{isMovie ? m.common_movie_word() : m.common_series_word()}</span>
						</Badge>
						<span className="text-muted-foreground text-xs font-bold tabular-nums">{year}</span>
						{rating !== "—" && (
							<span className="flex items-center gap-0.5 text-xs font-medium">
								<Star className="fill-warning text-warning size-3" />
								<span className="tabular-nums">{rating}</span>
							</span>
						)}
					</div>
				</div>
			</ContextMenuTrigger>

			<ContextMenuContent className="w-56">
				<ContextMenuGroup>
					<ContextMenuLabel className="truncate">{item.title}</ContextMenuLabel>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuGroup>
					<ContextMenuItem render={<Link to="/admin/metadata/$id" params={{ id: item.id }} />}>
						<Pencil className="text-muted-foreground size-3.5" />
						<span>{m.admin_metadata_edit()}</span>
					</ContextMenuItem>
					<ContextMenuItem onClick={() => refreshMetadataMutation.mutate(item.id)}>
						<RefreshCw className="text-primary size-3.5" />
						<span>{m.components_metadata_card_refresh_metadata()}</span>
					</ContextMenuItem>
					<ContextMenuItem onClick={() => refreshImagesMutation.mutate(item.id)}>
						<ImageDown className="text-primary size-3.5" />
						<span>{m.components_metadata_card_force_artwork()}</span>
					</ContextMenuItem>
					<ContextMenuItem onClick={copyId}>
						<Copy className="text-muted-foreground size-3.5" />
						<span>{m.common_copy_id()}</span>
					</ContextMenuItem>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuGroup>
					<ConfirmAction
						nativeButton={false}
						trigger={
							<ContextMenuItem variant="destructive" disabled={isDeleting}>
								<Trash2 className="size-3.5" />
								<span>{m.admin_metadata_delete_metadata()}</span>
							</ContextMenuItem>
						}
						title={m.admin_metadata_delete_metadata()}
						description={m.admin_metadata_entry_delete_notice_full({ title: item.title })}
						confirmLabel={m.admin_metadata_delete_metadata()}
						onConfirm={() => onDelete(item.id, item.title)}
					/>
				</ContextMenuGroup>
			</ContextMenuContent>
		</ContextMenu>
	);
}
