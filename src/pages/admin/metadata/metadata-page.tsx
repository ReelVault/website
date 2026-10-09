import { useNavigate, useSearch } from "@tanstack/react-router";
import { Film } from "lucide-react";
import { useEffect, useState } from "react";
import {
	type ADMIN_METADATA_SORTS,
	type AdminMetadataBrowseFilters,
	useAdminMetadata,
	useBulkRefreshMetadataImages,
} from "@/client/hooks/use-admin-metadata";
import { useAdminStats } from "@/client/hooks/use-admin-stats";
import { AppErrorState } from "@/components/app-states";
import { SimplePagination } from "@/components/simple-pagination";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { MetadataBrowseFilters } from "./_components/metadata-browse-filters";
import { isAdminMetadataSort, isAdminMetadataType, type MediaFilter, MetadataFilterBar } from "./_components/metadata-filter-bar";
import { MetadataHeaderActions } from "./_components/metadata-header-actions";
import { MetadataList } from "./_components/metadata-list";
import { MetadataStats } from "./_components/metadata-stats";

function getSectionTitle(mediaFilter: MediaFilter, total: number): string {
	let title: string;
	switch (mediaFilter) {
		case "all":
			title = m.admin_metadata_view_catalog({ total });
			break;
		case "low_confidence":
			title = m.admin_metadata_view_low_matches({ total });
			break;
		case "missing_translation":
			title = m.admin_metadata_view_missing_translations({ total });
			break;
		case "without_media":
			title = m.admin_metadata_view_orphans({ total });
			break;
		case "with_media":
			title = m.admin_metadata_view_with_files({ total });
			break;
		default:
			title = m.admin_metadata_view_catalog({ total });
			break;
	}

	return title;
}

function getSectionDescription(mediaFilter: MediaFilter): string {
	let description: string;
	switch (mediaFilter) {
		case "low_confidence":
			description = m.admin_metadata_low_confidence_notice();
			break;
		case "missing_translation":
			description = m.admin_metadata_fallback_notice();
			break;
		case "without_media":
			description = m.admin_metadata_orphans_notice();
			break;
		case "with_media":
		case "all":
			description = m.admin_metadata_downloaded_content_description();
			break;
		default:
			description = m.admin_metadata_downloaded_content_description();
			break;
	}

	return description;
}

