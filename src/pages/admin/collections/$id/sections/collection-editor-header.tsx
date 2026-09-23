import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, Layers, Save } from "lucide-react";
import { AsyncButton } from "@/components/async-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
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
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					className="h-8 gap-1.5 px-2 text-muted-foreground text-xs hover:text-foreground"
					nativeButton={false}
					render={<Link to="/admin/collections" />}
				>
					<ArrowLeft className="size-3.5" />
					<span>{m.admin_collections_back_to_list()}</span>
				</Button>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
						<Layers className="size-5" />
					</div>
					<div>
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="font-semibold text-foreground text-xl tracking-tight sm:text-2xl">{m.admin_collections_edit_collections()}</h1>
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
						</div>
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
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
					</div>
				</div>
				<AsyncButton
					isPending={isSubmitting}
					pendingLabel={m.common_saving_dots()}
					disabled={saveDisabled}
					onClick={onSave}
					className="gap-2 self-start font-medium sm:self-auto"
				>
					<Save className="size-4" />
					<span>{m.common_save_changes()}</span>
				</AsyncButton>
			</div>
		</>
	);
}
