import { useNavigate, useSearch } from "@tanstack/react-router";
import { FileVideo, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import {
	type AdminMediaFileSortBy,
	useAdminMediaFileAudit,
	useAdminMediaFiles,
	useAdminRefreshAllMediaFiles,
} from "@/client/hooks/use-admin-media";
import { useAdminStats } from "@/client/hooks/use-admin-stats";
import { useDeleteTrickplayMany } from "@/client/hooks/use-admin-trickplay";
import { AppErrorState } from "@/components/app-states";
import { ConfirmAction } from "@/components/confirm-action";
import { SimplePagination } from "@/components/simple-pagination";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { MediaAuditView } from "./components/media-audit-view";
import { MediaList } from "./components/media-list";
import {
	isSortOptionValue,
	MediaSearchSortBar,
	SORT_OPTIONS,
	type SortOptionValue,
	type SortOrder,
} from "./components/media-search-sort-bar";
import { MediaStats } from "./components/media-stats";
import { MediaViewModeToggle } from "./components/media-view-mode-toggle";

export default function AdminMediaFilesPage() {
	const search = useSearch({ from: "/admin/media/" });
	const navigate = useNavigate({ from: "/admin/media/" });
	const [viewMode, setViewMode] = useState<"all" | "audit">("all");
	const [searchQuery, setSearchQuery] = useState(search.q ?? "");
	const debouncedSearch = useDebounce({ value: searchQuery, delay: 500 });
	const sortOption: SortOptionValue = typeof search.sort === "string" && isSortOptionValue(search.sort) ? search.sort : "updatedAt:desc";
	const currentPage = search.page ?? 1;

	// Bulk selection spans the pages shown while it lasts; the toolbar says how many files it holds.
	const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());
	const deleteTrickplayMany = useDeleteTrickplayMany();

	const toggleSelect = (id: string) => {
		setSelectedIds((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);

			return next;
		});
	};

	const clearSelection = () => setSelectedIds(new Set());

	/** Selects every id on the page, or clears them when they are all selected already. */
	const toggleAllOnPage = (ids: string[]) => {
		setSelectedIds((current) => {
			const allSelected = ids.every((id) => current.has(id));
			const next = new Set(current);
			for (const id of ids) {
				if (allSelected) next.delete(id);
				else next.add(id);
			}

			return next;
		});
	};

	const removeSelectedPreviews = async () => {
		try {
			await deleteTrickplayMany.mutateAsync([...selectedIds]);
			clearSelection();
		} catch {
			// Toast is handled by hook
		}
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
	const { refreshAllMediaFiles, isRefreshingAll } = useAdminRefreshAllMediaFiles();
	const audit = useAdminMediaFileAudit({ enabled: viewMode === "audit" });
	const { suspectCount } = audit;

	const statsQuery = useAdminStats();
	// sortOption is the validated "sortBy:sortOrder" pair; resolve both halves
	// through the option list instead of asserting the split result.
	const matchedOption = SORT_OPTIONS.find((option) => option.value === sortOption);
	const matched = matchedOption?.value ?? "updatedAt:desc";
	let sortBy: AdminMediaFileSortBy = "updatedAt";
	if (matched.startsWith("createdAt")) sortBy = "createdAt";
	else if (matched.startsWith("fileName")) sortBy = "fileName";
	else if (matched.startsWith("size")) sortBy = "size";

	const sortOrder: SortOrder = matched.endsWith(":asc") ? "asc" : "desc";

	const { mediaFiles, total, totalPages, isLoading, isFetching, error, refetch, deletingIds, deleteMediaFile } = useAdminMediaFiles({
		page: currentPage,
		limit: 20,
		fileName: debouncedSearch || undefined,
		libraryId: search.libraryId,
		sortBy,
		sortOrder,
	});

	const handleDelete = (mediaFileId: string, _fileName: string) => deleteMediaFile(mediaFileId);

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
	};

	const handleSortChange = (value: string | null) => {
		if (!(value && isSortOptionValue(value))) return;

		detach(() => navigate({ search: (prev) => ({ ...prev, sort: value, page: undefined }), replace: true }));
	};

	const handleClearLibrary = () => {
		detach(() => navigate({ search: (prev) => ({ ...prev, libraryId: undefined, page: undefined }), replace: true }));
	};

	const handlePageChange = (page: number) => {
		detach(() => navigate({ search: (prev) => ({ ...prev, page: page > 1 ? page : undefined }), replace: false }));
	};

	let viewContent: ReactNode;
	if (viewMode === "audit") {
		viewContent = (
			<AdminSection title={m.admin_media_assignment_integrity_audit()} description={m.admin_media_auto_analysis_description()}>
				<MediaAuditView audit={audit} />
			</AdminSection>
		);
	} else if (error) {
		viewContent = <AppErrorState error={error} onRetry={() => detach(refetch)} />;
	} else {
		viewContent = (
			<AdminSection title={m.admin_media_heading_files_list({ total })} description={m.admin_media_physical_files_description()}>
				<div className="flex flex-col gap-4">
					{search.libraryId && (
						<Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={handleClearLibrary}>
							<X className="size-3.5" />
							{m.admin_media_library_filter_clear()}
						</Button>
					)}
					{mediaFiles.length > 0 && (
						<label className="flex cursor-pointer items-center gap-2 text-sm">
							<input
								type="checkbox"
								className="size-4 accent-primary"
								checked={mediaFiles.every((file) => selectedIds.has(file.id))}
								onChange={() => toggleAllOnPage(mediaFiles.map((file) => file.id))}
							/>
							{m.admin_media_select_page()}
						</label>
					)}
					{selectedIds.size > 0 && (
						<div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/80 bg-card p-3">
							<span className="text-sm">{m.admin_media_selected_count({ count: selectedIds.size })}</span>
							<ConfirmAction
								trigger={
									<Button size="sm" variant="outline" disabled={deleteTrickplayMany.isPending}>
										{m.admin_media_remove_previews_selected()}
									</Button>
								}
								title={m.admin_media_remove_previews_confirm_title({ count: selectedIds.size })}
								description={m.admin_media_remove_previews_confirm_description()}
								confirmLabel={m.admin_media_remove_previews_selected()}
								onConfirm={() => removeSelectedPreviews()}
							/>
							<Button size="sm" variant="ghost" onClick={clearSelection}>
								{m.admin_media_clear_selection()}
							</Button>
						</div>
					)}
					<MediaList
						mediaFiles={mediaFiles}
						isLoading={isLoading || isFetching}
						deletingIds={deletingIds}
						selectedIds={selectedIds}
						onToggleSelect={toggleSelect}
						onDelete={handleDelete}
						onResetSearch={() => setSearchQuery("")}
					/>

					<SimplePagination
						variant="admin"
						currentPage={currentPage}
						totalPages={totalPages}
						isLoading={isLoading || isFetching}
						onPageChange={handlePageChange}
					/>
				</div>
			</AdminSection>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={FileVideo}
				eyebrow={m.admin_libraries_resource_management()}
				title={m.admin_nav_media_files()}
				count={total}
				description={m.admin_media_browse_description()}
				actions={
					<MediaSearchSortBar
						viewMode={viewMode}
						searchQuery={searchQuery}
						onSearchChange={handleSearchChange}
						sortOption={sortOption}
						onSortChange={handleSortChange}
						isRefreshingAll={isRefreshingAll}
						onRefreshAll={() => detach(refreshAllMediaFiles)}
					/>
				}
			/>

			<MediaStats stats={statsQuery.data?.media} total={total} />

			<MediaViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} total={total} suspectCount={suspectCount} />

			{viewContent}
		</div>
	);
}
