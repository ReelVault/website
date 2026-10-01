import { useNavigate, useSearch } from "@tanstack/react-router";
import { cn } from "cn";
import { Captions, FileText, Globe, Languages } from "lucide-react";
import { lazy, type ReactNode, Suspense, useState } from "react";
import { useAdminDeleteSubtitle, useAdminSubtitleProviders, useAdminSubtitles } from "@/client/hooks/use-admin-subtitles";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { LazyRender } from "@/components/lazy-render";
import { SimplePagination } from "@/components/simple-pagination";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSearch, AdminSection, AdminStatCard } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { SubtitleItemRow } from "./components/subtitle-item-row";
import { SubtitleProvidersSection } from "./components/subtitle-providers-section";

const LazySubtitleDetailDialog = lazy(async () => ({
	default: (await import("./components/subtitle-detail-dialog")).SubtitleDetailDialog,
}));
const LazyEditSubtitleDialog = lazy(async () => ({ default: (await import("./components/edit-subtitle-dialog")).EditSubtitleDialog }));

const TYPE_FILTERS = [
	{ value: "all", label: m.common_all(), icon: FileText },
	{ value: "embedded", label: m.admin_subtitles_embedded(), icon: Captions },
	{ value: "external", label: m.admin_subtitles_external(), icon: Globe },
] as const;

type SubtitleTypeFilter = (typeof TYPE_FILTERS)[number]["value"];

export default function AdminSubtitlesPage() {
	const { page: urlPage = 1, type, language, q } = useSearch({ from: "/admin/subtitles" });
	const navigate = useNavigate({ from: "/admin/subtitles" });
	const page = urlPage;
	const searchQuery = q ?? "";
	// Dialog targets are transient UI state — they stay local on purpose.
	const [viewingId, setViewingId] = useState<string | null>(null);
	const [editingSubtitle, setEditingSubtitle] = useState<{ id: string } | null>(null);

	const filters = { type, language };
	const { data, isLoading, error, refetch } = useAdminSubtitles(page, 50, filters);
	const { data: embeddedData } = useAdminSubtitles(1, 1, { type: "embedded" });
	const { data: externalData } = useAdminSubtitles(1, 1, { type: "external" });
	const { data: providers } = useAdminSubtitleProviders();
	const deleteMutation = useAdminDeleteSubtitle();

	const subtitles = data?.data ?? [];
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;
	const embeddedTotal = embeddedData?.total ?? 0;
	const externalTotal = externalData?.total ?? 0;
	const typeTotals: Record<string, number> = { all: total, embedded: embeddedTotal, external: externalTotal };

	const patchSearch = (patch: { page?: number; type?: "embedded" | "external"; language?: string; q?: string }) => {
		detach(navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }));
	};

	const setType = (value: SubtitleTypeFilter) => {
		patchSearch({ type: value === "all" ? undefined : value, page: undefined });
	};

	const setPage = (next: number) => {
		patchSearch({ page: next > 1 ? next : undefined });
	};

	const setSearchQuery = (value: string) => {
		patchSearch({ q: value || undefined, page: undefined });
	};

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

			{/* Overview */}
			<div className="grid gap-3 sm:grid-cols-3">
				<AdminStatCard label={m.common_all()} value={total} icon={FileText} tone="default" />
				<AdminStatCard label={m.admin_subtitles_embedded()} value={embeddedTotal} icon={Captions} tone="muted" />
				<AdminStatCard label={m.admin_subtitles_external()} value={externalTotal} icon={Globe} tone="muted" />
			</div>

			{/* Providers section */}
			{providers && providers.length > 0 && <SubtitleProvidersSection providers={providers} />}

			{/* Subtitles list */}
			<AdminSection
				title={m.admin_subtitles_indexed_section()}
				description={m.admin_subtitles_all_sources()}
				contentClassName="flex flex-col gap-3"
			>
				{/* Type filter */}
				<div className="flex flex-wrap items-center gap-1.5">
					{TYPE_FILTERS.map((filter) => (
						<button
							key={filter.value}
							type="button"
							onClick={() => setType(filter.value)}
							className={cn(
								"inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 font-medium text-xs transition-[border-color,background-color,color,box-shadow]",
								(type ?? "all") === filter.value
									? "border-border bg-secondary text-foreground shadow-xs"
									: "border-border/40 bg-card/40 text-muted-foreground hover:bg-muted/40 hover:text-foreground",
							)}
						>
							<filter.icon className="size-3.5" />
							<span>{filter.label}</span>
							<span className="font-mono text-[10px] opacity-80">
								{m.admin_worker_filter_count({ count: typeTotals[filter.value] ?? 0 })}
							</span>
						</button>
					))}
				</div>

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
