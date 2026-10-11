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

function ratingBadgeVariant(isActive: boolean, value: number) {
	if (!isActive) return "outline";
	if (value === 0) return "destructive";
	if (value === 2) return "warning";
	return "default";
}

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
			<span className="font-semibold text-muted-foreground text-xs">{m.web_your_rating_label()}</span>

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
								render={<Button type="button" variant={ratingBadgeVariant(isActive, opt.value)} size="icon-sm" />}
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
					className="text-muted-foreground text-xs hover:text-destructive max-sm:min-h-10 max-sm:px-3"
				>
					{m.common_delete()}
				</AsyncButton>
			)}
		</div>
	);
}
