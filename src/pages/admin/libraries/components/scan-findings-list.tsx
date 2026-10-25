import type { ScanFinding, ScanFindingStatus } from "@reelvault/sdk";
import { FileQuestion } from "lucide-react";
import { useState } from "react";
import { useLibraryScanFindings, useScanFindingCandidates, useSetScanFindingIgnored } from "@/client/hooks/use-libraries";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { translateByKey } from "@/utils/translate-error";

/** The findings of one library for the chosen tab, with each finding's ignore or restore action. */
export function ScanFindingsList({ libraryId, status }: { libraryId: string; status: ScanFindingStatus }) {
	const { data, isLoading, isError, error, refetch } = useLibraryScanFindings(libraryId, status, true);
	const items = data?.data ?? [];

	if (isLoading) return <AppLoadingState />;

	if (isError) return <AppErrorState error={error} onRetry={() => detach(refetch())} />;

	if (items.length === 0) {
		return status === "ignored" ? (
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
	}

	return (
		<div className="flex flex-col gap-2">
			{items.map((finding) => (
				<FindingItem key={finding.filePath} libraryId={libraryId} finding={finding} status={status} />
			))}
		</div>
	);
}

/** One finding with its ignore or restore action; a failed match also gets an on-demand candidate search. */
function FindingItem({ libraryId, finding, status }: { libraryId: string; finding: ScanFinding; status: ScanFindingStatus }) {
	const [showCandidates, setShowCandidates] = useState(false);
	const setIgnored = useSetScanFindingIgnored(libraryId);
	const isIgnored = status === "ignored";

	return (
		<div className="border-border/60 bg-muted/20 flex flex-col gap-2 rounded-lg border p-3">
			<p className="text-foreground truncate font-mono text-xs" title={finding.filePath}>
				{finding.filePath}
			</p>
			<p className="text-muted-foreground truncate text-xs" title={finding.fileName}>
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
		<div className="border-border/60 flex flex-col gap-2 border-t pt-2">
			<p className="text-muted-foreground text-xs">{searched}</p>
			{results.length === 0 ? (
				<p className="text-muted-foreground text-xs">{m.admin_libraries_finding_candidates_empty()}</p>
			) : (
				<ul className="flex flex-col gap-1">
					{results.map((result) => (
						<li key={`${result.providerId}:${result.externalId}`} className="flex items-baseline gap-2 text-xs">
							<span className="text-muted-foreground font-mono">{result.providerId}</span>
							<span className="text-foreground truncate">{result.title}</span>
							{result.releaseDate && <span className="text-muted-foreground">{result.releaseDate.slice(0, 4)}</span>}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
