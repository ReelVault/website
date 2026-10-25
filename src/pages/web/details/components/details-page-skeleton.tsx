import { PageContainer } from "@/components/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";

export function DetailsPageSkeleton() {
	return (
		<div className="bg-background text-foreground relative min-h-screen" role="status" aria-label={m.web_loading_details()}>
			{/* Hero / Header Skeleton */}
			<section className="border-border relative min-h-[550px] w-full border-b">
				{/* Backdrop Background */}
				<div className="bg-card absolute inset-0 overflow-hidden">
					<div className="from-background via-background/70 to-background/20 absolute inset-0 bg-linear-to-t" />
					<div className="from-background via-background/50 absolute inset-0 bg-linear-to-r to-transparent" />
				</div>

				<PageContainer className="relative flex min-h-[550px] flex-col justify-end py-10">
					<div className="flex flex-col gap-8 md:flex-row md:items-end md:gap-10">
						{/* Poster Skeleton */}
						<div className="mx-auto w-48 shrink-0 sm:w-56 md:mx-0 lg:w-64">
							<Skeleton className="aspect-2/3 w-full" />
						</div>

						{/* Details Stack Skeleton */}
						<div className="flex min-w-0 flex-1 flex-col items-start gap-4">
							{/* Badges */}
							<div className="flex flex-wrap items-center gap-2">
								<Skeleton className="h-6 w-16" />
								<Skeleton className="h-6 w-16" />
								<Skeleton className="h-6 w-12" />
								<Skeleton className="h-6 w-20" />
							</div>

							{/* Title */}
							<Skeleton className="h-10 w-full max-w-xl sm:h-14" />

							{/* Tagline */}
							<Skeleton className="h-5 w-72" />

							{/* Overview */}
							<div className="w-full max-w-2xl space-y-2 py-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-11/12" />
								<Skeleton className="h-4 w-3/4" />
							</div>

							{/* Action Buttons */}
							<div className="flex flex-wrap items-center gap-3 pt-2">
								<Skeleton className="h-11 w-40" />
								<Skeleton className="h-11 w-36" />
								<Skeleton className="h-11 w-28" />
							</div>
						</div>
					</div>
				</PageContainer>
			</section>

			{/* Content Sections Skeleton */}
			<PageContainer className="relative flex flex-col gap-12 py-16">
				{/* Cast Shelf Skeleton */}
				<div className="space-y-4">
					<Skeleton className="h-6 w-48" />
					<div className="flex gap-4 overflow-hidden">
						{["one", "two", "three", "four", "five", "six"].map((key) => (
							<div key={key} className="w-36 shrink-0 space-y-2">
								<Skeleton className="aspect-3/4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-1/2" />
							</div>
						))}
					</div>
				</div>

				{/* Related Shelf Skeleton */}
				<div className="space-y-4">
					<Skeleton className="h-6 w-40" />
					<div className="flex gap-4 overflow-hidden">
						{["rel-1", "rel-2", "rel-3", "rel-4", "rel-5"].map((key) => (
							<Skeleton key={key} className="aspect-2/3 w-44 shrink-0" />
						))}
					</div>
				</div>
			</PageContainer>
		</div>
	);
}
