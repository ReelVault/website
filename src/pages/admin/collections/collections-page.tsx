import { Link } from "@tanstack/react-router";
import { Layers, Pencil, Server } from "lucide-react";
import { useState } from "react";
import { useAdminCollections } from "@/client/hooks/use-admin-collections";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSearch, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { COLLECTION_SORT_LABELS } from "./components/collection-sort-options";

export default function AdminCollectionsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce({ value: searchQuery, delay: 400 });
	const { collections, total, error, refetch } = useAdminCollections(debouncedSearch);
	const handleRetry = () => {
		detach(refetch());
	};
	const filteredCollections = collections;

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={Layers}
				eyebrow={m.admin_collections_system_eyebrow()}
				title={m.navbar_collections()}
				count={total}
				description={m.admin_collections_sagas_franchises_description()}
				actions={
					<AdminSearch
						value={searchQuery}
						onChange={setSearchQuery}
						placeholder={m.admin_collections_search_placeholder()}
						className="w-full sm:max-w-xs"
					/>
				}
			/>

			<AdminSection title={m.admin_collections_in_library_section()} description={m.admin_collections_imported_movie_series()}>
				{error ? (
					<AppErrorState error={error} onRetry={handleRetry} />
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{filteredCollections.map((collection) => (
							<Card
								key={collection.id}
								className="group overflow-hidden border-border/80 bg-card transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-xs"
							>
								<CardContent className="flex flex-col gap-3.5 p-5">
									<div className="flex items-start justify-between gap-3">
										<div className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
											<Layers className="size-5" />
										</div>
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											aria-label={m.admin_collections_edit_named_aria({ name: collection.name })}
											className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
											nativeButton={false}
											render={<Link to="/admin/collections/$id" params={{ id: collection.id }} />}
										>
											<Pencil className="size-4" />
										</Button>
									</div>

									<div className="flex flex-col gap-1">
										<h3 className="truncate font-semibold text-base text-foreground tracking-tight" title={collection.name}>
											{collection.name}
										</h3>
										<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
											<Server className="size-3 text-primary" />
											<span>{m.admin_collections_providers_count({ providersCount: collection.providers.length })}</span>
										</div>
									</div>

									<div className="flex flex-wrap gap-1.5 pt-1">
										<Badge variant="secondary" size="sm" className="font-medium text-xs">
											{COLLECTION_SORT_LABELS[collection.sortMode]}
										</Badge>
									</div>
								</CardContent>
							</Card>
						))}

						{filteredCollections.length === 0 && (
							<div className="col-span-full">
								<AppEmptyState
									icon={Layers}
									title={m.admin_collections_no_collections()}
									description={searchQuery ? m.admin_collections_no_matches() : m.admin_collections_appear_automatically()}
								/>
							</div>
						)}
					</div>
				)}
			</AdminSection>
		</div>
	);
}
