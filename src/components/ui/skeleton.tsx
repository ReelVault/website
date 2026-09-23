import { cn } from "cn";
import type { ComponentProps } from "react";

function Skeleton({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="skeleton" className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

function skeletonPlaceholders(count: number): Array<{ id: string }> {
	return Array.from({ length: count }, (_, index) => ({ id: `skeleton-${index}` }));
}

function SkeletonList({ count, className, itemClassName, ...props }: { count: number; itemClassName?: string } & ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-2", className)} {...props}>
			{skeletonPlaceholders(count).map((item) => (
				<Skeleton key={item.id} className={cn("h-12 w-full rounded-lg", itemClassName)} />
			))}
		</div>
	);
}

function SkeletonGrid({ count, className, itemClassName, ...props }: { count: number; itemClassName?: string } & ComponentProps<"div">) {
	return (
		<div className={cn("grid", className)} {...props}>
			{skeletonPlaceholders(count).map((item) => (
				<Skeleton key={item.id} className={itemClassName} />
			))}
		</div>
	);
}

export { Skeleton, SkeletonGrid, SkeletonList };
