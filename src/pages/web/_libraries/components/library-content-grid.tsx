import type { MetadataWithRelation, RequireFields } from "@reelvault/sdk";
import { Search } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import type { metadataCardFields } from "@/client/utils/fields";
import { AppEmptyState } from "@/components/app-states";
import { MetadataCard } from "@/components/cards/metadata-card";
import { LazyRender } from "@/components/lazy-render";
import { SimpleAnimation } from "@/components/simple-animation";
import { Spinner } from "@/components/ui/spinner";
import { m } from "@/paraglide/messages";

export function LibraryContentGrid({
	validMetadata,
	isLoadingMore,
	hasNextPage,
	onLoadMore,
}: {
	validMetadata: Array<RequireFields<MetadataWithRelation, typeof metadataCardFields>>;
	isLoadingMore?: boolean;
	hasNextPage?: boolean;
	onLoadMore?: () => void;
}) {
	const { ref: loadMoreRef, inView } = useInView({
		rootMargin: "300px",
	});

	useEffect(() => {
		if (inView && hasNextPage && !isLoadingMore) {
			onLoadMore?.();
		}
	}, [inView, hasNextPage, isLoadingMore, onLoadMore]);

	if (validMetadata.length === 0) {
		return (
			<div className="cinema-shell py-16">
				<SimpleAnimation>
					<AppEmptyState icon={Search} title={m.components_search_no_results()} description={m.web_change_search_hint()} />
				</SimpleAnimation>
			</div>
		);
	}

	return (
		<main className="cinema-shell py-10">
			<div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{validMetadata.map((content) => (
					<LazyRender key={content.id} minHeight={340} rootMargin="350px 0px" className="flex justify-center">
						{() => (
							<SimpleAnimation direction="up" duration={240} className="w-full">
								<MetadataCard metadata={content} fluid transitionName={`title-${content.id}`} />
							</SimpleAnimation>
						)}
					</LazyRender>
				))}
			</div>

			{hasNextPage && (
				<div ref={loadMoreRef} className="mt-8 flex min-h-15 justify-center py-8">
					{isLoadingMore && (
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<Spinner />
							<span>{m.web_loading_more_titles()}</span>
						</div>
					)}
				</div>
			)}
		</main>
	);
}
