import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { PlayerEqualizerPanel } from "./player-equalizer-panel";

interface PlayerEqualizerDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Equalizer as a drawer from the top edge. It is non-modal: no backdrop and no
 * focus trap, so the video stays visible and seekable while the settings are
 * tuned against the playing picture.
 */
export function PlayerEqualizerDrawer({ open, onOpenChange }: PlayerEqualizerDrawerProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange} modal={false}>
			<Dialog.Portal>
				<Dialog.Popup className="fixed inset-x-0 top-0 z-50 flex max-h-[45svh] flex-col gap-3 overflow-y-auto border-border border-b bg-popover px-4 py-4 text-popover-foreground shadow-xl transition-transform duration-200 data-ending-style:-translate-y-full data-starting-style:-translate-y-full sm:px-8">
					<div className="flex items-center justify-between gap-3">
						<Dialog.Title className="font-semibold text-sm">{m.player_audio_equalizer()}</Dialog.Title>
						<Dialog.Close render={<Button variant="ghost" size="icon-sm" aria-label={m.common_close()} />}>
							<X className="size-4" aria-hidden="true" />
						</Dialog.Close>
					</div>
					<PlayerEqualizerPanel />
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
