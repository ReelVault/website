import { cn } from "cn";
import { LucideAnnoyed, LucideFaceGrinning, LucideSmile } from "lucide-react";
import { useDetailsView } from "@/client/hooks/use-metadata-queries";
import { useUserRatingMutations } from "@/client/hooks/use-user-rating";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

const RATING_OPTIONS = [
	{
		value: 0,
		label: m.web_dislike_it(),
		icon: LucideAnnoyed,
	},
	{
		value: 1,
		label: m.web_like_it(),
		icon: LucideSmile,
	},
	{
		value: 2,
		label: m.web_really_like_it(),
		icon: LucideFaceGrinning,
	},
] as const;

export function DetailsUserRating({ metadataId }: { metadataId: string }) {
	// The rating comes from the details-view composite — no separate query.
	const { data, isLoading } = useDetailsView(metadataId);
	const rating = data?.userState.rating ?? null;
	const { isSaving, rate, removeRating } = useUserRatingMutations(metadataId);

	const handleRate = (value: number) => {
		if (value === rating) detach(removeRating());
		else detach(rate(value));
	};

	return (
		<div
			className="inline-flex flex-row items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-3.5 py-2 shadow-xs"
			aria-live="polite"
		>
			<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.web_your_rating_label()}</span>

			<fieldset className="flex items-center gap-1.5" disabled={isLoading || isSaving}>
				<legend className="sr-only">{m.web_select_rating()}</legend>
				{RATING_OPTIONS.map((opt) => {
					const Icon = opt.icon;
					const isActive = rating === opt.value;

					return (
						<Tooltip key={`user-rating-${opt.value}`}>
							<TooltipTrigger
								aria-label={opt.label}
								aria-pressed={isActive}
								onClick={() => handleRate(opt.value)}
								render={
									<Button
										type="button"
										variant="outline"
										size="icon-sm"
										className={cn(
											"size-11 rounded-full transition-[border-color,background-color,color,box-shadow] duration-200 sm:size-8",
											{
												"border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground": !isActive,
												"border-rose-500/40 bg-rose-500/15 text-rose-500 hover:bg-rose-500/20": isActive && opt.value === 0,
												"border-primary/40 bg-primary/15 text-primary hover:bg-primary/20": isActive && opt.value === 1,
												"border-amber-400/40 bg-amber-400/15 text-amber-400 hover:bg-amber-400/20": isActive && opt.value === 2,
											},
										)}
									/>
								}
							>
								<Icon className="size-4" aria-hidden="true" />
							</TooltipTrigger>
							<TooltipContent>{opt.label}</TooltipContent>
						</Tooltip>
					);
				})}
			</fieldset>

			{rating !== null && (
				<AsyncButton
					type="button"
					variant="ghost"
					size="xs"
					isPending={isSaving}
					pendingLabel={m.common_removing()}
					onClick={() => {
						detach(removeRating());
					}}
					className="text-muted-foreground text-xs hover:text-destructive max-sm:min-h-9 max-sm:px-3"
				>
					{m.common_delete()}
				</AsyncButton>
			)}
		</div>
	);
}
