import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";

export function DashboardHeroSkeleton() {
	return (
		<div
			className="relative h-[88svh] w-full overflow-hidden bg-background lg:h-screen lg:min-h-150"
			role="status"
			aria-label={m.web_loading_recommendations()}
		>
			{/* Backdrop Gradient Base */}
			<div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-background/10" />
			<div className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-transparent" />

			{/* Main Content Skeleton */}
			<div className="relative flex h-full items-center px-6 sm:px-10 lg:px-24">
				<div className="flex max-w-4xl flex-col items-start gap-6 md:gap-8">
					{/* Badges */}
					<div className="flex flex-wrap items-center gap-3">
						<Skeleton className="h-8 w-20 rounded-md" />
						<Skeleton className="h-8 w-20 rounded-md" />
						<Skeleton className="h-8 w-16 rounded-md" />
					</div>

					{/* Title */}
					<div className="space-y-3">
						<Skeleton className="h-12 w-80 rounded-xl sm:h-16 sm:w-130 md:h-20 md:w-160" />
						<Skeleton className="h-8 w-48 rounded-xl sm:h-10 sm:w-72" />
					</div>

					{/* Description */}
					<div className="w-full max-w-xl space-y-2.5">
						<Skeleton className="h-4.5 w-full rounded-md" />
						<Skeleton className="h-4.5 w-5/6 rounded-md" />
						<Skeleton className="h-4.5 w-2/3 rounded-md" />
					</div>

					{/* Buttons */}
					<div className="flex flex-wrap items-center gap-4 pt-2">
						<Skeleton className="h-11 w-44 rounded-xl" />
						<Skeleton className="h-11 w-32 rounded-xl" />
					</div>
				</div>
			</div>
		</div>
	);
}
