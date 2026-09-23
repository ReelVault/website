import { Database } from "lucide-react";
import type { MetadataWithRelation } from "reelvault-sdk";
import { AppEmptyState } from "@/components/app-states";
import { LazyRender } from "@/components/lazy-render";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";
import { MetadataAdminCard } from "./metadata-admin-card";

export function MetadataList({
	metadata,
	isLoading,
	deletingIds,
	isOrphanView,
	onDelete,
	onResetSearch,
}: {
	metadata: MetadataWithRelation[];
	isLoading: boolean;
	deletingIds: Set<string>;
	isOrphanView?: boolean;
	onDelete: (id: string, title: string) => Promise<unknown>;
	onResetSearch?: () => void;
}) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" aria-busy="true">
				{["m-skel-1", "m-skel-2", "m-skel-3", "m-skel-4", "m-skel-5", "m-skel-6"].map((key) => (
					<div key={key} className="flex flex-col gap-2">
						<Skeleton className="aspect-2/3 w-full rounded-xl" />
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
				))}
			</div>
		);
	}

	if (metadata.length === 0) {
		return (
			<AppEmptyState
				icon={Database}
				title={isOrphanView ? m.admin_metadata_list_orphans_empty() : m.admin_metadata_list_empty()}
				description={isOrphanView ? m.admin_metadata_all_linked_notice() : m.admin_metadata_no_entries_match()}
				action={
					onResetSearch ? (
						<Button variant="outline" size="sm" onClick={onResetSearch}>
							{m.components_search_clear()}
						</Button>
					) : undefined
				}
			/>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{metadata.map((item) => (
				<LazyRender key={item.id} minHeight={260} rootMargin="400px 0px">
					{() => <MetadataAdminCard item={item} isOrphanView={isOrphanView} isDeleting={deletingIds.has(item.id)} onDelete={onDelete} />}
				</LazyRender>
			))}
		</div>
	);
}
