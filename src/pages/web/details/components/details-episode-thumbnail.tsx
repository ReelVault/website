import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Check, Play, RotateCcw } from "lucide-react";
import { ConfirmAction } from "@/components/confirm-action";
import { ApiImage } from "@/components/ui/api-image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { m } from "@/paraglide/messages";

interface DetailsEpisodeThumbnailProps {
	imageId?: string | null;
	imageUpdatedAt?: string | Date | null;
	episodeTitle: string;
	mediaFileId?: string;
	isWatched: boolean;
	hasProgress: boolean;
	isEpisodePending: boolean;
	isEpisodeMarking: boolean;
	isEpisodeUnmarking: boolean;
	isEpisodeResetting: boolean;
	onToggleWatched: () => void;
	onResetProgress: () => void;
}

export function DetailsEpisodeThumbnail({
	imageId,
	imageUpdatedAt,
	episodeTitle,
	mediaFileId,
	isWatched,
	hasProgress,
	isEpisodePending,
	isEpisodeMarking,
	isEpisodeUnmarking,
	isEpisodeResetting,
	onToggleWatched,
	onResetProgress,
}: DetailsEpisodeThumbnailProps) {
	return (
		<div className="relative shrink-0">
			<div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border shadow-md transition-[border-color,box-shadow] duration-300 group-hover:border-primary/30 group-hover:shadow-xl md:w-48 lg:w-56">
				<ApiImage
					fileId={imageId}
					cacheKey={imageUpdatedAt ?? undefined}
					alt={episodeTitle}
					width={256}
					aspectRatio={16 / 9}
					sizes="(max-width: 768px) 100vw, 224px"
					className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
				/>
				{mediaFileId && (
					<Link
						to="/player/$id"
						params={{ id: mediaFileId }}
						aria-label={m.web_play_episodetitle({ episodeTitle })}
						className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 focus-visible:opacity-100 group-hover:opacity-100"
					>
						<div className="rounded-full bg-primary/90 p-3 shadow-lg">
							<Play className="size-5 fill-current pl-0.5 text-primary-foreground" />
						</div>
					</Link>
				)}

				{/* Action buttons: mark/unmark as watched and reset progress */}
				{mediaFileId && (
					<div className="absolute top-2 left-2 z-30 flex items-center gap-1.5">
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="size-10 rounded-full border-border/70 bg-background/80 text-muted-foreground opacity-100 transition-opacity hover:text-foreground md:size-8 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
							disabled={isEpisodePending}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onToggleWatched();
							}}
							aria-label={
								isWatched
									? m.components_unmark_watched_named({ title: episodeTitle })
									: m.components_mark_watched_named({ title: episodeTitle })
							}
							title={isWatched ? m.components_unmark_watched() : m.components_mark_watched()}
						>
							{isEpisodeMarking || isEpisodeUnmarking ? (
								<Spinner className="size-3.5" />
							) : (
								<Check className={cn("size-3.5", isWatched && "text-success")} />
							)}
						</Button>

						{(hasProgress || isWatched) && (
							<ConfirmAction
								trigger={
									<Button
										type="button"
										variant="outline"
										size="icon"
										className="size-10 rounded-full border-border/70 bg-background/80 text-muted-foreground opacity-100 transition-opacity hover:text-foreground md:size-8 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
										disabled={isEpisodePending}
										aria-label={m.web_reset_episode_progress({ episodeTitle })}
										title={m.components_cw_reset_progress()}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
										}}
									>
										{isEpisodeResetting ? <Spinner className="size-3.5" /> : <RotateCcw className="size-3.5" />}
									</Button>
								}
								title={m.components_cw_reset_progress_confirm()}
								description={m.web_clear_episode_progress_warning()}
								confirmLabel={m.components_cw_reset_progress_button()}
								onConfirm={onResetProgress}
							/>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
