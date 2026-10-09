import type { LibraryWithRelations } from "@reelvault/sdk";
import { RefreshCw, Server } from "lucide-react";
import { useState } from "react";
import { reelvault } from "@/client/client";
import { AsyncButton } from "@/components/async-button";
import { detach } from "@/lib/detach";
import { AdminPageHeader } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";

export function DashboardHeader({ isServerOffline, libraries }: { isServerOffline: boolean; libraries: LibraryWithRelations[] }) {
	const [isScanningAll, setIsScanningAll] = useState(false);

	const scanAllLibraries = async () => {
		if (isScanningAll || libraries.length === 0) return;

		setIsScanningAll(true);
		try {
			// One request covers every library: the server queues them in order.
			const { queued: queuedScans } = await reelvault.libraries.scanAll();
			const queued = queuedScans.length;
			if (queued === libraries.length) {
				toast.success(m.admin_dashboard_scan_all_started());
			} else {
				toast.warning(`${m.admin_dashboard_scan_all_started()} (${queued}/${libraries.length})`);
			}
		} catch (error) {
			toastError(m.admin_dashboard_failed_to_schedule_scan(), error);
		}

		setIsScanningAll(false);
	};

	return (
		<AdminPageHeader
			icon={Server}
			eyebrow={isServerOffline ? m.admin_dashboard_no_api_connection() : m.admin_dashboard_system_online()}
			title={m.admin_dashboard_command_center()}
			description={m.admin_dashboard_live_monitoring_description()}
			actions={
				<div className="flex flex-wrap items-center gap-2">
					<AsyncButton
						type="button"
						size="sm"
						onClick={() => {
							detach(scanAllLibraries());
						}}
						disabled={libraries.length === 0}
						isPending={isScanningAll}
						pendingLabel={m.common_scanning()}
						className="gap-2 shadow-sm"
					>
						<RefreshCw className="size-4" />
						{m.admin_dashboard_scan_libraries()}
					</AsyncButton>
				</div>
			}
		/>
	);
}
