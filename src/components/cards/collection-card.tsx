import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Copy, Eye, Shield } from "lucide-react";
import { startTransition } from "react";
import type { MetadataWithRelation, RequireFields } from "@reelvault/sdk";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { defineFields } from "@/client/utils/fields";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { m } from "@/paraglide/messages";
import { copyEntityLink, copyToClipboard } from "@/utils/clipboard-utils";
import { getYearFromDate } from "@/utils/date-utils";
import { getMetadataBackdrop } from "@/utils/metadata-utils";
import { ApiImage } from "../ui/api-image";

const collectionFields = defineFields<MetadataWithRelation>()(
	"id",
	"title",
	"releaseDate",
	"images.imageType",
	"images.data.id",
	"images.data.updatedAt",
);

export function CollectionCard({
	highlight,
	metadata,
}: {
	highlight: boolean;
	metadata: RequireFields<MetadataWithRelation, typeof collectionFields>;
}) {
	const { user } = useCurrentUser();
	const isAdmin = user?.role === "admin";
	const backdropId = getMetadataBackdrop(metadata)?.id;

	const handleCopyLink = (): void => {
		startTransition(() => copyEntityLink(`/details/${metadata.id}`, m.components_collection_card_title_link()));
	};

	const handleCopyId = (): void => {
		startTransition(() => copyToClipboard(metadata.id, m.components_copy_metadata_id()));
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<Link
					key={metadata.id}
					to="/details/$id"
					params={{ id: metadata.id }}
					className={cn(
						"group relative block overflow-hidden rounded-xl border transition-[border-color,box-shadow,transform] duration-200 hover:scale-[1.01]",
						highlight
							? "border-primary shadow-md ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
							: "border-border/70 hover:border-primary/50 hover:shadow-lg",
					)}
				>
					<AspectRatio ratio={16 / 9} className="bg-muted">
						<ApiImage
							fileId={backdropId}
							cacheKey={getMetadataBackdrop(metadata)?.updatedAt}
							alt={metadata.title}
							width={400}
							aspectRatio={16 / 9}
							className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
						/>

						{/* Gradient Overlay */}
						<div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/40 to-transparent" />

						{/* Content */}
						<div className="absolute bottom-0 left-0 w-full p-4">
							<div className="flex items-end justify-between gap-2">
								<p
									className={cn("line-clamp-2 font-bold leading-tight transition-colors duration-200", {
										"text-lg text-primary": highlight,
										"text-base text-foreground group-hover:text-primary": !highlight,
									})}
								>
									{metadata.title}
								</p>
								<span
									className={cn(
										"shrink-0 rounded-md px-2 py-0.5 font-medium text-xs transition-colors",
										highlight
											? "bg-primary text-primary-foreground"
											: "bg-background/80 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary",
									)}
								>
									{getYearFromDate(metadata.releaseDate)}
								</span>
							</div>
						</div>

						{/* Now playing indicator if current */}
						{highlight && (
							<div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 font-bold text-primary-foreground text-xs shadow-md">
								<div className="size-1.5 animate-pulse rounded-full bg-primary-foreground" />
								<span className="text-[10px] tracking-wider">{m.components_now_playing_short()}</span>
							</div>
						)}
					</AspectRatio>
				</Link>
			</ContextMenuTrigger>

			<ContextMenuContent className="w-64 border-border bg-card/95">
				<ContextMenuGroup>
					<ContextMenuLabel className="truncate font-bold text-foreground text-xs uppercase tracking-wider">
						{metadata.title}
					</ContextMenuLabel>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuGroup>
					<ContextMenuItem render={<Link to="/details/$id" params={{ id: metadata.id }} />} className="cursor-pointer gap-2.5">
						<Eye className="size-4 text-muted-foreground" />
						<span>{m.common_details()}</span>
					</ContextMenuItem>
					<ContextMenuItem onClick={handleCopyLink} className="cursor-pointer gap-2.5">
						<Copy className="size-4 text-muted-foreground" />
						<span>{m.common_copy_link()}</span>
					</ContextMenuItem>
				</ContextMenuGroup>

				{isAdmin && (
					<>
						<ContextMenuSeparator />
						<ContextMenuGroup>
							<ContextMenuLabel className="flex items-center gap-1.5 font-bold text-[10px] text-primary uppercase tracking-widest">
								<Shield className="size-3" />
								{m.common_admin_tools()}
							</ContextMenuLabel>
							<ContextMenuItem onClick={handleCopyId} className="cursor-pointer gap-2.5">
								<Copy className="size-4 text-muted-foreground" />
								<span>{m.common_copy_id()}</span>
							</ContextMenuItem>
						</ContextMenuGroup>
					</>
				)}
			</ContextMenuContent>
		</ContextMenu>
	);
}
