import { cn } from "cn";
import { LayoutGrid } from "lucide-react";
import { ApiImage } from "@/components/ui/api-image";

export interface CollectionPosterImage {
	imageId: string;
	updatedAt: Date | string | null;
}

interface CollectionPosterCollageProps {
	posterImages?: Array<CollectionPosterImage | null | undefined> | null;
	className?: string;
}

export function CollectionPosterCollage({ posterImages, className }: CollectionPosterCollageProps) {
	if (!posterImages || posterImages.length === 0) return null;

	const slice = posterImages.slice(0, 6);
	const count = slice.length;

	return (
		<div
			className={cn(
				"absolute inset-0 grid gap-px bg-border",
				{
					"grid-cols-1": count <= 1,
					"grid-cols-2": count === 2,
					"grid-cols-3": count === 3,
					"grid-cols-4": count === 4,
					"grid-cols-5": count === 5,
					"grid-cols-6": count >= 6,
				},
				className,
			)}
		>
			{(() => {
				const keyCounts = new Map<string, number>();

				return slice.map((poster) => {
					const base = poster?.imageId ?? "placeholder";
					const occurrence = (keyCounts.get(base) ?? 0) + 1;
					keyCounts.set(base, occurrence);
					const uniqueKey = `${base}-${occurrence}`;

					return poster ? (
						<ApiImage
							key={uniqueKey}
							fileId={poster.imageId}
							cacheKey={poster.updatedAt}
							alt=""
							width={128}
							aspectRatio={2 / 3}
							className="size-full object-cover"
						/>
					) : (
						<div key={uniqueKey} className="flex items-center justify-center bg-muted/60 text-muted-foreground">
							<LayoutGrid className="size-5" />
						</div>
					);
				});
			})()}
		</div>
	);
}
