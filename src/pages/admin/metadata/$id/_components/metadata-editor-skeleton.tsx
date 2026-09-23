import { Skeleton } from "@/components/ui/skeleton";

export function MetadataEditorSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-9 w-64" />
				</div>
				<div className="flex gap-2">
					<Skeleton className="h-9 w-28 rounded-lg" />
					<Skeleton className="h-9 w-28 rounded-lg" />
				</div>
			</div>
			<Skeleton className="h-48 w-full rounded-2xl" />
			<div className="grid gap-6 lg:grid-cols-3">
				<Skeleton className="h-96 w-full rounded-2xl lg:col-span-2" />
				<Skeleton className="h-96 w-full rounded-2xl" />
			</div>
		</div>
	);
}
