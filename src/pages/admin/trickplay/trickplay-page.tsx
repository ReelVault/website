import { AlertTriangle, CheckCircle2, Clapperboard, Film, HardDrive, RefreshCw, Wand2 } from "lucide-react";
import type { ReactNode } from "react";
import { useArtifactStats, useGenerateAllTrickplay, useTrickplayStats } from "@/client/hooks/use-admin-trickplay";
import { AppErrorState, AppLoadingState } from "@/components/app-states";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection, AdminStatCard } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";
import { TrickplayRegenerationSection } from "./trickplay-regeneration-section";

export default function AdminTrickplayPage() {
	const { stats, isLoading, isFetching, error, refetch } = useTrickplayStats();
	const generateAll = useGenerateAllTrickplay();
	const artifactStats = useArtifactStats();

	const cards = stats
		? [
				{ key: "total", label: m.admin_trickplay_total(), value: stats.total, icon: Film, tone: "default" as const },
				{ key: "with", label: m.admin_trickplay_with(), value: stats.withTrickplay, icon: CheckCircle2, tone: "success" as const },
				{
					key: "missing",
					label: m.admin_trickplay_missing(),
					value: stats.missingTrickplay,
					icon: AlertTriangle,
					tone: "warning" as const,
				},
				{
					key: "storage",
					label: m.admin_trickplay_storage(),
					value: `${formatFileSize(stats.storageBytes)} / ${formatFileSize(stats.storageBudgetBytes)}`,
					icon: HardDrive,
					tone: "muted" as const,
				},
			]
		: [];

	let content: ReactNode;
	if (isLoading) {
		content = <AppLoadingState />;
	} else if (error) {
		content = <AppErrorState error={error} onRetry={() => detach(refetch())} />;
	} else {
		content = (
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{cards.map((card) => (
					<AdminStatCard key={card.key} label={card.label} value={card.value} icon={card.icon} tone={card.tone} />
				))}
			</div>
		);
	}

	let artifactContent: ReactNode;
	if (artifactStats.error) {
		artifactContent = <AppErrorState error={artifactStats.error} />;
	} else if (artifactStats.artifacts.length === 0) {
		artifactContent = <p className="text-muted-foreground text-sm">{m.admin_trickplay_artifacts_none()}</p>;
	} else {
		artifactContent = (
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead className="text-muted-foreground text-xs">
						<tr>
							<th className="py-2 pr-4 font-medium">{m.admin_trickplay_owner()}</th>
							<th className="py-2 pr-4 font-medium">{m.admin_trickplay_kind()}</th>
							<th className="py-2 text-right font-medium">{m.admin_trickplay_count()}</th>
						</tr>
					</thead>
					<tbody>
						{artifactStats.artifacts.map((row) => (
							<tr key={`${row.pluginId}:${row.kind}`} className="border-border/60 border-t">
								<td className="break-all py-2 pr-4 font-mono text-xs">{row.pluginId}</td>
								<td className="py-2 pr-4">{row.kind}</td>
								<td className="py-2 text-right font-mono">{row.count}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={Clapperboard}
				eyebrow={m.admin_nav_trickplay()}
				title={m.admin_trickplay_heading()}
				description={m.admin_trickplay_description()}
				actions={
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" disabled={isFetching} onClick={() => detach(refetch())}>
							<RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
							{m.common_refresh()}
						</Button>
						<ConfirmAction
							trigger={
								<Button size="sm" disabled={generateAll.isPending || !stats || stats.missingTrickplay === 0}>
									<Wand2 className="size-4" />
									{m.admin_trickplay_generate_all()}
								</Button>
							}
							title={m.admin_trickplay_generate_all_confirm_title()}
							description={m.admin_trickplay_generate_all_confirm_description()}
							confirmLabel={m.admin_trickplay_generate_all_confirm_action()}
							onConfirm={() => generateAll.mutateAsync()}
						/>
					</div>
				}
			/>

			{content}

			<TrickplayRegenerationSection />

			<AdminSection title={m.admin_trickplay_heading()} description={m.admin_trickplay_section_description()}>
				<p className="text-muted-foreground text-sm">{m.admin_trickplay_hint()}</p>
			</AdminSection>

			<AdminSection title={m.admin_trickplay_artifacts_section()} description={m.admin_trickplay_artifacts_description()}>
				{artifactContent}
			</AdminSection>
		</div>
	);
}
