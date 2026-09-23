import { useNavigate, useSearch } from "@tanstack/react-router";
import { Film } from "lucide-react";
import { useEffect, useState } from "react";
import { useAdminMetadata } from "@/client/hooks/use-admin-metadata";
import { useAdminStats } from "@/client/hooks/use-admin-stats";
import { AppErrorState } from "@/components/app-states";
import { SimplePagination } from "@/components/simple-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { type MediaFilter, MetadataFilterBar } from "./_components/metadata-filter-bar";
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

	const handlePageChange = (page: number) => {
		detach(() => navigate({ search: (prev) => ({ ...prev, page: page > 1 ? page : undefined }), replace: false }));
	};

	return (
		<main className="flex flex-col gap-6">
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

			<MetadataFilterBar
				searchQuery={searchQuery}
				onSearchChange={handleSearchChange}
				mediaFilter={mediaFilter}
				onFilterChange={handleFilterChange}
			/>

			<MetadataStats stats={statsQuery.data?.metadata} total={data.total} />

			{error ? (
				<AppErrorState error={error} onRetry={() => detach(refetch)} />
			) : (
				<AdminSection title={getSectionTitle(mediaFilter, data.total)} description={getSectionDescription(mediaFilter)}>
					<div className="flex flex-col gap-4">
						<MetadataList
							metadata={data.data}
							isLoading={isLoading || isFetching}
							deletingIds={deletingIds}
							isOrphanView={mediaFilter === "without_media"}
							onDelete={handleDelete}
							onResetSearch={() => handleSearchChange("")}
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
		</main>
	);
}
