import { Skeleton } from "@/components/ui/skeleton";

const DISCOVERY_SKELETONS = ["one", "two", "three", "four", "five", "six"] as const;

export function DiscoveryLoading() {
	return (
		<div className="poster-shelf mt-12" aria-busy="true">
			{DISCOVERY_SKELETONS.map((key) => (
				<Skeleton key={key} className="aspect-2/3 w-full rounded-xl" />
			))}
		</div>
	);
}
