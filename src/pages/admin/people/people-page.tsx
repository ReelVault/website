import { Users } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useAdminPeople } from "@/client/hooks/use-admin-people";
import { useBulkRefreshPeople, useRefreshPerson, useRefreshPersonImage } from "@/client/hooks/use-person-data";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { LazyRender } from "@/components/lazy-render";
import { SimplePagination } from "@/components/simple-pagination";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSearch, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { PersonCard } from "./components/person-card";

export default function AdminPeoplePage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	// Selection spans the pages shown while it lasts, like the admin media list.
	const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());
	const debouncedSearch = useDebounce({ value: searchQuery, delay: 400 });
	const { people, total, totalPages, isLoading, error, refetch } = useAdminPeople(debouncedSearch, page, 48);
	const refreshPersonMutation = useRefreshPerson();
	const refreshPersonImageMutation = useRefreshPersonImage();
	const bulkRefreshPeople = useBulkRefreshPeople();

	const toggleSelect = (id: string) => {
		setSelectedIds((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);

			return next;
		});
	};

	/** Selects every person on the page, or clears them when they are all selected already. */
	const toggleAllOnPage = () => {
		const pageIds = people.map((person) => person.id);
		setSelectedIds((current) => {
			const allSelected = pageIds.every((id) => current.has(id));
			const next = new Set(current);
			for (const id of pageIds) {
				if (allSelected) next.delete(id);
				else next.add(id);
			}

			return next;
		});
	};

	const clearSelection = () => setSelectedIds(new Set());

	const refreshSelectedPeople = async () => {
		try {
			await bulkRefreshPeople.mutateAsync([...selectedIds]);
			clearSelection();
		} catch {
			// Toast is handled by hook
		}
	};

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
		const allOnPageSelected = people.length > 0 && people.every((person) => selectedIds.has(person.id));
		peopleContent = (
			<div className="flex flex-col gap-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<label className="flex cursor-pointer items-center gap-2 text-sm">
						<input type="checkbox" className="size-4 accent-primary" checked={allOnPageSelected} onChange={() => toggleAllOnPage()} />
						{m.admin_people_select_all()}
					</label>
					{selectedIds.size > 0 && (
						<div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/80 bg-card p-3">
							<span className="text-sm">{m.admin_people_selected_count({ count: selectedIds.size })}</span>
							<Button size="sm" variant="outline" disabled={bulkRefreshPeople.isPending} onClick={() => detach(refreshSelectedPeople())}>
								{m.admin_people_refresh_selected()}
							</Button>
							<Button size="sm" variant="ghost" onClick={clearSelection}>
								{m.admin_people_clear_selection()}
							</Button>
						</div>
					)}
				</div>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
					{people.map((person) => (
						<LazyRender key={person.id} minHeight={260}>
							{() => (
								<PersonCard
									person={person}
									selected={selectedIds.has(person.id)}
									onToggleSelect={toggleSelect}
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

			<AdminSection title={m.admin_people_indexed_people()} description={m.admin_people_imported_database()}>
				{peopleContent}
			</AdminSection>
		</div>
	);
}
