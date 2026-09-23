import { cn } from "cn";
import { ImageIcon, Pencil, Trash2 } from "lucide-react";
import { ConfirmAction } from "@/components/confirm-action";
import { ApiImage } from "@/components/ui/api-image";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

export type ArtworkKind = "poster" | "backdrop";

export interface ArtworkImageData {
	id: string;
	updatedAt?: string | number | Date;
}

interface ArtworkSlotProps {
	kind: ArtworkKind;
	metadataTitle: string;
	altSuffix: string;
	image: ArtworkImageData | undefined | null;
	aspectClass: string;
	aspectRatio: number;
	imageWidth: number;
	sizes: string;
	changeLabel: string;
	emptyTitle: string;
	onOpenDialog: (type: ArtworkKind) => void;
	onRemoveImage: (imageId: string) => Promise<unknown>;
	isDeletingImage: boolean;
}

export function ArtworkSlot({
	kind,
	metadataTitle,
	altSuffix,
	image,
	aspectClass,
	aspectRatio,
	imageWidth,
	sizes,
	changeLabel,
	emptyTitle,
	onOpenDialog,
	onRemoveImage,
	isDeletingImage,
}: ArtworkSlotProps) {
	const isPoster = kind === "poster";

	if (!image) {
		return (
			<button
				type="button"
				onClick={() => onOpenDialog(kind)}
				className={cn(
					"flex w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-border/80 border-dashed bg-muted/20 p-6 transition-[border-color,background-color,color,box-shadow] hover:border-primary/60 hover:bg-muted/40",
					aspectClass,
				)}
			>
				<div className="flex size-11 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
					<ImageIcon className="size-5 text-primary" />
				</div>
				<div className="text-center">
					<p className="font-semibold text-foreground text-sm">{emptyTitle}</p>
					<p className="text-muted-foreground text-xs">{m.admin_metadata_artwork_slot_hint()}</p>
				</div>
			</button>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className={cn("group relative w-full overflow-hidden rounded-xl border border-border/80 bg-muted/40 shadow-sm", aspectClass)}>
				<ApiImage
					fileId={image.id}
					cacheKey={image.updatedAt}
					alt={`${metadataTitle} - ${altSuffix}`}
					width={imageWidth}
					aspectRatio={aspectRatio}
					sizes={sizes}
					className="h-full w-full object-cover"
				/>
				<button
					type="button"
					aria-label={changeLabel}
					onClick={() => onOpenDialog(kind)}
					className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
				>
					<div className="flex size-10 items-center justify-center rounded-full bg-background/95 text-foreground shadow-sm">
						<Pencil className="size-4" />
					</div>
				</button>
			</div>

			<div className="flex items-center gap-2">
				<Button type="button" variant="outline" size="sm" onClick={() => onOpenDialog(kind)} className="h-8 flex-1 gap-1.5 text-xs">
					<ImageIcon className="size-3.5 text-primary" />
					<span>{changeLabel}</span>
				</Button>

				<ConfirmAction
					trigger={
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-8 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive"
							disabled={isDeletingImage}
						>
							<Trash2 className="size-3.5" />
							<span>{m.common_delete()}</span>
						</Button>
					}
					title={isPoster ? m.admin_metadata_delete_poster_button() : m.admin_metadata_delete_backdrop_confirm()}
					description={isPoster ? m.admin_metadata_poster_detach_notice() : m.admin_metadata_backdrop_detach_notice()}
					confirmLabel={isPoster ? m.admin_metadata_delete_poster_button() : m.admin_metadata_delete_backdrop()}
					onConfirm={() => onRemoveImage(image.id)}
				/>
			</div>
		</div>
	);
}
