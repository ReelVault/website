import { AlertTriangle, FileQuestion, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminLibraries, useLibraryScanFindings } from "@/client/hooks/use-libraries";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
	const { data, isLoading, isError, error, refetch } = useLibraryScanFindings(libraryId ?? "", isOpen && libraryId !== null);
	const { scanLibrary, isScanning, mutationVariables } = useAdminLibraries();
	const items = data?.items ?? [];

	let findingsBody: ReactNode;
	if (isLoading) {
		findingsBody = <AppLoadingState />;
	} else if (isError) {
		findingsBody = <AppErrorState error={error} onRetry={() => detach(refetch())} />;
	} else if (items.length === 0) {
		findingsBody = (
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
					<div key={finding.filePath} className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 p-3">
						<p className="truncate font-mono text-foreground text-xs" title={finding.filePath}>
							{finding.filePath}
						</p>
						<p className="truncate text-muted-foreground text-xs" title={finding.fileName}>
							{finding.fileName}
						</p>
						<p className="text-muted-foreground text-xs">{translateByKey(`scan_reason_${finding.reason}`)}</p>
					</div>
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
						{data ? m.admin_libraries_needs_attention_count({ count: items.length }) : m.admin_libraries_needs_attention()}
					</DialogTitle>
					<DialogDescription>{m.admin_libraries_needs_attention_desc()}</DialogDescription>
				</DialogHeader>

				<div className="max-h-100 overflow-y-auto">{findingsBody}</div>

				{libraryId !== null && items.length > 0 && (
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
