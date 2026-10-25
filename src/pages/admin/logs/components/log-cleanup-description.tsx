import { useLogCleanupPreview } from "@/client/hooks/use-admin-logs";
import { m } from "@/paraglide/messages";

/** Confirmation text for log cleanup, with what a cleanup would remove right now (read when the dialog opens). */
export function LogCleanupDescription() {
	const preview = useLogCleanupPreview();

	if (!preview.data) return <span className="block">{m.admin_logs_cleanup_confirm_description()}</span>;

	const megabytes = (preview.data.freedBytes / 1024 / 1024).toFixed(1);

	return (
		<span className="block">
			{m.admin_logs_cleanup_confirm_description()}
			<span className="text-foreground mt-2 block font-medium">
				{preview.data.deletedCount > 0
					? m.admin_logs_cleanup_preview({ files: preview.data.deletedCount, megabytes })
					: m.admin_logs_cleanup_preview_none()}
			</span>
		</span>
	);
}
