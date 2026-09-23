import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { useState } from "react";
import { useCollections } from "@/client/hooks/use-collections";
import { LazyRender } from "@/components/lazy-render";
import { SimpleAnimation } from "@/components/simple-animation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/hooks/use-page-title";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { CollectionCard } from "./components/collection-card";

const SKELETON_KEYS = ["1", "2", "3", "4", "5", "6"] as const;

export default function CollectionsPage() {
	usePageTitle(m.navbar_collections());
	const [page, setPage] = useState(1);
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
						<div role="alert" className="cinema-surface max-w-xl p-6">
							<p className="font-semibold">{m.admin_collections_failed_to_fetch()}</p>
							<p className="mt-1 text-muted-foreground text-sm">{m.web_check_connection()}</p>
							<Button
								type="button"
								variant="outline"
								className="mt-4"
								onClick={() => {
									detach(refetch());
								}}
							>
								{m.common_try_again()}
							</Button>
						</div>
					)}
					{!(isLoading || isError) && collections?.data.length === 0 && (
						<div className="cinema-surface max-w-xl p-8 text-center">
							<Layers className="mx-auto size-7 text-primary" />
							<h2 className="mt-4 font-bold text-xl">{m.admin_collections_no_collections()}</h2>
							<p className="mt-2 text-muted-foreground text-sm">{m.web_collections_appear_when_assigned()}</p>
						</div>
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
						<nav aria-label={m.web_collections_pagination()} className="mt-12 flex items-center justify-center gap-4">
							<Button
								variant="outline"
								size="icon"
								className="size-10 sm:size-8"
								onClick={() => setPage(collections.page - 1)}
								disabled={collections.page === 1}
								aria-label={m.common_prev_page()}
							>
								<ChevronLeft className="size-4" />
							</Button>
							<p className="text-muted-foreground text-sm">
								{m.common_page_x_of_y({ page: collections.page, total: collections.totalPages })}
							</p>
							<Button
								variant="outline"
								size="icon"
								className="size-10 sm:size-8"
								onClick={() => setPage(collections.page + 1)}
								disabled={collections.page === collections.totalPages}
								aria-label={m.web_next_page()}
							>
								<ChevronRight className="size-4" />
							</Button>
						</nav>
					)}
				</section>
			</main>
		</div>
	);
}
