import { Hash } from "lucide-react";
import { useState } from "react";
import { useAdminKeywords } from "@/client/hooks/use-admin-keywords";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { SimplePagination } from "@/components/simple-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSearch, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

export default function AdminKeywordsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const debouncedSearch = useDebounce({ value: searchQuery, delay: 400 });
	const { keywords, total, totalPages, isLoading, error, refetch } = useAdminKeywords(debouncedSearch, page, 60);
	const handleRetry = () => {
		detach(refetch());
	};

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setPage(1);
	};

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={Hash}
				eyebrow={m.admin_keywords_eyebrow()}
				title={m.admin_keywords_tags_heading()}
				count={total}
				description={m.admin_keywords_description()}
				actions={
					<AdminSearch
						value={searchQuery}
						onChange={handleSearchChange}
						placeholder={m.admin_keywords_search()}
						className="w-full sm:max-w-xs"
					/>
				}
			/>

			<AdminSection title={m.admin_keywords_section()} description={m.admin_keywords_imported_description()}>
				{error ? (
					<AppErrorState error={error} onRetry={handleRetry} />
				) : (
					<div className="flex flex-col gap-4">
						<div className="flex flex-wrap gap-2">
							{keywords.map((keyword) => (
								<div
									key={keyword.id}
									className="flex items-center gap-1 rounded-lg border border-border/80 bg-muted/20 px-3 py-1.5 font-mono text-foreground text-xs transition-[border-color,background-color,color,box-shadow] duration-150 hover:border-primary/40 hover:bg-muted/40 hover:text-primary hover:shadow-2xs sm:text-sm"
								>
									<span className="font-bold text-primary/70">{m.admin_keywords_tag_prefix()}</span>
									<span>{keyword.name}</span>
								</div>
							))}

							{keywords.length === 0 && !isLoading && (
								<div className="w-full">
									<AppEmptyState
										icon={Hash}
										title={m.components_search_no_results()}
										description={searchQuery ? m.admin_keywords_no_matches() : m.admin_keywords_appear_automatically()}
									/>
								</div>
							)}
						</div>

						<SimplePagination variant="admin" currentPage={page} totalPages={totalPages} isLoading={isLoading} onPageChange={setPage} />
					</div>
				)}
			</AdminSection>
		</div>
	);
}
