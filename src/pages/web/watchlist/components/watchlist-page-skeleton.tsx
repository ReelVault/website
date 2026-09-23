import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";

export function WatchlistPageSkeleton() {
	return (
		<div className="min-h-screen bg-background pt-16 lg:pt-20" role="status" aria-label={m.web_loading_watchlist()}>
			{/* Promoted Hero Banner Skeleton */}
			<section className="relative mx-auto mb-12 h-[min(34rem,46vh)] w-[calc(100%-2rem)] overflow-hidden rounded-xl border border-border sm:w-[calc(100%-3rem)] sm:rounded-2xl">
				<div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
				<div className="cinema-shell relative flex h-full flex-col justify-end pb-12">
					<div className="max-w-3xl space-y-4">
						<Skeleton className="h-4 w-36 rounded-md" />
						<Skeleton className="h-10 w-72 rounded-xl sm:h-14 sm:w-110" />
						<Skeleton className="h-11 w-44 rounded-xl" />
					</div>
				</div>
			</section>

			{/* Main Content Skeleton */}
			<div className="cinema-shell">
				<div className="flex flex-col gap-10 lg:flex-row">
					{/* Main Column */}
					<main className="flex flex-1 flex-col gap-10">
						{/* Filter Bar Skeleton */}
						<div className="cinema-surface flex h-14 items-center justify-between p-2">
							<div className="flex gap-2">
								<Skeleton className="h-9 w-20 rounded-lg" />
								<Skeleton className="h-9 w-20 rounded-lg" />
								<Skeleton className="h-9 w-20 rounded-lg" />
							</div>
							<Skeleton className="hidden h-5 w-24 rounded-md sm:block" />
						</div>

						{/* Cards Grid */}
						<div className="flex flex-row flex-wrap gap-5">
							{["wl-1", "wl-2", "wl-3", "wl-4", "wl-5", "wl-6", "wl-7", "wl-8"].map((key) => (
								<Skeleton key={key} className="aspect-2/3 w-36 rounded-xl sm:w-44 lg:w-48" />
							))}
						</div>
					</main>

					{/* Sidebar */}
					<aside className="flex w-full shrink-0 flex-col gap-5 lg:w-80 xl:w-88">
						<div className="cinema-surface space-y-6 p-6 lg:p-7">
							<Skeleton className="h-6 w-36 rounded-md" />

							<div className="space-y-4">
								<div className="flex items-center gap-4">
									<Skeleton className="size-11 rounded-lg" />
									<div className="space-y-1">
										<Skeleton className="h-3 w-12 rounded-md" />
										<Skeleton className="h-6 w-16 rounded-md" />
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4 pt-2">
									<div className="space-y-1">
										<Skeleton className="h-3 w-12 rounded-md" />
										<Skeleton className="h-5 w-10 rounded-md" />
									</div>
									<div className="space-y-1">
										<Skeleton className="h-3 w-12 rounded-md" />
										<Skeleton className="h-5 w-10 rounded-md" />
									</div>
								</div>
							</div>

							<Skeleton className="h-10 w-full rounded-xl" />
						</div>

						<Skeleton className="h-24 w-full rounded-xl" />
					</aside>
				</div>
			</div>
		</div>
	);
}
