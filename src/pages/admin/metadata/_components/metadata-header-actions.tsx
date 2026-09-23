import { cn } from "cn";
import { Languages, RefreshCw, Trash2 } from "lucide-react";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface MetadataHeaderActionsProps {
	isRefreshingAll: boolean;
	isDeletingOrphans: boolean;
	isFetching: boolean;
	onRefreshAll: () => void;
	onDeleteOrphans: () => void;
	onRefetch: () => void;
	/** Shown only in the missing-translation view — re-fetches the flagged subset. */
	onRefreshFlagged?: () => void;
	isRefreshingFlagged?: boolean;
}

export function MetadataHeaderActions({
	isRefreshingAll,
	isDeletingOrphans,
	isFetching,
	onRefreshAll,
	onDeleteOrphans,
	onRefetch,
	onRefreshFlagged,
	isRefreshingFlagged,
}: MetadataHeaderActionsProps) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			{onRefreshFlagged && (
				<ConfirmAction
					trigger={
						<Button variant="outline" size="sm" disabled={isRefreshingFlagged}>
							<Languages className={cn("size-4", { "animate-spin": isRefreshingFlagged })} />
							{m.admin_metadata_refresh_flagged()}
						</Button>
					}
					title={m.admin_metadata_refresh_flagged_confirm()}
					description={m.admin_metadata_refresh_flagged_notice()}
					confirmLabel={m.admin_metadata_refresh_flagged()}
					onConfirm={onRefreshFlagged}
				/>
			)}
			<ConfirmAction
				trigger={
					<Button variant="outline" size="sm" disabled={isRefreshingAll}>
						<RefreshCw className={cn("size-4", { "animate-spin": isRefreshingAll })} />
						{m.admin_metadata_fetch_missing_images()}
					</Button>
				}
				title={m.admin_metadata_download_missing_confirm()}
				description={m.admin_metadata_background_job_notice()}
				confirmLabel={m.admin_metadata_fetch_images()}
				onConfirm={onRefreshAll}
			/>
			<ConfirmAction
				trigger={
					<Button
						variant="outline"
						size="sm"
						className="text-destructive hover:bg-destructive/10 hover:text-destructive"
						disabled={isDeletingOrphans}
					>
						<Trash2 className="size-4" />
						{m.admin_metadata_delete_orphans()}
					</Button>
				}
				title={m.admin_metadata_delete_all_orphaned_confirm()}
				description={m.admin_metadata_orphan_removal_warning()}
				confirmLabel={m.admin_metadata_delete_orphaned()}
				onConfirm={onDeleteOrphans}
			/>
			<Button variant="outline" size="sm" disabled={isFetching} onClick={onRefetch}>
				<RefreshCw className={cn("size-4", { "animate-spin": isFetching })} />
				{m.common_refresh()}
			</Button>
		</div>
	);
}
