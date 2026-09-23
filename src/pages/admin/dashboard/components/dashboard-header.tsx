import type { LibraryWithRelations } from "@reelvault/sdk";
import { RefreshCw, Server } from "lucide-react";
import { useState } from "react";
import { AsyncButton } from "@/components/async-button";
import { detach } from "@/lib/detach";
import { AdminPageHeader } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";

export function DashboardHeader({
	isServerOffline,
	libraries,
	onScanLibrary,
}: {
	isServerOffline: boolean;
	libraries: LibraryWithRelations[];
	onScanLibrary: (libraryId: string) => Promise<unknown>;
}) {
	const [isScanningAll, setIsScanningAll] = useState(false);

	const scanAllLibraries = async () => {
		if (isScanningAll || libraries.length === 0) return;

		setIsScanningAll(true);
		try {
			// Jak w use-libraries: pojedyncze 429 nie może zgubić reszty serii.
			const results = await Promise.allSettled(libraries.map((library) => onScanLibrary(library.id)));
			const queued = results.filter((result) => result.status === "fulfilled").length;
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
				<div className="flex flex-wrap items-center gap-2.5">
					<AsyncButton
						type="button"
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
