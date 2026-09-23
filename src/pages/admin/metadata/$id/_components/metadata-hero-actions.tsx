import { Combine, ImageDown, Lock, MoreHorizontal, RefreshCw, Save, Search, Trash2, Unlock } from "lucide-react";
import { AsyncButton } from "@/components/async-button";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { m } from "@/paraglide/messages";

interface MetadataHeroActionsProps {
	title: string;
	isSaving: boolean;
	isRefreshing: boolean;
	isRefreshingImages?: boolean;
	isDeleting: boolean;
	onSave: () => void;
	onOpenIdentifyDialog: () => void;
	onOpenMergeDialog: () => void;
	onRefresh: () => void;
	onRefreshImages: () => void;
	onDelete: () => Promise<unknown>;
	onLockAll?: () => void;
	onUnlockAll?: () => void;
}

export function MetadataHeroActions({
	title,
	isSaving,
	isRefreshing,
	isRefreshingImages,
	isDeleting,
	onSave,
	onOpenIdentifyDialog,
	onOpenMergeDialog,
	onRefresh,
	onRefreshImages,
	onDelete,
	onLockAll,
	onUnlockAll,
}: MetadataHeroActionsProps) {
	return (
		<div className="flex flex-wrap items-center gap-2 border-border/60 border-t pt-4">
			<AsyncButton
				variant="default"
				size="default"
				isPending={isSaving}
				pendingLabel={m.common_saving_dots()}
				onClick={onSave}
				className="gap-1.5 font-medium shadow-xs"
			>
				<Save className="size-4" />
				<span>{m.common_save_changes()}</span>
			</AsyncButton>

			<Button variant="outline" size="default" onClick={onOpenIdentifyDialog} className="gap-1.5 shadow-xs">
				<Search className="size-4 text-primary" />
				<span>{m.admin_metadata_match_tmdb()}</span>
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button variant="outline" size="default" className="gap-1.5 shadow-xs">
							<MoreHorizontal className="size-4" />
							<span>{m.admin_metadata_more_action()}</span>
						</Button>
					}
				/>
				<DropdownMenuContent align="start" className="w-full">
					{onLockAll !== undefined && (
						<DropdownMenuItem onClick={onLockAll}>
							<Lock className="size-4 text-warning" />
							<span>{m.admin_metadata_lock_all_fields()}</span>
						</DropdownMenuItem>
					)}
					{onUnlockAll !== undefined && (
						<DropdownMenuItem onClick={onUnlockAll}>
							<Unlock className="size-4" />
							<span>{m.admin_metadata_unlock_all_fields()}</span>
						</DropdownMenuItem>
					)}
					{(onLockAll !== undefined || onUnlockAll !== undefined) && <DropdownMenuSeparator />}
					<DropdownMenuItem onClick={onOpenMergeDialog}>
						<Combine className="size-4 text-primary" />
						<span>{m.admin_metadata_link_to_other()}</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onRefresh} disabled={isRefreshing}>
						<RefreshCw className="size-4" />
						<span>{isRefreshing ? m.common_refreshing() : m.admin_metadata_refresh_metadata()}</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onRefreshImages} disabled={isRefreshingImages}>
						<ImageDown className="size-4" />
						<span>{isRefreshingImages ? m.common_downloading() : m.admin_metadata_force_artwork_fetch()}</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<ConfirmAction
				trigger={
					<Button
						variant="ghost"
						size="icon"
						className="ml-auto size-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
						disabled={isDeleting}
						title={m.admin_metadata_delete_metadata()}
						aria-label={m.admin_metadata_delete_metadata()}
					>
						<Trash2 className="size-4" />
					</Button>
				}
				title={m.admin_metadata_delete_metadata()}
				description={m.admin_metadata_entry_delete_with_posters_full({ title })}
				confirmLabel={m.admin_metadata_delete_metadata()}
				onConfirm={onDelete}
			/>
		</div>
	);
}
