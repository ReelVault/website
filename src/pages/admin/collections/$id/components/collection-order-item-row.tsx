import type { CollectionSortMode } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { ApiImage } from "@/components/ui/api-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { getYearFromDate } from "@/utils/date-utils";
import { getMetadataPoster } from "@/utils/metadata-utils";

export interface OrderItem {
	id: string;
	title: string;
	type: "movie" | "tv_show";
	releaseDate?: string | null;
	images?: Array<{ imageType: string; data: { id: string; updatedAt: Date } | null }>;
}

interface CollectionOrderItemRowProps {
	item: OrderItem;
	index: number;
	totalCount: number;
	sortMode: CollectionSortMode;
	isSubmitting: boolean;
	onMoveItem: (index: number, direction: -1 | 1) => void;
}

export function CollectionOrderItemRow({ item, index, totalCount, sortMode, isSubmitting, onMoveItem }: CollectionOrderItemRowProps) {
	const posterId = getMetadataPoster(item)?.id;

	return (
		<li className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/20 p-2 pr-3 transition-colors hover:border-border/90 hover:bg-muted/30">
			<div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/60">
				{posterId ? (
					<ApiImage
						fileId={posterId}
						cacheKey={getMetadataPoster(item)?.updatedAt}
						alt=""
						width={44}
						aspectRatio={2 / 3}
						className="size-full object-cover"
					/>
				) : (
					<GripVertical className="size-4 text-muted-foreground" aria-hidden="true" />
				)}
			</div>
			<div className="min-w-0 flex-1">
				<Link
					to="/admin/metadata/$id"
					params={{ id: item.id }}
					className="block truncate font-semibold text-foreground text-sm hover:text-primary hover:underline"
				>
					{item.title}
				</Link>
				<p className="text-muted-foreground text-xs">
					{m.admin_collections_type_year({
						type: item.type === "movie" ? m.common_movie_word() : m.common_series_word(),
						year: getYearFromDate(item.releaseDate),
					})}
				</p>
			</div>
			<Badge variant="secondary" size="sm" className="hidden font-mono sm:inline-flex">
				{m.common_rank_number({ index: index + 1 })}
			</Badge>
			{sortMode === "manual" && (
				<div className="flex flex-col gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={() => onMoveItem(index, -1)}
						disabled={index === 0 || isSubmitting}
						aria-label={m.admin_collections_move_named_up({ title: item.title })}
					>
						<ArrowUp className="size-3.5" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={() => onMoveItem(index, 1)}
						disabled={index === totalCount - 1 || isSubmitting}
						aria-label={m.admin_collections_move_named_down({ title: item.title })}
					>
						<ArrowDown className="size-3.5" />
					</Button>
				</div>
			)}
		</li>
	);
}