export default function AdminMetadataPage() {
	const search = useSearch({ from: "/admin/metadata/" });
	const navigate = useNavigate({ from: "/admin/metadata/" });
	const [searchQuery, setSearchQuery] = useState(search.q ?? "");
	const debouncedSearch = useDebounce({ value: searchQuery, delay: 500 });
	const currentPage = search.page ?? 1;
	const mediaFilter: MediaFilter =
		search.filter === "with_media" ||
		search.filter === "without_media" ||
		search.filter === "low_confidence" ||
		search.filter === "missing_translation"
			? search.filter
			: "all";

	const typeFilter = isAdminMetadataType(search.type) ? search.type : undefined;
	const sort = isAdminMetadataSort(search.sort) ? search.sort : "recent";
	const browse: AdminMetadataBrowseFilters = {
		yearFrom: search.yearFrom,
		yearTo: search.yearTo,
		minMatchScore: search.minMatchScore,
		startsWith: search.startsWith,
		status: search.status,
	};

	// Typing flows debounce → URL; browser Back/refresh restores both.
	useEffect(() => {
		if (debouncedSearch !== (search.q ?? "")) {
			detach(() => navigate({ search: (prev) => ({ ...prev, q: debouncedSearch || undefined, page: undefined }), replace: true }));
		}
	}, [debouncedSearch, navigate, search.q]);

	useEffect(() => {
		setSearchQuery(search.q ?? "");
	}, [search.q]);

	let hasMediaFiles: boolean | undefined;
	if (mediaFilter === "with_media") hasMediaFiles = true;
	else if (mediaFilter === "without_media") hasMediaFiles = false;

	const isLowConfidence = mediaFilter === "low_confidence";
	const isMissingTranslation = mediaFilter === "missing_translation";

	const statsQuery = useAdminStats();

	const {
		data,
		isLoading,
		isFetching,
		error,
		refetch,
		deletingIds,
		deleteMetadata,
		deleteOrphans,
		isDeletingOrphans,
		refreshAllMetadata,
		isRefreshingAll,
		refreshMissingTranslations,
		isRefreshingMissingTranslations,
	} = useAdminMetadata(
		currentPage,
		20,
		debouncedSearch,
		hasMediaFiles,
		isLowConfidence ? true : undefined,
		isMissingTranslation ? true : undefined,
		{ type: typeFilter, sort, ...browse },
	);

	const handleDelete = (id: string, title: string) => deleteMetadata({ id, title });

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
	};

	const handleFilterChange = (value: MediaFilter) => {
		detach(() =>
			navigate({ search: (prev) => ({ ...prev, filter: value !== "all" ? value : undefined, page: undefined }), replace: true }),
		);
	};

	const handleTypeChange = (value: "movie" | "tv_show" | undefined) => {
		detach(() => navigate({ search: (prev) => ({ ...prev, type: value, page: undefined }), replace: true }));
	};

	// Selection spans the pages shown while it lasts, like the admin people list.
	const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());
	const bulkRefreshArtwork = useBulkRefreshMetadataImages();
	const allOnPageSelected = data.data.length > 0 && data.data.every((item) => selectedIds.has(item.id));

	const toggleSelect = (id: string) => {
		setSelectedIds((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);

			return next;
		});
	};

	/** Selects every title on the page, or clears them when they are all selected already. */
	const toggleAllOnPage = () => {
		const pageIds = data.data.map((item) => item.id);
		setSelectedIds((current) => {
			const next = new Set(current);
			for (const id of pageIds) {
				if (allOnPageSelected) next.delete(id);
				else next.add(id);
			}

			return next;
		});
	};

	const clearSelection = () => setSelectedIds(new Set());

	const refreshSelectedArtwork = async () => {
		try {
			await bulkRefreshArtwork.mutateAsync([...selectedIds]);
			clearSelection();
		} catch {
			// Toast is handled by the hook
		}
	};

	const handleSortChange = (value: keyof typeof ADMIN_METADATA_SORTS) => {
		detach(() =>
			navigate({ search: (prev) => ({ ...prev, sort: value === "recent" ? undefined : value, page: undefined }), replace: true }),
		);
	};

	// The browse patch names are the URL params, so it merges straight into the search.
	const handleBrowseChange = (patch: AdminMetadataBrowseFilters) => {
		detach(() => navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }), replace: true }));
	};

	const handlePageChange = (page: number) => {
		detach(() => navigate({ search: (prev) => ({ ...prev, page: page > 1 ? page : undefined }), replace: false }));
	};

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={Film}
				eyebrow={m.admin_libraries_resource_management()}
				title={m.admin_nav_metadata()}
				count={data.total}
				description={m.admin_metadata_browse_description()}
				actions={
					<MetadataHeaderActions
						isRefreshingAll={isRefreshingAll}
						isDeletingOrphans={isDeletingOrphans}
						isFetching={isFetching}
						onRefreshAll={() => detach(refreshAllMetadata)}
						onDeleteOrphans={() => detach(deleteOrphans)}
						onRefetch={() => detach(refetch)}
						onRefreshFlagged={isMissingTranslation ? () => detach(refreshMissingTranslations) : undefined}
						isRefreshingFlagged={isRefreshingMissingTranslations}
					/>
				}
			/>

			<div className="flex flex-col gap-3">
				<MetadataFilterBar
					searchQuery={searchQuery}
					onSearchChange={handleSearchChange}
					mediaFilter={mediaFilter}
					onFilterChange={handleFilterChange}
					typeFilter={typeFilter}
					onTypeChange={handleTypeChange}
					sort={sort}
					onSortChange={handleSortChange}
				/>
				<MetadataBrowseFilters filters={browse} onChange={handleBrowseChange} />
			</div>

			<MetadataStats stats={statsQuery.data?.metadata} total={data.total} />

			{error ? (
				<AppErrorState error={error} onRetry={() => detach(refetch)} />
			) : (
				<AdminSection title={getSectionTitle(mediaFilter, data.total)} description={getSectionDescription(mediaFilter)}>
					<div className="flex flex-col gap-4">
						{data.data.length > 0 && (
							<div className="flex flex-wrap items-center justify-between gap-3">
								<label className="flex cursor-pointer items-center gap-2 text-sm">
									<input type="checkbox" className="size-4 accent-primary" checked={allOnPageSelected} onChange={toggleAllOnPage} />
									{m.admin_metadata_select_all()}
								</label>
								{selectedIds.size > 0 && (
									<div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/80 bg-card p-3">
										<span className="text-sm">{m.admin_metadata_selected_count({ count: selectedIds.size })}</span>
										<Button
											size="sm"
											variant="outline"
											disabled={bulkRefreshArtwork.isPending}
											onClick={() => detach(refreshSelectedArtwork())}
										>
											{m.admin_metadata_refresh_artwork_selected()}
										</Button>
										<Button size="sm" variant="ghost" onClick={clearSelection}>
											{m.admin_metadata_clear_selection()}
										</Button>
									</div>
								)}
							</div>
						)}
						<MetadataList
							metadata={data.data}
							isLoading={isLoading || isFetching}
							deletingIds={deletingIds}
							isOrphanView={mediaFilter === "without_media"}
							onDelete={handleDelete}
							onResetSearch={() => handleSearchChange("")}
							selectedIds={selectedIds}
							onToggleSelect={toggleSelect}
						/>

						<SimplePagination
							variant="admin"
							currentPage={currentPage}
							totalPages={data.totalPages}
							isLoading={isLoading || isFetching}
							onPageChange={handlePageChange}
						/>
					</div>
				</AdminSection>
			)}
		</div>
	);
}
