import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";

export function PersonPageSkeleton() {
	return (
		<div className="cinema-page" role="status" aria-label={m.web_loading_creator_profile()}>
			{/* Background Decoration */}
			<div className="pointer-events-none absolute top-0 left-1/4 h-125 w-125 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_10%,transparent)_0%,transparent_70%)]" />

			<div className="relative flex flex-col gap-16 px-6 py-12 sm:px-12 lg:flex-row lg:px-24">
				{/* Sidebar Skeleton */}
				<div className="flex h-fit shrink-0 flex-col gap-8 lg:sticky lg:top-32 lg:w-80">
					{/* Portrait Skeleton */}
					<div className="mx-auto w-full max-w-70 lg:max-w-none">
						<Skeleton className="aspect-3/4 w-full" />
					</div>

					{/* Quick Info Grid */}
					<div className="grid grid-cols-2 gap-3">
						<Skeleton className="h-20" />
						<Skeleton className="h-20" />
					</div>

					{/* Bio Skeleton */}
					<div className="border-border/50 bg-card/60 space-y-3 rounded-xl border p-6">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
						<Skeleton className="h-4 w-3/4" />
					</div>

					{/* Filmography mini timeline skeleton */}
					<div className="space-y-3">
						<Skeleton className="h-4 w-28" />
						<div className="space-y-2">
							{["tm-1", "tm-2", "tm-3", "tm-4"].map((key) => (
								<div key={key} className="flex items-center gap-4 rounded-xl p-2">
									<Skeleton className="h-4 w-12" />
									<Skeleton className="h-4 w-40" />
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Main Content Area */}
				<div className="flex min-w-0 flex-1 flex-col gap-12 sm:gap-16">
					{/* Hero Title */}
					<div className="space-y-4">
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-12 w-72 sm:h-16 sm:w-110" />
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						<Skeleton className="col-span-2 h-36 md:col-span-2" />
						<Skeleton className="h-36" />
						<Skeleton className="h-36" />
					</div>

					{/* Filmography Section */}
					<section className="space-y-6">
						<div className="space-y-2">
							<Skeleton className="h-7 w-40" />
							<Skeleton className="h-4 w-60" />
						</div>

						{/* Filmography Grid */}
						<div className="flex flex-row flex-wrap gap-4">
							{["f-1", "f-2", "f-3", "f-4", "f-5", "f-6", "f-7", "f-8"].map((key) => (
								<Skeleton key={key} className="aspect-2/3 w-36 sm:w-44" />
							))}
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
