import { Clapperboard, RefreshCw, Wand2 } from "lucide-react";
import type { ReactNode } from "react";
import { useGenerateAllTrickplay, useTrickplayStats } from "@/client/hooks/use-admin-trickplay";
import { AppErrorState, AppLoadingState } from "@/components/app-states";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

export default function AdminTrickplayPage() {
	const { stats, isLoading, isFetching, error, refetch } = useTrickplayStats();
	const generateAll = useGenerateAllTrickplay();

	const cards = stats
		? [
				{ key: "total", label: m.admin_trickplay_total(), value: stats.total },
				{ key: "with", label: m.admin_trickplay_with(), value: stats.withTrickplay },
				{ key: "missing", label: m.admin_trickplay_missing(), value: stats.missingTrickplay },
			]
		: [];

	let content: ReactNode;
	if (isLoading) {
		content = <AppLoadingState />;
	} else if (error) {
		content = <AppErrorState error={error} onRetry={() => detach(refetch())} />;
	} else {
		content = (
			<div className="grid gap-4 sm:grid-cols-3">
				{cards.map((card) => (
					<div key={card.key} className="flex flex-col gap-1 rounded-xl border border-border/60 bg-card/40 p-4">
						<span className="text-muted-foreground text-xs">{card.label}</span>
						<span className="font-bold font-mono text-2xl text-foreground">{card.value}</span>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 pb-10">
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

			<AdminSection title={m.admin_trickplay_heading()} description={m.admin_trickplay_section_description()}>
				<p className="text-muted-foreground text-sm">{m.admin_trickplay_hint()}</p>
			</AdminSection>
		</div>
	);
}
