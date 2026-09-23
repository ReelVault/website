import { CheckCircle2, RefreshCw } from "lucide-react";
import type { useAdminMediaFileAudit } from "@/client/hooks/use-admin-media";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";
import { MediaAuditStatsGrid } from "./media-audit-stats-grid";
import { SuspectMediaCard } from "./suspect-media-card";

export function MediaAuditView({ audit }: { audit: ReturnType<typeof useAdminMediaFileAudit> }) {
	const { totalFilesChecked, suspectCount, suspects, isLoading, isFetching, error, refetch } = audit;

	if (isLoading) {
		return (
			<div className="flex flex-col gap-6" aria-busy="true">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<Skeleton className="h-24 rounded-xl" />
					<Skeleton className="h-24 rounded-xl" />
					<Skeleton className="h-24 rounded-xl" />
				</div>
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<Skeleton className="h-56 rounded-xl" />
					<Skeleton className="h-56 rounded-xl" />
				</div>
			</div>
		);
	}

	if (error) {
		return <AppErrorState error={error} onRetry={() => refetch()} />;
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Stats Overview */}
			<MediaAuditStatsGrid
				totalFilesChecked={totalFilesChecked}
				suspectCount={suspectCount}
				isFetching={isFetching}
				onRefetch={() => refetch()}
			/>

			{/* Suspects List or Clean State */}
			{suspects.length === 0 ? (
				<AppEmptyState
					icon={CheckCircle2}
					title={m.admin_media_all_assignments_match()}
					description={m.admin_media_audit_clean_notice()}
					action={
						<Button variant="outline" size="sm" onClick={() => refetch()}>
							<RefreshCw className="size-4" />
							{m.admin_media_rerun_audit()}
						</Button>
					}
				/>
			) : (
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="font-semibold text-foreground text-lg">
								{m.admin_media_suspected_mismatches_detected({ suspectsCount: suspects.length })}
							</h3>
							<p className="text-muted-foreground text-sm">{m.admin_media_audit_mismatch_desc()}</p>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
						{suspects.map((item) => (
							<SuspectMediaCard key={item.mediaFileId} item={item} onFixed={() => refetch()} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
