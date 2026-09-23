import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";

const SKELETON_KEYS = ["1", "2", "3"] as const;

export function DetailsEpisodesSkeleton() {
	return (
		<div className="space-y-4" role="status" aria-label={m.web_loading_episodes()}>
			{SKELETON_KEYS.map((key) => (
				<div key={key} className="cinema-surface flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6">
					<Skeleton className="aspect-video w-full rounded-xl md:w-56 md:shrink-0" />
					<div className="flex-1 space-y-3">
						<Skeleton className="h-5 w-48 rounded-md" />
						<Skeleton className="h-4 w-full max-w-lg rounded-md" />
						<Skeleton className="h-4 w-3/4 max-w-md rounded-md" />
					</div>
				</div>
			))}
		</div>
	);
}
