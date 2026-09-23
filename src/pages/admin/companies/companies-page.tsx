import { Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useAdminCompanies } from "@/client/hooks/use-admin-companies";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { LazyRender } from "@/components/lazy-render";
import { SimplePagination } from "@/components/simple-pagination";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSearch, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

export default function AdminCompaniesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const debouncedSearch = useDebounce({ value: searchQuery, delay: 400 });
	const { companies, total, totalPages, isLoading, error, refetch } = useAdminCompanies(debouncedSearch, page, 48);

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setPage(1);
	};

	const handleRetry = () => {
		detach(refetch());
	};

	let companiesContent: ReactNode;
	if (error) {
		companiesContent = <AppErrorState error={error} onRetry={handleRetry} />;
	} else if (companies.length === 0 && !isLoading) {
		companiesContent = (
			<AppEmptyState
				icon={Building2}
				title={m.admin_companies_none()}
				description={searchQuery ? m.admin_companies_no_matches() : m.admin_companies_appear_automatically()}
			/>
		);
	} else {
		companiesContent = (
			<div className="flex flex-col gap-6">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{companies.map((company) => (
						<LazyRender key={company.id} minHeight={76}>
							{() => (
								<Link to="/companies/$id" params={{ id: company.id }} className="group block focus:outline-none">
									<Card className="h-full overflow-hidden border-border/80 bg-card transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-primary/40 hover:bg-muted/20 hover:shadow-xs">
										<CardContent className="flex items-center gap-3.5 p-4">
											<div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-xs transition-colors group-hover:bg-primary/20">
												<Building2 className="size-5" />
											</div>
											<div className="min-w-0 flex-1">
												<h3
													className="truncate font-semibold text-foreground text-sm tracking-tight group-hover:text-primary"
													title={company.name}
												>
													{company.name}
												</h3>
												{company.originalName && company.originalName !== company.name && (
													<p className="truncate text-muted-foreground text-xs">{company.originalName}</p>
												)}
											</div>
										</CardContent>
									</Card>
								</Link>
							)}
						</LazyRender>
					))}
				</div>

				<SimplePagination variant="admin" currentPage={page} totalPages={totalPages} isLoading={isLoading} onPageChange={setPage} />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={Building2}
				eyebrow={m.admin_companies_eyebrow()}
				title={m.admin_companies_section_title()}
				count={total}
				description={m.admin_companies_description()}
				actions={
					<AdminSearch
						value={searchQuery}
						onChange={handleSearchChange}
						placeholder={m.admin_companies_search()}
						className="w-full sm:max-w-xs"
					/>
				}
			/>

			<AdminSection title={m.admin_companies_section()} description={m.admin_companies_synced_studios_distributors()}>
				{companiesContent}
			</AdminSection>
		</div>
	);
}
