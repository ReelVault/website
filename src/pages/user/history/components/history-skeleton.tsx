import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_KEYS = ["one", "two", "three", "four", "five", "six", "seven", "eight"] as const;

export function HistorySkeleton() {
	return (
		<div className="flex flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
			<div className="flex flex-col gap-4">
				<Skeleton className="h-6 w-32" />
				<Skeleton className="h-16 w-64" />
			</div>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
				{SKELETON_KEYS.map((key) => (
					<Skeleton key={key} className="h-48 rounded-2xl" />
				))}
			</div>
		</div>
	);
}
