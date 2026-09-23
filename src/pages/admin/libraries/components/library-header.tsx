import { cn } from "cn";
import { FolderPlus, Layers, RefreshCw } from "lucide-react";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { AdminPageHeader } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

export function LibraryHeader({
	total,
	onAddClick,
	onScanAll,
	isScanningAll,
}: {
	total: number;
	onAddClick: () => void;
	onScanAll: () => Promise<unknown>;
	isScanningAll: boolean;
}) {
	return (
		<AdminPageHeader
			icon={Layers}
			eyebrow={m.admin_libraries_resource_management()}
			title={m.admin_nav_libraries()}
			count={total}
			description={m.admin_libraries_manage_description()}
			actions={
				<div className="flex flex-wrap items-center gap-2">
					<AsyncButton
						type="button"
						variant="outline"
						size="lg"
						disabled={total === 0}
						isPending={isScanningAll}
						pendingLabel={m.common_scanning()}
						onClick={() => detach(onScanAll())}
						className="gap-2 shadow-xs"
					>
						<RefreshCw className={cn("size-4", { "animate-spin": isScanningAll })} />
						<span>{m.admin_libraries_scan_libraries()}</span>
					</AsyncButton>
					<Button type="button" size="lg" onClick={onAddClick} className="gap-2 shadow-xs">
						<FolderPlus className="size-4" />
						<span>{m.admin_libraries_add_library()}</span>
					</Button>
				</div>
			}
		/>
	);
}
