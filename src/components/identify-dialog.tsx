import { Film, Tv } from "lucide-react";
import { IdentifyPanel } from "@/components/identify/identify-panel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { m } from "@/paraglide/messages";

export function IdentifyDialog({
	metadataId,
	mediaType,
	initialTitle,
	initialYear,
	open,
	onOpenChange,
}: {
	metadataId: string;
	mediaType: "movie" | "tv_show";
	initialTitle: string;
	initialYear?: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl">
						{mediaType === "movie" ? <Film className="size-5 text-primary" /> : <Tv className="size-5 text-primary" />}
						{m.identify_dialog_change_match()}
					</DialogTitle>
				</DialogHeader>
				<IdentifyPanel
					metadataId={metadataId}
					mediaType={mediaType}
					initialTitle={initialTitle}
					initialYear={initialYear}
					variant="dialog"
					onApplied={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
