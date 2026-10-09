import { cn } from "cn";
import { Heart } from "lucide-react";
import { useDetailsView } from "@/client/hooks/use-metadata-queries";
import { useWatchlistToggle } from "@/client/hooks/use-watchlist";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";

export function DetailsWatchlistButton({ metadataId }: { metadataId: string }) {
	// User state comes from the details-view composite — no separate query.
	const { data } = useDetailsView(metadataId);
	const isOnWatchlist = data?.userState.inWatchlist ?? false;

	const watchlistToggle = useWatchlistToggle();

	const handleWatchlist = async () => {
		await watchlistToggle.mutateAsync(metadataId);
		toast.success(isOnWatchlist ? m.components_metadata_card_removed_from_list() : m.components_metadata_card_added_to_list());
	};

	const handleWatchlistClick = () => {
		detach(handleWatchlist());
	};

	const label = isOnWatchlist ? m.components_remove_from_list() : m.components_add_to_list();

	return (
		<Button
			title={m.web_my_list_button()}
			aria-label={label}
			aria-pressed={isOnWatchlist}
			disabled={watchlistToggle.isPending}
			onClick={handleWatchlistClick}
			variant="outline"
			size={isOnWatchlist ? "icon-lg" : "lg"}
		>
			<Heart
				className={cn("size-4", {
					"fill-primary text-primary": isOnWatchlist,
				})}
			/>
			{!isOnWatchlist && <>{label}</>}
		</Button>
	);
}
