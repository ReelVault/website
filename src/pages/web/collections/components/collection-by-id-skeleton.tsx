import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";

export function CollectionByIdSkeleton() {
	return (
		<div className="min-h-screen overflow-x-hidden bg-background text-foreground" role="status" aria-label={m.web_loading_collection()}>
			{/* Hero Skeleton */}
			<section className="relative min-h-[62vh] border-border border-b lg:min-h-[70vh]">
				<div className="absolute inset-0 overflow-hidden bg-card">
					<div className="absolute inset-0 bg-linear-to-t from-background via-background/65 to-background/10" />
					<div className="absolute inset-0 bg-linear-to-r from-background via-background/40 to-transparent" />
				</div>

				<div className="cinema-shell relative flex min-h-[62vh] flex-col justify-end py-16 lg:min-h-[70vh]">
					<div className="max-w-3xl space-y-4">
						<Skeleton className="h-4 w-32 rounded-md" />
						<Skeleton className="h-10 w-72 rounded-xl sm:h-14 sm:w-110" />
						<Skeleton className="h-4.5 w-full max-w-lg rounded-md" />
						<div className="flex flex-wrap gap-3 pt-4">
							<Skeleton className="h-10 w-48 rounded-xl" />
							<Skeleton className="h-10 w-36 rounded-xl" />
						</div>
					</div>
				</div>
			</section>

			{/* Main Content Skeleton */}
			<main className="cinema-shell py-16 lg:py-24">
				<div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
					<div className="space-y-2">
						<Skeleton className="h-7 w-48 rounded-md" />
						<Skeleton className="h-4 w-72 rounded-md" />
					</div>
					<Skeleton className="h-10 w-24 rounded-lg" />
				</div>

				<div className="space-y-12">
					{["item-1", "item-2", "item-3"].map((key) => (
						<article key={key} className="grid gap-8 border-border/70 border-b pb-12 lg:grid-cols-[5rem_13rem_1fr] lg:gap-10">
							{/* Index / Number */}
							<div className="hidden pt-2 text-right lg:block">
								<Skeleton className="ml-auto h-9 w-12 rounded-md" />
								<Skeleton className="mt-2 ml-auto h-3.5 w-14 rounded-md" />
							</div>

							{/* Poster */}
							<div className="flex justify-center lg:justify-start">
								<Skeleton className="aspect-2/3 w-48 rounded-xl" />
							</div>

							{/* Details */}
							<div className="min-w-0 space-y-4 lg:pt-3">
								<div className="flex items-center gap-3">
									<Skeleton className="h-4 w-12 rounded-md" />
									<Skeleton className="h-4 w-16 rounded-md" />
									<Skeleton className="h-5 w-14 rounded-full" />
								</div>
								<Skeleton className="h-9 w-3/4 max-w-md rounded-xl" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-full max-w-xl rounded-md" />
									<Skeleton className="h-4 w-4/5 max-w-lg rounded-md" />
								</div>
								<Skeleton className="h-4 w-32 rounded-md pt-2" />
							</div>
						</article>
					))}
				</div>
			</main>
		</div>
	);
}
