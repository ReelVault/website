import type { ReactNode } from "react";
import type { CollectionSortMode } from "reelvault-sdk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SkeletonList } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { m } from "@/paraglide/messages";
import { COLLECTION_SORT_OPTIONS } from "../../components/collection-sort-options";
import { CollectionOrderItemRow, type OrderItem } from "../components/collection-order-item-row";

interface CollectionItemsCardProps {
	orderItems: OrderItem[];
	sortMode: CollectionSortMode;
	orderDirty: boolean;
	isLoading: boolean;
	isError: boolean;
	isSubmitting: boolean;
	onMoveItem: (index: number, direction: -1 | 1) => void;
}

export function CollectionItemsCard({
	orderItems,
	sortMode,
	orderDirty,
	isLoading,
	isError,
	isSubmitting,
	onMoveItem,
}: CollectionItemsCardProps) {
	const currentSortLabel = COLLECTION_SORT_OPTIONS.find((option) => option.value === sortMode)?.label ?? sortMode;

	let itemsContent: ReactNode;
	if (isError) {
		itemsContent = (
			<div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-destructive text-sm">
				{m.admin_collections_fetch_failed_retry()}
			</div>
		);
	} else if (isLoading) {
		itemsContent = (
			<div className="flex flex-col gap-2">
				<SkeletonList count={5} itemClassName="h-14" />
			</div>
		);
	} else if (orderItems.length === 0) {
		itemsContent = (
			<div className="rounded-xl border border-border p-6 text-center text-muted-foreground text-sm">
				{m.admin_collections_no_titles_yet()}
			</div>
		);
	} else {
		itemsContent = (
			<ScrollArea className="h-96">
				<ul className="flex flex-col gap-2 pr-2">
					{orderItems.map((item, index) => (
						<CollectionOrderItemRow
							key={item.id}
							item={item}
							index={index}
							totalCount={orderItems.length}
							sortMode={sortMode}
							isSubmitting={isSubmitting}
							onMoveItem={onMoveItem}
						/>
					))}
				</ul>
			</ScrollArea>
		);
	}

	return (
		<Card className="border-border/80 bg-card">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-1">
						<CardTitle className="font-semibold text-base">
							{sortMode === "manual"
								? m.admin_collections_manual_order_count({ count: orderItems.length })
								: m.admin_collections_titles_in_collection_count({ count: orderItems.length })}
						</CardTitle>
						<CardDescription>
							{sortMode === "manual" ? m.admin_collections_order_help() : m.admin_collections_sorted_by_label({ sort: currentSortLabel })}
						</CardDescription>
					</div>
					{isLoading && <Spinner className="size-4" />}
				</div>
			</CardHeader>
			<CardContent>
				{itemsContent}
				{sortMode === "manual" && orderDirty && <p className="mt-3 text-primary text-xs">{m.admin_collections_order_changed_save()}</p>}
			</CardContent>
		</Card>
	);
}
