import type { ScanFinding, ScanFindingStatus } from "@reelvault/sdk";
import { AlertTriangle, FileQuestion, RefreshCw } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
	useAdminLibraries,
	useLibraryScanFindings,
	useScanFindingCandidates,
	useSetScanFindingIgnored,
} from "@/client/hooks/use-libraries";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { translateByKey } from "@/utils/translate-error";

export function ScanFindingsDialog({
	libraryId,
	isOpen,
	onOpenChange,
}: {
	libraryId: string | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [status, setStatus] = useState<ScanFindingStatus>("active");
	const { data, isLoading, isError, error, refetch } = useLibraryScanFindings(libraryId ?? "", status, isOpen && libraryId !== null);
	const { scanLibrary, isScanning, mutationVariables } = useAdminLibraries();
	const items = data?.data ?? [];

	let findingsBody: ReactNode;
	if (isLoading) {
		findingsBody = <AppLoadingState />;
	} else if (isError) {
		findingsBody = <AppErrorState error={error} onRetry={() => detach(refetch())} />;
	} else if (items.length === 0) {
		findingsBody =
			status === "ignored" ? (
				<AppEmptyState
					icon={FileQuestion}
					title={m.admin_libraries_findings_ignored_empty()}
					description={m.admin_libraries_findings_ignored_empty_desc()}
				/>
			) : (
				<AppEmptyState
					icon={FileQuestion}
					title={m.admin_libraries_needs_attention_empty()}
					description={m.admin_libraries_needs_attention_empty_desc()}
				/>
			);
	} else {
		findingsBody = (
			<div className="flex flex-col gap-2">
				{items.map((finding) => (
					<FindingItem key={finding.filePath} libraryId={libraryId ?? ""} finding={finding} status={status} />
				))}
			</div>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="gap-2">
						<AlertTriangle className="size-5 text-muted-foreground" />
						{data ? m.admin_libraries_needs_attention_count({ count: data.counts.active }) : m.admin_libraries_needs_attention()}
					</DialogTitle>
					<DialogDescription>{m.admin_libraries_needs_attention_desc()}</DialogDescription>
				</DialogHeader>

				<ToggleGroup
					variant="outline"
					size="sm"
					value={[status]}
					onValueChange={(next) => {
						const nextStatus = next[next.length - 1];
						if (nextStatus === "active" || nextStatus === "ignored") setStatus(nextStatus);
					}}
					className="w-fit"
				>
					<ToggleGroupItem value="active" className="px-3">
						{m.admin_libraries_needs_attention()}
					</ToggleGroupItem>
					<ToggleGroupItem value="ignored" className="px-3">
						{m.admin_libraries_findings_tab_ignored({ count: data?.counts.ignored ?? 0 })}
					</ToggleGroupItem>
				</ToggleGroup>

				<div className="max-h-100 overflow-y-auto">{findingsBody}</div>

				{libraryId !== null && status === "active" && items.length > 0 && (
					<AsyncButton
						variant="outline"
						size="sm"
						className="gap-2 self-start"
						onClick={() => {
							onOpenChange(false);
							detach(scanLibrary(libraryId));
						}}
						isPending={isScanning && mutationVariables.scan === libraryId}
						pendingLabel={m.admin_libraries_scanning()}
					>
						<RefreshCw className="size-3.5" />
						<span>{m.admin_libraries_scan_library()}</span>
					</AsyncButton>
				)}
			</DialogContent>
		</Dialog>
	);
}

/** One finding with its ignore or restore action; a failed match also gets an on-demand candidate search. */
function FindingItem({ libraryId, finding, status }: { libraryId: string; finding: ScanFinding; status: ScanFindingStatus }) {
	const [showCandidates, setShowCandidates] = useState(false);
	const setIgnored = useSetScanFindingIgnored(libraryId);
	const isIgnored = status === "ignored";

	return (
		<div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3">
			<p className="truncate font-mono text-foreground text-xs" title={finding.filePath}>
				{finding.filePath}
			</p>
			<p className="truncate text-muted-foreground text-xs" title={finding.fileName}>
				{finding.fileName}
			</p>
			<p className="text-muted-foreground text-xs">{translateByKey(`scan_reason_${finding.reason}`)}</p>
			<div className="flex flex-wrap gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={setIgnored.isPending}
					onClick={() => setIgnored.mutate({ filePath: finding.filePath, ignored: !isIgnored })}
				>
					{isIgnored ? m.admin_libraries_finding_restore() : m.admin_libraries_finding_ignore()}
				</Button>
				{!isIgnored && finding.reason === "no_metadata_match" && (
					<Button variant="outline" size="sm" aria-expanded={showCandidates} onClick={() => setShowCandidates((open) => !open)}>
						{m.admin_libraries_finding_find_candidates()}
					</Button>
				)}
			</div>
			{showCandidates && <ScanFindingCandidates libraryId={libraryId} filePath={finding.filePath} />}
		</div>
	);
}

/** Provider matches for the title parsed from the file name. Mounted only after the admin asks, so the search is on request. */
function ScanFindingCandidates({ libraryId, filePath }: { libraryId: string; filePath: string }) {
	const { data, isLoading, isError, error, refetch } = useScanFindingCandidates(libraryId, filePath);

	if (isLoading) return <AppLoadingState className="min-h-16" />;
	if (isError) return <AppErrorState error={error} onRetry={() => detach(refetch())} />;
	if (!data || data.searchTitle === null) {
		return <p className="text-muted-foreground text-xs">{m.admin_libraries_finding_candidates_nothing_searched()}</p>;
	}

	const searched =
		data.searchYear === null
			? m.admin_libraries_finding_candidates_searched({ title: data.searchTitle })
			: m.admin_libraries_finding_candidates_searched_year({ title: data.searchTitle, year: data.searchYear });
	const results = data.candidates.flatMap((provider) => provider.results.map((result) => ({ ...result, providerId: provider.providerId })));

	return (
		<div className="flex flex-col gap-2 border-border/60 border-t pt-2">
			<p className="text-muted-foreground text-xs">{searched}</p>
			{results.length === 0 ? (
				<p className="text-muted-foreground text-xs">{m.admin_libraries_finding_candidates_empty()}</p>
			) : (
				<ul className="flex flex-col gap-1">
					{results.map((result) => (
						<li key={`${result.providerId}:${result.externalId}`} className="flex items-baseline gap-2 text-xs">
							<span className="font-mono text-muted-foreground">{result.providerId}</span>
							<span className="truncate text-foreground">{result.title}</span>
							{result.releaseDate && <span className="text-muted-foreground">{result.releaseDate.slice(0, 4)}</span>}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
