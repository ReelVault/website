import { useTrickplayDeletePreview } from "@/client/hooks/use-admin-trickplay";
import { m } from "@/paraglide/messages";

/** Confirmation text for a bulk preview removal, with the previews it would delete right now (read when the dialog opens). */
export function TrickplayDeleteDescription({ mediaFileIds }: { mediaFileIds: string[] }) {
	const preview = useTrickplayDeletePreview(mediaFileIds);

	if (!preview.data) return <span className="block">{m.admin_media_remove_previews_confirm_description()}</span>;

	return (
		<span className="block">
			{m.admin_media_remove_previews_confirm_description()}
			<span className="text-foreground mt-2 block font-medium">
				{m.admin_media_remove_previews_preview({ artifacts: preview.data.artifacts, mediaFiles: preview.data.mediaFiles })}
			</span>
		</span>
	);
}
