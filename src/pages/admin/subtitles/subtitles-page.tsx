import { useNavigate, useSearch } from "@tanstack/react-router";
import { cn } from "cn";
import { Captions, FileText, Globe, Languages } from "lucide-react";
import { lazy, type ReactNode, Suspense, useState } from "react";
import {
	type AdminSubtitleSort,
	useAdminDeleteSubtitle,
	useAdminSubtitleProviders,
	useAdminSubtitles,
} from "@/client/hooks/use-admin-subtitles";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { LazyRender } from "@/components/lazy-render";
import { SimplePagination } from "@/components/simple-pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSearch, AdminSection, AdminStatCard } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { contentLanguageOptions } from "@/utils/locales";
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

const SORT_OPTIONS: AdminSubtitleSort[] = ["added", "updated", "language", "title"];

const SORT_LABELS: Record<AdminSubtitleSort, () => string> = {
	added: () => m.admin_subtitles_sort_added(),
	updated: () => m.admin_subtitles_sort_updated(),
	language: () => m.admin_subtitles_sort_language(),
	title: () => m.admin_subtitles_sort_title(),
};

export default function AdminSubtitlesPage() {
	const languageOptions = contentLanguageOptions(m.admin_subtitles_any_language());
	const { page: urlPage = 1, type, language, q, sort: sortParam } = useSearch({ from: "/admin/subtitles" });
	const navigate = useNavigate({ from: "/admin/subtitles" });
	const page = urlPage;
	const searchQuery = q ?? "";
	// The filter runs on the server, so the text query waits until typing pauses.
	const debouncedSearch = useDebounce({ value: searchQuery, delay: 300 });
	const sort = sortParam ?? "added";
	// Dialog targets are transient UI state — they stay local on purpose.
	const [viewingId, setViewingId] = useState<string | null>(null);
	const [editingSubtitle, setEditingSubtitle] = useState<{ id: string } | null>(null);

	const filters = { type, language, q: debouncedSearch.trim() || undefined };
	const { data, isLoading, error, refetch } = useAdminSubtitles(page, 50, filters, sort);
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

	const patchSearch = (patch: {
		page?: number;
		type?: "embedded" | "external";
		language?: string;
		q?: string;
		sort?: AdminSubtitleSort;
	}) => {
		detach(navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }));
	};

	const setType = (value: SubtitleTypeFilter) => {
		patchSearch({ type: value === "all" ? undefined : value, page: undefined });
	};

	const setLanguage = (value: string) => {
		patchSearch({ language: value || undefined, page: undefined });
	};

	// The default sort stays out of the URL, like the default type filter.
	const setSort = (value: AdminSubtitleSort) => {
		patchSearch({ sort: value === "added" ? undefined : value, page: undefined });
	};

	const setPage = (next: number) => {
		patchSearch({ page: next > 1 ? next : undefined });
	};

	const setSearchQuery = (value: string) => {
		patchSearch({ q: value || undefined, page: undefined });
	};

	const handleDelete = (id: string) => {
		if (deleteMutation.isPending) return;

		deleteMutation.mutate(id);
	};

	let listContent: ReactNode;
	if (error) {
		listContent = <AppErrorState error={error} onRetry={() => detach(refetch)} />;
	} else if (isLoading) {
		listContent = <AppLoadingState />;
	} else if (subtitles.length === 0) {
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
				{subtitles.map((subtitle) => (
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
					<Select value={language ?? ""} onValueChange={(value) => setLanguage(value ?? "")}>
						<SelectTrigger className="h-8 w-44 text-xs" aria-label={m.admin_subtitles_language_filter()}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{languageOptions.map(([value, label]) => (
									<SelectItem key={value} value={value}>
										{label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
					<Select value={sort} onValueChange={(value) => setSort(value ?? "added")}>
						<SelectTrigger className="h-8 w-44 text-xs" aria-label={m.admin_subtitles_sort_label()}>
							<SelectValue>{SORT_LABELS[sort]()}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{SORT_OPTIONS.map((option) => (
									<SelectItem key={option} value={option}>
										{SORT_LABELS[option]()}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
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
