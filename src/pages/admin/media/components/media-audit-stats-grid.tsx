import { AlertTriangle, CheckCircle2, HardDrive, RefreshCw } from "lucide-react";
import { AsyncButton } from "@/components/async-button";
import { AdminStatCard } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

interface MediaAuditStatsGridProps {
	totalFilesChecked: number;
	suspectCount: number;
	isFetching: boolean;
	onRefetch: () => void;
}

export function MediaAuditStatsGrid({ totalFilesChecked, suspectCount, isFetching, onRefetch }: MediaAuditStatsGridProps) {
	return (
		<div className="flex flex-col gap-3">
			<div className="grid gap-3 sm:grid-cols-3">
				<AdminStatCard label={m.admin_media_audited_files()} value={totalFilesChecked} icon={HardDrive} tone="default" />
				<AdminStatCard
					label={m.admin_media_suspected_mismatches()}
					value={suspectCount}
					icon={suspectCount > 0 ? AlertTriangle : CheckCircle2}
					tone={suspectCount > 0 ? "destructive" : "success"}
				/>
				<AdminStatCard
					label={m.admin_media_confident_matches()}
					value={Math.max(0, totalFilesChecked - suspectCount)}
					icon={CheckCircle2}
					tone="success"
				/>
			</div>
			<div className="flex justify-end">
				<AsyncButton
					type="button"
					variant="outline"
					size="sm"
					isPending={isFetching}
					pendingLabel={m.admin_media_audit_running()}
					onClick={onRefetch}
					className="gap-2"
				>
					<RefreshCw className="size-3.5" />
					<span>{m.admin_media_rerun_audit()}</span>
				</AsyncButton>
			</div>
		</div>
	);
}
