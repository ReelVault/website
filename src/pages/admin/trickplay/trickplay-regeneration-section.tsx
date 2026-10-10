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

type QueueTitles = (label: string, ids: string[], force: boolean) => Promise<void>;

/** Most titles one bulk request takes; the server caps a request at the same number. */
const MAX_BULK_TITLES = 50;

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

	const queueTitles: QueueTitles = async (label, ids, force) => {
		const result = await regenerate.mutateAsync({ scope: "titles", ids, force });
		setQueued({ label, result });
	};

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

			<TitleRegenerationBlock onQueue={queue} onQueueTitles={queueTitles} disabled={regenerate.isPending} />

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

interface SelectedTitle {
	id: string;
	title: string;
	isSeries: boolean;
}

/** Title and season scopes: pick titles from a search, then queue their previews together or one title at a time. */
function TitleRegenerationBlock({
	onQueue,
	onQueueTitles,
	disabled,
}: {
	onQueue: QueueRegeneration;
	onQueueTitles: QueueTitles;
	disabled: boolean;
}) {
	const search = useGlobalMetadataSearch({ debounceDelay: 300 });
	const [selectedTitles, setSelectedTitles] = useState<SelectedTitle[]>([]);
	// One selected title keeps the detailed view: its own buttons and its seasons.
	const single = selectedTitles.length === 1 ? selectedTitles[0] : undefined;
	const seasons = useSeasons(single?.isSeries ? single.id : "");
	const selectedIds = selectedTitles.map((title) => title.id);

	const toggleTitle = (title: SelectedTitle) => {
		setSelectedTitles((current) => {
			if (current.some((item) => item.id === title.id)) return current.filter((item) => item.id !== title.id);

			return current.length < MAX_BULK_TITLES ? [...current, title] : current;
		});
	};

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
					{search.results.titles.map((title) => {
						const checked = selectedTitles.some((item) => item.id === title.id);

						return (
							<Button
								key={title.id}
								variant={checked ? "default" : "outline"}
								size="sm"
								aria-pressed={checked}
								disabled={!checked && selectedTitles.length >= MAX_BULK_TITLES}
								onClick={() => toggleTitle({ id: title.id, title: title.title, isSeries: title.type === "tv_show" })}
							>
								{title.title}
							</Button>
						);
					})}
				</div>
			)}
			{selectedTitles.length > 0 && (
				<div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 p-3">
					<span className="text-sm">{m.admin_trickplay_bulk_selected({ count: selectedTitles.length })}</span>
					<Button
						variant="outline"
						size="sm"
						disabled={disabled}
						onClick={() => detach(onQueueTitles(m.admin_trickplay_bulk_label(), selectedIds, false))}
					>
						{m.admin_trickplay_bulk_fill_missing()}
					</Button>
					<ConfirmAction
						trigger={
							<Button variant="outline" size="sm" disabled={disabled}>
								{m.admin_trickplay_bulk_regenerate_all()}
							</Button>
						}
						title={m.admin_trickplay_bulk_confirm_title()}
						description={m.admin_trickplay_regenerate_confirm_description()}
						confirmLabel={m.admin_trickplay_regenerate_confirm_action()}
						onConfirm={() => onQueueTitles(m.admin_trickplay_bulk_label(), selectedIds, true)}
					/>
					<Button variant="ghost" size="sm" onClick={() => setSelectedTitles([])}>
						{m.admin_trickplay_bulk_clear()}
					</Button>
				</div>
			)}
			{single && (
				<div className="flex flex-col gap-3">
					<RegenerationButtons label={single.title} scope={{ scope: "title", id: single.id }} onQueue={onQueue} disabled={disabled} />
					{(seasons.data?.data ?? []).map((season) => (
						<div key={season.id} className="flex flex-wrap items-center gap-3">
							<span className="text-sm">{m.admin_trickplay_regenerate_season({ number: season.seasonNumber })}</span>
							<RegenerationButtons
								label={`${single.title} · ${m.admin_trickplay_regenerate_season({ number: season.seasonNumber })}`}
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
