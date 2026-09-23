import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_SLOTS = [0, 1, 2, 3] as const;

export function CandidateSkeletonList({ variant, keyPrefix }: { variant: "compact" | "default"; keyPrefix: string }) {
	return (
		<>
			{SKELETON_SLOTS.map((slot) =>
				variant === "compact" ? (
					<div key={`${keyPrefix}-${slot}`} className="flex gap-3 rounded-lg border border-border p-2.5">
						<Skeleton className="h-16 w-12 shrink-0 rounded-md" />
						<div className="flex-1 space-y-1.5">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-3 w-1/2" />
						</div>
					</div>
				) : (
					<div key={`${keyPrefix}-${slot}`} className="flex gap-3 rounded-lg border border-border p-3">
						<Skeleton className="h-24 w-16 shrink-0 rounded-md" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-5 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
							<Skeleton className="h-8 w-24 rounded-md" />
						</div>
					</div>
				),
			)}
		</>
	);
}
