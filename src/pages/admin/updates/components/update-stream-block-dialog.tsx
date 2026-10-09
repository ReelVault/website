import type { UpdateStreamBlock } from "@/client/hooks/use-admin-update";
import { StreamBlockDialog } from "@/components/stream-block-dialog";
import { m } from "@/paraglide/messages";

interface UpdateStreamBlockDialogProps {
	block: UpdateStreamBlock | null;
	isPending: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

/** Warns before a server install or rollback that the server held back while streams were playing. */
export function UpdateStreamBlockDialog({ block, isPending, onConfirm, onCancel }: UpdateStreamBlockDialogProps) {
	const isInstall = block?.action !== "rollback";

	return (
		<StreamBlockDialog
			isOpen={block !== null}
			title={isInstall ? m.admin_updates_stream_block_install_title() : m.admin_updates_stream_block_rollback_title()}
			description={m.admin_updates_stream_block_description({ activeStreams: block?.activeStreams ?? 0 })}
			confirmLabel={isInstall ? m.admin_updates_stream_block_install_confirm() : m.admin_updates_stream_block_rollback_confirm()}
			isPending={isPending}
			onConfirm={onConfirm}
			onCancel={onCancel}
		/>
	);
}
