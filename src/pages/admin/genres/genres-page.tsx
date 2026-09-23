import { Tag } from "lucide-react";
import { useState } from "react";
import { useAdminGenres } from "@/client/hooks/use-admin-genres";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSearch, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

export default function AdminGenresPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce({ value: searchQuery, delay: 400 });
	const { genres, total, error, refetch } = useAdminGenres(debouncedSearch);
	const handleRetry = () => {
		detach(refetch());
	};

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={Tag}
				eyebrow={m.admin_genres_content_classification()}
				title={m.components_search_genres_heading()}
				count={total}
				description={m.admin_genres_linked_description()}
				actions={
					<AdminSearch value={searchQuery} onChange={setSearchQuery} placeholder={m.admin_genres_search()} className="w-full sm:max-w-xs" />
				}
			/>

			<AdminSection title={m.admin_indexed_genres()} description={m.admin_genres_synced_categories()}>
				{error ? (
					<AppErrorState error={error} onRetry={handleRetry} />
				) : (
					<div className="flex flex-wrap gap-2.5">
						{genres.map((genre) => (
							<div
								key={genre.id}
								className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2.5 transition-[border-color,background-color,color,box-shadow] duration-150 hover:border-primary/40 hover:bg-muted/40 hover:shadow-2xs"
							>
								<Tag className="size-3.5 text-primary" />
								<span className="font-semibold text-foreground text-sm tracking-tight">{genre.name}</span>
							</div>
						))}

						{genres.length === 0 && (
							<div className="w-full">
								<AppEmptyState
									icon={Tag}
									title={m.admin_genres_no_genres()}
									description={searchQuery ? m.admin_genres_no_matches() : m.admin_genres_appear_automatically()}
								/>
							</div>
						)}
					</div>
				)}
			</AdminSection>
		</div>
	);
}
