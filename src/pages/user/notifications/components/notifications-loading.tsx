import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_KEYS = ["one", "two", "three"] as const;

export function NotificationsLoading() {
	return (
		<div className="flex flex-col gap-4" aria-busy="true">
			{SKELETON_KEYS.map((id) => (
				<Skeleton key={id} className="h-28 rounded-2xl" />
			))}
		</div>
	);
}
