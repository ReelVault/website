import { Link } from "@tanstack/react-router";
import { Check, Info, Play, RotateCcw } from "lucide-react";
import type { useContinueWatching } from "@/client/hooks/use-continue-watching";
import { ConfirmAction } from "@/components/confirm-action";
import { ApiImage } from "@/components/ui/api-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { m } from "@/paraglide/messages";

type ContinueWatchingItem = ReturnType<typeof useContinueWatching>["items"][number];

export function ContinueWatchingCard({
	item,
	isResetting,
	onReset,
	isMarkingWatched,
	onMarkWatched,
}: {
	item: ContinueWatchingItem;
	isResetting: boolean;
	onReset: (mediaFileId: string) => void;
	isMarkingWatched: boolean;
	onMarkWatched: (item: ContinueWatchingItem) => void;
}) {
	const isEpisode = Boolean(item.episode);
	const handleReset = () => onReset(item.mediaFileId);
	const handleMarkWatched = () => onMarkWatched(item);

	let episodeBadgeLabel: string = m.common_movie_word();
	if (isEpisode && item.episode) {
		const absoluteSuffix = item.episode.absoluteNumber != null ? ` · #${item.episode.absoluteNumber}` : "";
		episodeBadgeLabel = `S${item.episode.seasonNumber} : E${item.episode.episodeNumber}${absoluteSuffix}`;
	}

	return (
		<ContextMenu>
			<ContextMenuTrigger className="group relative w-80 shrink-0 md:w-96">
				{/* CONTAINER - consistent with MetadataCard: rounded-xl + ring instead of border/shadow */}
				<div className="relative overflow-hidden rounded-xl bg-card ring-primary/0 ring-offset-2 ring-offset-background transition-[box-shadow,transform] duration-200 group-hover:scale-[1.01] group-hover:ring-2">
					<Link to="/player/$id" params={{ id: item.mediaFileId }} className="relative block aspect-video cursor-pointer overflow-hidden">
						<ApiImage
							fileId={item.backdropId}
							cacheKey={item.backdropUpdatedAt}
							alt={item.metadata.title}
							fill
							sizes="(max-width: 768px) 320px, 384px"
							className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
						/>

						<div className="absolute inset-0 z-10 bg-linear-to-t from-background via-background/40 to-transparent" />

						{/* Ikona Play - taka sama waga jak w MetadataCard (size-14, ring-owy button) */}
						<div className="absolute inset-0 z-20 flex items-center justify-center bg-background/20 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
							<div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform duration-200 group-hover:scale-105">
								<Play className="ml-0.5 size-6 fill-current" aria-hidden="true" />
							</div>
						</div>

						{/* Badge - same size as the default Badge in MetadataCard (text-xs) */}
						<Badge
							variant="outline"
							className="absolute top-3 right-3 z-20 border-border/70 bg-background/80 font-bold text-xs uppercase tracking-wider"
						>
							{episodeBadgeLabel}
						</Badge>

						<div className="absolute inset-x-4 bottom-4 z-20 space-y-2">
							<p className="line-clamp-1 font-bold text-base text-foreground tracking-tight md:text-lg">{item.metadata.title}</p>

							<Progress
								value={item.progressPercent}
								aria-label={m.components_watch_progress_aria({ percent: item.progressPercent })}
								className="gap-1.5"
							>
								<div className="flex justify-between gap-1 font-medium text-muted-foreground text-xs">
									<span>{item.progressPercent === 0 && isEpisode ? m.player_next_episode() : m.common_progress()}</span>
									<span className="font-bold text-primary">{m.common_percent_value({ value: item.progressPercent })}</span>
								</div>
							</Progress>
						</div>
					</Link>

					{/* Action buttons: mark as watched and reset - round, consistent with MetadataCard actions */}
					<div className="absolute top-3 left-3 z-30 flex items-center gap-1.5">
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="size-10 rounded-full border-border/70 bg-background/80 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-focus-within:opacity-100 group-hover:opacity-100"
							disabled={isMarkingWatched || isResetting}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								handleMarkWatched();
							}}
							aria-label={m.components_mark_watched_named({ title: item.metadata.title })}
							title={m.components_mark_watched()}
						>
							{isMarkingWatched ? <Spinner className="size-4" /> : <Check className="size-4" />}
						</Button>

						<ConfirmAction
							trigger={
								<Button
									type="button"
									variant="outline"
									size="icon"
									className="size-10 rounded-full border-border/70 bg-background/80 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-focus-within:opacity-100 group-hover:opacity-100"
									disabled={isResetting || isMarkingWatched}
									aria-label={m.components_cw_reset_progress_named({ title: item.metadata.title })}
									title={m.components_cw_reset_progress()}
								>
									<RotateCcw className="size-4" />
								</Button>
							}
							title={m.components_cw_reset_progress_confirm()}
							description={m.components_cw_clear_progress_warning()}
							confirmLabel={m.components_cw_reset_progress_button()}
							onConfirm={handleReset}
						/>
					</div>
				</div>
			</ContextMenuTrigger>

			{/* MENU KONTEKSTOWE - te same klasy/wzorce co w MetadataCard */}
			<ContextMenuContent className="w-64 border-border bg-card/95">
				<ContextMenuGroup>
					<ContextMenuLabel className="truncate font-bold text-foreground text-xs uppercase tracking-wider">
						{item.metadata.title}
					</ContextMenuLabel>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuGroup>
					<ContextMenuItem render={<Link to="/player/$id" params={{ id: item.mediaFileId }} />} className="cursor-pointer gap-2.5">
						<Play className="size-4 fill-primary/20 text-primary" />
						<span>{item.progressPercent === 0 ? m.components_episode_play() : m.components_resume_playback()}</span>
					</ContextMenuItem>
					<ContextMenuItem render={<Link to="/details/$id" params={{ id: item.metadata.id }} />} className="cursor-pointer gap-2.5">
						<Info className="size-4 text-muted-foreground" />
						<span>{m.components_cw_show_metadata()}</span>
					</ContextMenuItem>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuGroup>
					<ContextMenuItem disabled={isMarkingWatched || isResetting} onClick={handleMarkWatched} className="cursor-pointer gap-2.5">
						<Check className="size-4 text-muted-foreground" />
						<span>{m.components_mark_watched()}</span>
					</ContextMenuItem>
					<ContextMenuItem disabled={isResetting || isMarkingWatched} onClick={handleReset} className="cursor-pointer gap-2.5">
						<RotateCcw className="size-4 text-muted-foreground" />
						<span>{m.components_cw_reset_progress_button()}</span>
					</ContextMenuItem>
				</ContextMenuGroup>
			</ContextMenuContent>
		</ContextMenu>
	);
}
