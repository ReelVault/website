import { FileText, Languages } from "lucide-react";
import { lazy, type ReactNode, Suspense, useState } from "react";
import { useAdminDeleteSubtitle, useAdminSubtitleProviders, useAdminSubtitles } from "@/client/hooks/use-admin-subtitles";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { LazyRender } from "@/components/lazy-render";
import { SimplePagination } from "@/components/simple-pagination";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSearch, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { SubtitleItemRow } from "./components/subtitle-item-row";
import { SubtitleProvidersSection } from "./components/subtitle-providers-section";

const LazySubtitleDetailDialog = lazy(async () => ({
	default: (await import("./components/subtitle-detail-dialog")).SubtitleDetailDialog,
}));
const LazyEditSubtitleDialog = lazy(async () => ({ default: (await import("./components/edit-subtitle-dialog")).EditSubtitleDialog }));

export default function AdminSubtitlesPage() {
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewingId, setViewingId] = useState<string | null>(null);
	const [editingSubtitle, setEditingSubtitle] = useState<{ id: string } | null>(null);

	const { data, isLoading, error, refetch } = useAdminSubtitles(page, 50, {});
	const { data: providers } = useAdminSubtitleProviders();
	const deleteMutation = useAdminDeleteSubtitle();

	const subtitles = data?.data ?? [];
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

	const normalizedSearch = searchQuery.trim().toLowerCase();
	const filteredSubtitles = normalizedSearch
		? subtitles.filter((s) => {
				const labelMatch = s.label?.toLowerCase().includes(normalizedSearch) ?? false;
				const langMatch = s.language.toLowerCase().includes(normalizedSearch);
				const fileMatch = s.mediaFileId.toLowerCase().includes(normalizedSearch);

				return labelMatch || langMatch || fileMatch;
			})
		: subtitles;

	const handleDelete = (id: string) => {
		if (deleteMutation.isPending) return;

		deleteMutation.mutate(id);
	};

	let listContent: ReactNode;
	if (error) {
		listContent = <AppErrorState error={error} onRetry={() => detach(refetch)} />;
	} else if (isLoading) {
		listContent = <AppLoadingState />;
	} else if (filteredSubtitles.length === 0) {
		listContent = (
			<AppEmptyState
				icon={FileText}
				title={m.admin_subtitles_none()}
				description={searchQuery ? m.admin_subtitles_no_matches() : m.admin_subtitles_appear_automatically()}
			/>
		);
	} else {
		listContent = (
			<div className="flex flex-col gap-2">
				{filteredSubtitles.map((subtitle) => (
					<LazyRender key={subtitle.id} minHeight={60}>
						{() => (
							<SubtitleItemRow
								subtitle={subtitle}
								onView={setViewingId}
								onEdit={(id) => setEditingSubtitle({ id })}
								onDelete={handleDelete}
							/>
						)}
					</LazyRender>
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={Languages}
				eyebrow={m.admin_subtitles_content_management()}
				title={m.admin_nav_subtitles()}
				count={total}
				description={m.admin_subtitles_manage_description()}
				actions={
					<div className="flex flex-wrap items-center gap-2">
						<AdminSearch
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder={m.admin_subtitles_search()}
							className="w-full sm:max-w-xs"
						/>
					</div>
				}
			/>

			{/* Providers section */}
			{providers && providers.length > 0 && <SubtitleProvidersSection providers={providers} />}

			{/* Subtitles list */}
			<AdminSection title={m.admin_subtitles_indexed_section()} description={m.admin_subtitles_all_sources()}>
				{listContent}

				{/* Pagination */}
				<SimplePagination variant="admin" currentPage={page} totalPages={totalPages} isLoading={isLoading} onPageChange={setPage} />
			</AdminSection>

			{/* Dialogs */}
			{viewingId !== null && (
				<Suspense fallback={null}>
					<LazySubtitleDetailDialog subtitleId={viewingId} isOpen onOpenChange={(open) => !open && setViewingId(null)} />
				</Suspense>
			)}
			{editingSubtitle !== null && (
				<Suspense fallback={null}>
					<LazyEditSubtitleDialog subtitleId={editingSubtitle.id} isOpen onOpenChange={(open) => !open && setEditingSubtitle(null)} />
				</Suspense>
			)}
		</div>
	);
}
