import { Check, Copy, Layers, Save } from "lucide-react";
import { AsyncButton } from "@/components/async-button";
import { Badge } from "@/components/ui/badge";
import { detach } from "@/lib/detach";
import { AdminBackLink, AdminPageHeader } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { formatDateTime } from "@/utils/format-utils";

interface CollectionEditorHeaderProps {
	collectionId: string;
	collection: {
		createdAt?: string | Date | null;
		updatedAt?: string | Date | null;
	};
	isSubmitting: boolean;
	saveDisabled: boolean;
	onSave: () => void;
}

export function CollectionEditorHeader({ collectionId, collection, isSubmitting, saveDisabled, onSave }: CollectionEditorHeaderProps) {
	const { hasCopied, copy } = useCopyToClipboard();

	return (
		<>
			<AdminBackLink to="/admin/collections" label={m.admin_collections_back_to_list()} />

			<AdminPageHeader
				icon={Layers}
				eyebrow={m.admin_nav_collections()}
				title={m.admin_collections_edit_collections()}
				badge={
					<Badge variant="outline" className="gap-1 font-mono text-muted-foreground text-xs">
						<span>{m.common_short_id({ id: collectionId.slice(0, 8) })}</span>
						<button
							type="button"
							onClick={() => {
								detach(copy(collectionId, m.admin_collections_copy_full_id()));
							}}
							className="text-muted-foreground hover:text-foreground"
							aria-label={m.admin_collections_copy_full_id()}
						>
							{hasCopied ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
						</button>
					</Badge>
				}
				description={
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
						<span>{m.admin_collections_manage_name_and_order()}</span>
						{collection.createdAt && (
							<>
								<span>{m.common_bullet_symbol()}</span>
								<span>{m.common_created_at_value({ date: formatDateTime(collection.createdAt) })}</span>
							</>
						)}
						{collection.updatedAt && (
							<>
								<span>{m.common_bullet_symbol()}</span>
								<span>{m.common_updated_at_value({ date: formatDateTime(collection.updatedAt) })}</span>
							</>
						)}
					</div>
				}
				actions={
					<AsyncButton
						size="sm"
						isPending={isSubmitting}
						pendingLabel={m.common_saving_dots()}
						disabled={saveDisabled}
						onClick={onSave}
						className="gap-2 font-medium"
					>
						<Save className="size-4" />
						<span>{m.common_save_changes()}</span>
					</AsyncButton>
				}
			/>
		</>
	);
}
