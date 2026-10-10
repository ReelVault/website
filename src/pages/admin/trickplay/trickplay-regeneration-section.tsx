import type { TrickplayRegenerationQueued } from "@reelvault/sdk";
import { AlertTriangle, CheckCircle2, Clock, Film, HardDrive } from "lucide-react";
import { useState } from "react";
import { useRegenerateTrickplay, useTrickplayRegenerationReport } from "@/client/hooks/use-admin-trickplay";
import { useAdminLibraries } from "@/client/hooks/use-libraries";
import { useGlobalMetadataSearch } from "@/client/hooks/use-metadata-search";
import { useSeasons } from "@/client/hooks/use-seasons";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { detach } from "@/lib/detach";
import { AdminSection, AdminStatCard } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

interface RegenerationScope {
	scope: "library" | "title" | "season";
	id: string;
}

type QueueRegeneration = (label: string, scope: RegenerationScope, force: boolean) => Promise<void>;

interface QueuedRegeneration {
	label: string;
	result: TrickplayRegenerationQueued;
}

/**
 * Library-scoped regeneration: queues the missing previews of one library, or rebuilds all of them, and shows what
 * that pass produced. The report keeps refreshing while any of its jobs is still queued or running.
 */
export function TrickplayRegenerationSection() {
	const { libraries } = useAdminLibraries();
	const regenerate = useRegenerateTrickplay();
	const [queued, setQueued] = useState<QueuedRegeneration | null>(null);
	const report = useTrickplayRegenerationReport(queued?.result.operationId);

	const queue: QueueRegeneration = async (label, scope, force) => {
		const result = await regenerate.mutateAsync({ ...scope, force });
		setQueued({ label, result });
	};

	return (
		<AdminSection title={m.admin_trickplay_regenerate_section()} description={m.admin_trickplay_regenerate_section_description()}>
			<div className="flex flex-col gap-3">
				{libraries.map((library) => (
					<div key={library.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
						<span className="font-medium text-sm">{library.name}</span>
						<div className="flex flex-wrap items-center gap-2">
							<ConfirmAction
								trigger={
									<Button variant="outline" size="sm" disabled={regenerate.isPending}>
										{m.admin_trickplay_fill_missing()}
									</Button>
								}
								title={m.admin_trickplay_regenerate_confirm_title({ library: library.name })}
								description={m.admin_trickplay_regenerate_confirm_description()}
								confirmLabel={m.admin_trickplay_regenerate_confirm_action()}
								onConfirm={() => queue(library.name, { scope: "library", id: library.id }, false)}
							/>
							<ConfirmAction
								trigger={
									<Button variant="outline" size="sm" disabled={regenerate.isPending}>
										{m.admin_trickplay_regenerate_all()}
									</Button>
								}
								title={m.admin_trickplay_regenerate_confirm_title({ library: library.name })}
								description={m.admin_trickplay_regenerate_confirm_description()}
								confirmLabel={m.admin_trickplay_regenerate_confirm_action()}
								onConfirm={() => queue(library.name, { scope: "library", id: library.id }, true)}
							/>
						</div>
					</div>
				))}
			</div>

			<TitleRegenerationBlock onQueue={queue} disabled={regenerate.isPending} />

			{queued && (
				<div className="mt-4 flex flex-col gap-3 border-border/60 border-t pt-4">
					<p className="text-muted-foreground text-sm">
						{`${queued.label}: ${m.admin_trickplay_report_queued({ enqueued: queued.result.enqueued, matching: queued.result.matching })}`}
					</p>
					{queued.result.remaining > 0 && (
						<p className="text-sm text-warning">{m.admin_trickplay_report_remaining({ remaining: queued.result.remaining })}</p>
					)}
					{report.data && (
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
							<AdminStatCard
								label={m.admin_trickplay_report_generated()}
								value={report.data.generated}
								icon={CheckCircle2}
								tone="success"
							/>
							<AdminStatCard
								label={m.admin_trickplay_report_budget_skipped()}
								value={report.data.skippedStorageBudget}
								icon={HardDrive}
								tone={report.data.skippedStorageBudget > 0 ? "warning" : "muted"}
							/>
							<AdminStatCard label={m.admin_trickplay_report_other_skipped()} value={report.data.skippedOther} icon={Film} tone="muted" />
							<AdminStatCard
								label={m.admin_trickplay_report_failed()}
								value={report.data.failed}
								icon={AlertTriangle}
								tone={report.data.failed > 0 ? "destructive" : "muted"}
							/>
							<AdminStatCard
								label={m.admin_trickplay_report_unfinished()}
								value={report.data.unfinished}
								icon={Clock}
								tone={report.data.unfinished > 0 ? "default" : "muted"}
							/>
						</div>
					)}
				</div>
			)}
		</AdminSection>
	);
}

/** Queues the missing previews of a scope, or rebuilds them all after a confirmation. */
function RegenerationButtons({
	label,
	scope,
	onQueue,
	disabled,
}: {
	label: string;
	scope: RegenerationScope;
	onQueue: QueueRegeneration;
	disabled: boolean;
}) {
	return (
		<div className="flex flex-wrap gap-2">
			<Button variant="outline" size="sm" disabled={disabled} onClick={() => detach(onQueue(label, scope, false))}>
				{m.admin_trickplay_fill_missing()}
			</Button>
			<ConfirmAction
				trigger={
					<Button variant="outline" size="sm" disabled={disabled}>
						{m.admin_trickplay_regenerate_all()}
					</Button>
				}
				title={m.admin_trickplay_regenerate_confirm_title({ library: label })}
				description={m.admin_trickplay_regenerate_confirm_description()}
				confirmLabel={m.admin_trickplay_regenerate_confirm_action()}
				onConfirm={() => onQueue(label, scope, true)}
			/>
		</div>
	);
}

/** Title and season scopes: find a title, then queue its previews or those of one of its seasons. */
function TitleRegenerationBlock({ onQueue, disabled }: { onQueue: QueueRegeneration; disabled: boolean }) {
	const search = useGlobalMetadataSearch({ debounceDelay: 300 });
	const [selected, setSelected] = useState<{ id: string; title: string; isSeries: boolean } | null>(null);
	const seasons = useSeasons(selected?.isSeries ? selected.id : "");

	return (
		<div className="mt-4 flex flex-col gap-3 border-border/60 border-t pt-4">
			<p className="text-muted-foreground text-sm">{m.admin_trickplay_regenerate_title_description()}</p>
			<Input
				value={search.query}
				onChange={(event) => search.setQuery(event.target.value)}
				placeholder={m.admin_trickplay_regenerate_search_placeholder()}
			/>
			{search.results.titles.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{search.results.titles.map((title) => (
						<Button
							key={title.id}
							variant={selected?.id === title.id ? "default" : "outline"}
							size="sm"
							onClick={() => setSelected({ id: title.id, title: title.title, isSeries: title.type === "tv_show" })}
						>
							{title.title}
						</Button>
					))}
				</div>
			)}
			{selected && (
				<div className="flex flex-col gap-3">
					<RegenerationButtons label={selected.title} scope={{ scope: "title", id: selected.id }} onQueue={onQueue} disabled={disabled} />
					{(seasons.data?.data ?? []).map((season) => (
						<div key={season.id} className="flex flex-wrap items-center gap-3">
							<span className="text-sm">{m.admin_trickplay_regenerate_season({ number: season.seasonNumber })}</span>
							<RegenerationButtons
								label={`${selected.title} · ${m.admin_trickplay_regenerate_season({ number: season.seasonNumber })}`}
								scope={{ scope: "season", id: season.id }}
								onQueue={onQueue}
								disabled={disabled}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
