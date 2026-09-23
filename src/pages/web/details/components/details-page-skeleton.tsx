import { PageContainer } from "@/components/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";

export function DetailsPageSkeleton() {
	return (
		<div className="relative min-h-screen bg-background text-foreground" role="status" aria-label={m.web_loading_details()}>
			{/* Hero / Header Skeleton */}
			<section className="relative min-h-[550px] w-full border-border border-b">
				{/* Backdrop Background */}
				<div className="absolute inset-0 overflow-hidden bg-card">
					<div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-background/20" />
					<div className="absolute inset-0 bg-linear-to-r from-background via-background/50 to-transparent" />
				</div>

				<PageContainer className="relative flex min-h-[550px] flex-col justify-end py-10">
					<div className="flex flex-col gap-8 md:flex-row md:items-end md:gap-10">
						{/* Poster Skeleton */}
						<div className="mx-auto w-48 shrink-0 sm:w-56 md:mx-0 lg:w-64">
							<Skeleton className="aspect-2/3 w-full rounded-2xl shadow-2xl" />
						</div>

						{/* Details Stack Skeleton */}
						<div className="flex min-w-0 flex-1 flex-col items-start gap-4">
							{/* Badges */}
							<div className="flex flex-wrap items-center gap-2">
								<Skeleton className="h-6 w-16 rounded-md" />
								<Skeleton className="h-6 w-16 rounded-md" />
								<Skeleton className="h-6 w-12 rounded-md" />
								<Skeleton className="h-6 w-20 rounded-md" />
							</div>

							{/* Title */}
							<Skeleton className="h-10 w-full max-w-xl rounded-xl sm:h-14" />

							{/* Tagline */}
							<Skeleton className="h-5 w-72 rounded-md" />

							{/* Overview */}
							<div className="w-full max-w-2xl space-y-2 py-2">
								<Skeleton className="h-4 w-full rounded-md" />
								<Skeleton className="h-4 w-11/12 rounded-md" />
								<Skeleton className="h-4 w-3/4 rounded-md" />
							</div>

							{/* Action Buttons */}
							<div className="flex flex-wrap items-center gap-3 pt-2">
								<Skeleton className="h-11 w-40 rounded-xl" />
								<Skeleton className="h-11 w-36 rounded-xl" />
								<Skeleton className="h-11 w-28 rounded-xl" />
							</div>
						</div>
					</div>
				</PageContainer>
			</section>

			{/* Content Sections Skeleton */}
			<PageContainer className="relative flex flex-col gap-12 py-16">
				{/* Cast Shelf Skeleton */}
				<div className="space-y-4">
					<Skeleton className="h-6 w-48 rounded-md" />
					<div className="flex gap-4 overflow-hidden">
						{["one", "two", "three", "four", "five", "six"].map((key) => (
							<div key={key} className="w-36 shrink-0 space-y-2">
								<Skeleton className="aspect-3/4 w-full rounded-xl" />
								<Skeleton className="h-4 w-3/4 rounded-md" />
								<Skeleton className="h-3 w-1/2 rounded-md" />
							</div>
						))}
					</div>
				</div>

				{/* Related Shelf Skeleton */}
				<div className="space-y-4">
					<Skeleton className="h-6 w-40 rounded-md" />
					<div className="flex gap-4 overflow-hidden">
						{["rel-1", "rel-2", "rel-3", "rel-4", "rel-5"].map((key) => (
							<Skeleton key={key} className="aspect-2/3 w-44 shrink-0 rounded-xl" />
						))}
					</div>
				</div>
			</PageContainer>
		</div>
	);
}
