import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2 } from "lucide-react";
import { useCompanies } from "@/client/hooks/use-companies";
import { LazyRender } from "@/components/lazy-render";
import { SimpleAnimation } from "@/components/simple-animation";
import { ApiImage } from "@/components/ui/api-image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

const COMPANY_SKELETONS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

export default function CompaniesPage() {
	const { data, isLoading, isError, refetch } = useCompanies();
	const companies = data?.data ?? [];

	return (
		<div className="cinema-page">
			<main className="cinema-shell relative">
				<SimpleAnimation direction="none" duration={260}>
					<header className="max-w-3xl border-border/70 border-b pb-10 sm:pb-14">
						<p className="cinema-kicker">
							<Building2 className="size-4" aria-hidden="true" />
							{m.web_catalog_productions()}
						</p>
						<h1 className="cinema-title mt-5">{m.web_studios_and_companies()}</h1>
						<p className="cinema-copy mt-5">{m.web_open_studio_hint()}</p>
					</header>
				</SimpleAnimation>

				<section className="mt-10 sm:mt-14" aria-labelledby="companies-heading">
					<div className="mb-6 flex items-end justify-between gap-4">
						<div className="cinema-section-heading">
							<h2 id="companies-heading">{m.web_all_studios()}</h2>
							<p>{isLoading ? m.common_loading_catalog() : m.web_companies_count_in_catalog({ count: companies.length })}</p>
						</div>
					</div>
					{isLoading && (
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label={m.web_loading_companies()}>
							{COMPANY_SKELETONS.map((key) => (
								<Skeleton key={key} className="h-24 rounded-2xl" />
							))}
						</div>
					)}
					{isError && (
						<div role="alert" className="cinema-surface max-w-xl p-6">
							<p className="font-semibold">{m.web_companies_fetch_failed()}</p>
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
					{!(isLoading || isError) && companies.length === 0 && (
						<div className="cinema-surface max-w-xl p-8 text-center">
							<Building2 className="mx-auto size-7 text-primary" aria-hidden="true" />
							<h2 className="mt-4 font-bold text-xl">{m.web_no_companies_heading()}</h2>
							<p className="mt-2 text-muted-foreground text-sm">{m.web_producers_appear_hint()}</p>
						</div>
					)}
					{companies.length > 0 && (
						<SimpleAnimation direction="up" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{companies.map((company, index) => (
								<LazyRender key={company.id} minHeight={88} rootMargin="350px 0px">
									{() => (
										<Link
											to="/companies/$id"
											params={{ id: company.id }}
											className="group cinema-surface flex min-w-0 items-center gap-4 p-3 transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card focus-visible:ring-2 focus-visible:ring-primary"
											style={{ transitionDelay: `${Math.min(index, 8) * 20}ms` }}
										>
											<div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background text-primary">
												{company.imageId ? (
													<ApiImage
														fileId={company.imageId}
														cacheKey={company.updatedAt}
														alt=""
														width={128}
														aspectRatio={1}
														className="size-full object-contain p-2.5"
													/>
												) : (
													<Building2 className="size-6" aria-hidden="true" />
												)}
											</div>
											<div className="min-w-0 flex-1">
												<h2 className="truncate font-bold text-foreground transition-colors group-hover:text-primary">{company.name}</h2>
												{company.originalName && <p className="mt-1 truncate text-muted-foreground text-sm">{company.originalName}</p>}
											</div>
											<ArrowRight
												className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
												aria-hidden="true"
											/>
										</Link>
									)}
								</LazyRender>
							))}
						</SimpleAnimation>
					)}
				</section>
			</main>
		</div>
	);
}
