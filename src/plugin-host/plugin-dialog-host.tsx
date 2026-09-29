import { cn } from "cn";
import { resolvePluginText, usePluginDialogs } from "@/client/hooks/use-plugin-ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PluginDialogRequest } from "./plugin-dialog-context";
import { PluginSurface } from "./surface";

const DIALOG_SIZE_CLASS = {
	sm: "sm:max-w-md",
	md: "sm:max-w-xl",
	lg: "sm:max-w-3xl",
	xl: "sm:max-w-5xl",
} as const;

/**
 * The dialog chrome, loaded only when a plugin actually requests a dialog —
 * it must never sit in the eager shell graph (ui/dialog pulls the whole
 * @base-ui dialog into first paint otherwise).
 */
export function PluginDialogHost({ request, onClose }: { request: PluginDialogRequest | null; onClose: () => void }) {
	const { getDialog } = usePluginDialogs();

	if (!request) return null;

	const dialog = getDialog(request.pluginId, request.dialog);
	if (!dialog) return null;

	const title = resolvePluginText(dialog.title, dialog.defaultLocale);

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className={cn("flex max-h-[85vh] flex-col overflow-hidden", DIALOG_SIZE_CLASS[dialog.size ?? "md"])}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<PluginSurface
					key={`${request.pluginId}:${dialog.id}`}
					pluginId={request.pluginId}
					tag={dialog.tag}
					schema={dialog.schema}
					dialog={dialog.id}
					params={request.params}
					player={request.player}
					onClose={onClose}
					className="min-h-[40vh] w-full flex-1 overflow-y-auto"
				/>
			</DialogContent>
		</Dialog>
	);
}
