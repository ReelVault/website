import { useContinueWatching } from "@/client/hooks/use-continue-watching";
import { ContinueWatchingCard } from "@/components/cards/continue-watching-card";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

export default function DashboardContinueWatching() {
	const { items, resetProgress, resettingMediaFileId, markAsWatched, markingMediaFileId } = useContinueWatching();

	if (items.length === 0) return null;

	return (
		<section className="flex flex-col gap-4">
			{/* Section header */}
			<div className="flex items-center gap-4">
				<div className="h-px flex-1 bg-linear-to-r from-border/0 via-border to-border/0" />
				<div className="flex items-center gap-3">
					<div className="size-2 animate-pulse rounded-full bg-primary" />
					<h2 className="font-bold text-foreground text-sm uppercase tracking-[0.2em]">{m.web_resume_session()}</h2>
				</div>
				<div className="h-px flex-1 bg-linear-to-r from-border/0 via-border to-border/0" />
			</div>

			{/* Horizontally scrolling video list */}
			<div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
				<div className="scrollbar-none flex gap-4 overflow-x-auto pb-2 md:gap-6">
					{items.map((item) => (
						<ContinueWatchingCard
							key={item.mediaFileId}
							item={item}
							isResetting={resettingMediaFileId === item.mediaFileId}
							onReset={(mediaFileId) => {
								detach(resetProgress(mediaFileId));
							}}
							isMarkingWatched={markingMediaFileId === item.mediaFileId}
							onMarkWatched={(watchItem) => {
								detach(markAsWatched(watchItem));
							}}
						/>
					))}
				</div>
			</div>

			<div className="relative">
				<div className="h-px flex-1 bg-linear-to-r from-border/0 via-border to-border/0" />
			</div>
		</section>
	);
}
