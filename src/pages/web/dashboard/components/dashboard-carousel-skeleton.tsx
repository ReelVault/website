import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ITEMS = ["skel-1", "skel-2", "skel-3", "skel-4", "skel-5", "skel-6"] as const;

export function DashboardCarouselSkeleton() {
	return (
		<div className="flex gap-4 overflow-hidden">
			{SKELETON_ITEMS.map((key) => (
				<div key={key} className="w-64 shrink-0 space-y-3">
					<Skeleton className="aspect-2/3 w-full rounded-xl" />
					<div className="space-y-1.5">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
				</div>
			))}
		</div>
	);
}
