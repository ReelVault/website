import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import type { ChangeEvent, MouseEvent } from "react";
import { useEffect, useState } from "react";
import type { CollectionSortMode } from "@reelvault/sdk";
import { reelvault } from "@/client/client";
import { useAdminCollection, useAdminCollections } from "@/client/hooks/use-admin-collections";
import { collectionOrderItemFields } from "@/client/utils/fields";
import { metadataKeys } from "@/client/utils/query-keys";
import { detach } from "@/lib/detach";
import { EditorMessage } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { COLLECTION_SORT_OPTIONS, getCollectionSortConfig } from "../components/collection-sort-options";
import { CollectionEditorSkeleton } from "./components/collection-editor-skeleton";
import type { OrderItem } from "./components/collection-order-item-row";
import { CollectionEditorHeader } from "./sections/collection-editor-header";
import { CollectionItemsCard } from "./sections/collection-items-card";
import { CollectionNameCard } from "./sections/collection-name-card";
import { CollectionProvidersCard } from "./sections/collection-providers-card";
import { CollectionSortCard } from "./sections/collection-sort-card";

export default function AdminCollectionEditorPage() {
	const { id: collectionId } = useParams({ from: "/admin/collections/$id" });
	const { updateCollection, updateCollectionOrder, isUpdating, isUpdatingOrder } = useAdminCollections();
	const collectionQuery = useAdminCollection(collectionId);

	const [name, setName] = useState("");
	const [sortMode, setSortMode] = useState<CollectionSortMode>("release_date");
	const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
	const [orderDirty, setOrderDirty] = useState(false);

	const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};

	const handleSortModeChange = (mode: CollectionSortMode) => {
		setSortMode(mode);
	};

	const handleSortOptionClick = (event: MouseEvent<HTMLButtonElement>) => {
		const mode = event.currentTarget.dataset.sortMode;
		if (!mode) return;

		const matched = COLLECTION_SORT_OPTIONS.find((option) => option.value === mode);
		if (matched) handleSortModeChange(matched.value);
	};

	const moveItem = (index: number, direction: -1 | 1) => {
		setOrderItems((current) => {
			const target = index + direction;
			if (target < 0 || target >= current.length) return current;

			const next = [...current];
			const [moved] = next.splice(index, 1);
			if (!moved) return current;

			next.splice(target, 0, moved);

			return next;
		});
		setOrderDirty(true);
	};

	const sortConfig = getCollectionSortConfig(sortMode);

	const itemsQuery = useQuery({
		queryKey: metadataKeys.collectionOrder(collectionId, sortConfig.sortBy, sortConfig.sortOrder),
		queryFn: () =>
			reelvault.metadata.getAll({
				collectionIds: collectionId,
				fields: collectionOrderItemFields,
				sortBy: sortConfig.sortBy,
				sortOrder: sortConfig.sortOrder,
				hasMediaFiles: true,
				limit: 500,
			}),
		enabled: Boolean(collectionId),
		staleTime: 1000 * 60 * 5,
	});

	useEffect(() => {
		if (collectionQuery.data) {
			setName(collectionQuery.data.name);
			setSortMode(collectionQuery.data.sortMode);
		}

		setOrderDirty(false);
	}, [collectionQuery.data]);

	useEffect(() => {
		if (itemsQuery.data) {
			setOrderItems(
				itemsQuery.data.data.map((item) => ({
					id: item.id,
					title: item.title,
					type: item.type,
					releaseDate: item.releaseDate,
					images: item.images.map((image) => ({
						imageType: image.imageType,
						data: image.data ? { id: image.data.id, updatedAt: image.data.updatedAt } : null,
					})),
				})),
			);
			setOrderDirty(false);
		}
	}, [itemsQuery.data]);

	const collection = collectionQuery.data;
	if (!collectionId) {
		return <EditorMessage message={m.admin_collections_no_identifier_back_to_list()} />;
	}

	if (collectionQuery.isLoading) {
		return <CollectionEditorSkeleton />;
	}

	if (collectionQuery.isError || !collection) {
		return <EditorMessage message={m.admin_collections_failed_to_fetch()} />;
	}

	const hasNameChange = name.trim() !== collection.name;
	const hasSortModeChange = sortMode !== collection.sortMode;
	const isSubmitting = isUpdating || isUpdatingOrder;

	const handleSave = async () => {
		const normalizedName = name.trim();
		if (!normalizedName) return;

		const updatePayload: { name?: string; sortMode?: CollectionSortMode } = {};
		if (hasNameChange) updatePayload.name = normalizedName;

		if (hasSortModeChange) updatePayload.sortMode = sortMode;

		await Promise.all([
			Object.keys(updatePayload).length > 0 ? updateCollection({ id: collectionId, data: updatePayload }) : Promise.resolve(),
			sortMode === "manual" && orderItems.length > 0
				? updateCollectionOrder({
						id: collectionId,
						metadataIds: orderItems.map((item) => item.id),
					})
				: Promise.resolve(),
		]);
	};

	const saveDisabled = isSubmitting || !name.trim() || (sortMode === "manual" && (itemsQuery.isLoading || orderItems.length === 0));

	return (
		<div className="flex flex-col gap-6">
			<CollectionEditorHeader
				collectionId={collectionId}
				collection={collection}
				isSubmitting={isSubmitting}
				saveDisabled={saveDisabled}
				onSave={() => {
					detach(handleSave());
				}}
			/>

			<CollectionNameCard name={name} onNameChange={handleNameChange} />

			<CollectionProvidersCard providers={collection.providers} />

			<CollectionSortCard sortMode={sortMode} onSortOptionClick={handleSortOptionClick} />

			<CollectionItemsCard
				orderItems={orderItems}
				sortMode={sortMode}
				orderDirty={orderDirty}
				isLoading={itemsQuery.isLoading}
				isError={itemsQuery.isError}
				isSubmitting={isSubmitting}
				onMoveItem={moveItem}
			/>
		</div>
	);
}
