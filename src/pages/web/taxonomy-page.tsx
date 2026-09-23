import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { MetadataCard } from "@/components/cards/metadata-card";
import { LazyRender } from "@/components/lazy-render";
import { SimpleAnimation } from "@/components/simple-animation";
import { SimplePagination } from "@/components/simple-pagination";
import { ApiImage } from "@/components/ui/api-image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";

const TITLE_SKELETONS = ["one", "two", "three", "four", "five", "six"] as const;

type MetadataCardItem = React.ComponentProps<typeof MetadataCard>["metadata"];

interface TaxonomyQuery {
	isLoading: boolean;
	isError: boolean;
	data?: { name: string } | null;
}

interface MetadataQuery {
	isLoading: boolean;
	isError: boolean;
	isFetching: boolean;
}

interface TaxonomyPageProps {
	icon: LucideIcon;
	taxonomyLabel: string;
	sectionTitle: string;
	errorMessage: string;
	taxonomyQuery: TaxonomyQuery;
	metadataQuery: MetadataQuery;
	metadata: MetadataCardItem[];
	total: number;
	totalPages: number;
	page: number;
	onPageChange: (page: number) => void;
	/** Target and label of the back link above the header. */
	backTo: "/" | "/companies";
	backLabel: string;
	/** Entity logo (e.g. company) — replaces the header icon when present. */
	logoImageId?: string | null;
	/** Logo version — image cache key (busting when the file is replaced). */
	logoUpdatedAt?: Date | string | null;
	/** Extra line under the title (e.g. the company's original name). */
	headerSubtitle?: string;
	/** Retry button in error blocks — rendered only when provided. */
	onTaxonomyRetry?: () => void;
	onMetadataRetry?: () => void;
	/** Error message for the titles section (defaults to the one for genres/keywords). */
	metadataErrorMessage?: string;
}

export function TaxonomyPage({
	icon: Icon,
	taxonomyLabel,
	sectionTitle,
	errorMessage,
	taxonomyQuery,
	metadataQuery,
	metadata,
	total,
	totalPages,
	page,
	onPageChange,
	backTo,
	backLabel,
	logoImageId,
	logoUpdatedAt,
	headerSubtitle,
	onTaxonomyRetry,
	onMetadataRetry,
	metadataErrorMessage,
}: TaxonomyPageProps) {
	const item = taxonomyQuery.data;

	return (
		<div className="cinema-page">
			<main className="cinema-shell relative">
				<Link to={backTo} className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-primary">
					<ArrowLeft className="size-4" aria-hidden="true" /> {backLabel}
				</Link>
				{taxonomyQuery.isLoading && (
					<div className="mt-8 flex gap-5">
						<Skeleton className="size-28 rounded-2xl" />
						<div className="flex flex-1 flex-col gap-3">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-14 max-w-lg" />
						</div>
					</div>
				)}
				{!taxonomyQuery.isLoading && (taxonomyQuery.isError || !item) && (
					<div role="alert" className="cinema-surface mt-8 max-w-xl p-6">
						<p className="font-semibold">{errorMessage}</p>
						<p className="mt-1 text-muted-foreground text-sm">{m.web_check_connection()}</p>
						{onTaxonomyRetry && (
							<Button type="button" variant="outline" className="mt-4" onClick={onTaxonomyRetry}>
								{m.common_try_again()}
							</Button>
						)}
					</div>
				)}
				{item && (
					<>
						<SimpleAnimation direction="none" duration={260}>
							<header className="mt-8 flex flex-col gap-5 border-border/70 border-b pb-10 sm:mt-10 sm:flex-row sm:items-end">
								<div className="cinema-surface flex size-28 shrink-0 items-center justify-center overflow-hidden p-4 text-primary">
									{logoImageId ? (
										<ApiImage
											fileId={logoImageId}
											cacheKey={logoUpdatedAt}
											alt={item.name}
											width={224}
											aspectRatio={1}
											className="size-full object-contain"
										/>
									) : (
										<Icon className="size-9" aria-hidden="true" />
									)}
								</div>
								<div className="min-w-0">
									<p className="cinema-kicker">{taxonomyLabel}</p>
									<h1 className="cinema-title mt-4">{item.name}</h1>
									{headerSubtitle && <p className="mt-3 text-muted-foreground">{headerSubtitle}</p>}
								</div>
							</header>
						</SimpleAnimation>
						<section className="mt-10 sm:mt-14">
							<div className="cinema-section-heading">
								<h2>{sectionTitle}</h2>
								<p>{m.web_taxonomy_items_in_catalog({ count: total })}</p>
							</div>
							{metadataQuery.isLoading && (
								<div className="poster-shelf mt-8">
									{TITLE_SKELETONS.map((key) => (
										<Skeleton key={key} className="aspect-2/3 w-full rounded-xl" />
									))}
								</div>
							)}
							{metadataQuery.isError && (
								<div role="alert" className="cinema-surface mt-8 p-6">
									<p className="font-semibold">{metadataErrorMessage ?? m.web_titles_fetch_failed()}</p>
									{onMetadataRetry && (
										<Button type="button" variant="outline" className="mt-4" onClick={onMetadataRetry}>
											{m.common_try_again()}
										</Button>
									)}
								</div>
							)}
							{!(metadataQuery.isLoading || metadataQuery.isError) && metadata.length === 0 && (
								<div className="cinema-surface mt-8 p-6 text-muted-foreground">{m.web_no_assigned_titles()}</div>
							)}
							{metadata.length > 0 && !metadataQuery.isLoading && (
								<>
									<div className="poster-shelf mt-8">
										{metadata.map((title) => (
											<LazyRender key={title.id} minHeight={320} rootMargin="350px 0px" className="flex min-w-0 justify-center">
												{() => (
													<SimpleAnimation direction="up" duration={240} className="w-full">
														<MetadataCard metadata={title} fluid />
													</SimpleAnimation>
												)}
											</LazyRender>
										))}
									</div>
									<SimplePagination
										currentPage={page}
										totalPages={totalPages}
										isLoading={metadataQuery.isFetching}
										onPageChange={onPageChange}
									/>
								</>
							)}
						</section>
					</>
				)}
			</main>
		</div>
	);
}
