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
					<Skeleton className="h-9 w-28" />
					<Skeleton className="h-9 w-28" />
				</div>
			</div>
			<Skeleton className="h-48 w-full" />
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<Skeleton className="h-96 w-full lg:col-span-2" />
				<Skeleton className="h-96 w-full" />
			</div>
		</div>
	);
}
