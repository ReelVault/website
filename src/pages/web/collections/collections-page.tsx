import { useNavigate, useSearch } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { useCollections } from "@/client/hooks/use-collections";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { LazyRender } from "@/components/lazy-render";
import { SimpleAnimation } from "@/components/simple-animation";
import { SimplePagination } from "@/components/simple-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/hooks/use-page-title";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { CollectionCard } from "./components/collection-card";

const SKELETON_KEYS = ["1", "2", "3", "4", "5", "6"] as const;

export default function CollectionsPage() {
	usePageTitle(m.navbar_collections());
	const { page = 1 } = useSearch({ from: "/_web/collections/" });
	const navigate = useNavigate({ from: "/collections/" });
	const setPage = (next: number) => {
		detach(navigate({ search: { page: next > 1 ? next : undefined }, replace: true }));
	};
	const { data: collections, isLoading, isError, refetch } = useCollections(page);

	return (
		<div className="cinema-page">
			<main className="cinema-shell relative">
				<SimpleAnimation direction="none" duration={260}>
					<header className="max-w-3xl border-border/70 border-b pb-10 sm:pb-14">
						<p className="cinema-kicker">
							<Layers className="size-4" aria-hidden="true" /> {m.web_collections_library()}
						</p>
						<h1 className="cinema-title mt-5">{m.web_collections_heading()}</h1>
						<p className="cinema-copy mt-5">{m.web_collections_cinema_copy()}</p>
					</header>
				</SimpleAnimation>
				<section className="mt-10 sm:mt-14" aria-labelledby="collections-heading">
					<div className="mb-7 flex items-end justify-between gap-4">
						<div className="cinema-section-heading">
							<h2 id="collections-heading">{m.web_all_collections()}</h2>
							<p>{isLoading ? m.common_loading_collections() : m.web_collections_available_count({ count: collections?.total ?? 0 })}</p>
						</div>
					</div>
					{isLoading && (
						<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label={m.web_loading_collection()}>
							{SKELETON_KEYS.map((key) => (
								<Skeleton key={key} className="aspect-video rounded-xl" />
							))}
						</div>
					)}
					{isError && (
						<AppErrorState
							title={m.web_collections_fetch_failed()}
							description={m.web_check_connection()}
							onRetry={() => detach(refetch())}
							className="max-w-xl"
						/>
					)}
					{!(isLoading || isError) && collections?.data.length === 0 && (
						<AppEmptyState
							icon={Layers}
							title={m.web_collections_empty_heading()}
							description={m.web_collections_appear_when_assigned()}
							className="max-w-xl"
						/>
					)}
					{!(isLoading || isError) && collections && collections.data.length > 0 && (
						<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
							{collections.data.map((collection) => (
								<LazyRender key={collection.id} minHeight={240} rootMargin="350px 0px">
									{() => (
										<SimpleAnimation direction="up" duration={240}>
											<CollectionCard collection={collection} />
										</SimpleAnimation>
									)}
								</LazyRender>
							))}
						</div>
					)}
					{!(isLoading || isError) && collections && collections.totalPages > 1 && (
						<div className="mt-12">
							<SimplePagination currentPage={collections.page} totalPages={collections.totalPages} onPageChange={setPage} />
						</div>
					)}
				</section>
			</main>
		</div>
	);
}
