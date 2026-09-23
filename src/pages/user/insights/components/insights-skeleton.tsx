import { Skeleton } from "@/components/ui/skeleton";

export function InsightsSkeleton() {
	return (
		<div className="relative min-h-screen space-y-6">
			<header className="mb-8 flex flex-col gap-4">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-10 w-64" />
			</header>

			<div className="grid auto-rows-45 grid-cols-1 gap-6 md:grid-cols-6 lg:grid-cols-12">
				<Skeleton className="col-span-1 row-span-2 rounded-2xl md:col-span-4 lg:col-span-8" />
				<Skeleton className="col-span-1 row-span-2 rounded-2xl md:col-span-2 lg:col-span-4" />
				<Skeleton className="col-span-1 row-span-1 rounded-2xl md:col-span-3 lg:col-span-5" />
				<Skeleton className="col-span-1 row-span-1 rounded-2xl md:col-span-3 lg:col-span-7" />
			</div>
		</div>
	);
}
