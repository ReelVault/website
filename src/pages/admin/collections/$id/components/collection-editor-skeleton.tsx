import { Skeleton } from "@/components/ui/skeleton";

export function CollectionEditorSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<Skeleton className="h-4 w-32" />
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-2">
					<Skeleton className="h-4 w-40" />
					<Skeleton className="h-9 w-72" />
				</div>
				<Skeleton className="h-9 w-36 rounded-lg" />
			</div>
			<Skeleton className="h-32 w-full rounded-2xl" />
			<Skeleton className="h-40 w-full rounded-2xl" />
		</div>
	);
}
