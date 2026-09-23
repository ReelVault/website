import { Users } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useAdminPeople } from "@/client/hooks/use-admin-people";
import { useRefreshPerson, useRefreshPersonImage } from "@/client/hooks/use-person-data";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { LazyRender } from "@/components/lazy-render";
import { SimplePagination } from "@/components/simple-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSearch, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { PersonCard } from "./components/person-card";

export default function AdminPeoplePage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const debouncedSearch = useDebounce({ value: searchQuery, delay: 400 });
	const { people, total, totalPages, isLoading, error, refetch } = useAdminPeople(debouncedSearch, page, 48);
	const refreshPersonMutation = useRefreshPerson();
	const refreshPersonImageMutation = useRefreshPersonImage();

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setPage(1);
	};

	const handleRetry = () => {
		detach(refetch());
	};

	let peopleContent: ReactNode;
	if (error) {
		peopleContent = <AppErrorState error={error} onRetry={handleRetry} />;
	} else if (people.length === 0 && !isLoading) {
		peopleContent = (
			<AppEmptyState
				icon={Users}
				title={m.admin_people_no_people()}
				description={searchQuery ? m.admin_people_no_matches() : m.admin_people_appear_automatically()}
			/>
		);
	} else {
		peopleContent = (
			<div className="flex flex-col gap-6">
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
					{people.map((person) => (
						<LazyRender key={person.id} minHeight={260}>
							{() => (
								<PersonCard
									person={person}
									onRefresh={(id) => refreshPersonMutation.mutate(id)}
									onRefreshImage={(id) => refreshPersonImageMutation.mutate(id)}
								/>
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
				icon={Users}
				eyebrow={m.admin_people_eyebrow()}
				title={m.admin_nav_people()}
				count={total}
				description={m.admin_people_linked_description()}
				actions={
					<AdminSearch
						value={searchQuery}
						onChange={handleSearchChange}
						placeholder={m.admin_people_search()}
						className="w-full sm:max-w-xs"
					/>
				}
			/>

			<AdminSection title="Zindeksowane osoby" description={m.admin_people_imported_database()}>
				{peopleContent}
			</AdminSection>
		</div>
	);
}
