import { AlertTriangle, FileQuestion } from "lucide-react";
import type { ReactNode } from "react";
import { useLibraryIgnoredAssets } from "@/client/hooks/use-libraries";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

export function IgnoredAssetsDialog({
	libraryId,
	isOpen,
	onOpenChange,
}: {
	libraryId: string | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { data: assets, isLoading, isError, error, refetch } = useLibraryIgnoredAssets(libraryId ?? "", isOpen && libraryId !== null);

	let assetsBody: ReactNode;
	if (isLoading) {
		assetsBody = <AppLoadingState />;
	} else if (isError) {
		assetsBody = <AppErrorState error={error} onRetry={() => detach(refetch())} />;
	} else if (!assets || assets.length === 0) {
		assetsBody = (
			<AppEmptyState
				icon={FileQuestion}
				title={m.admin_libraries_no_skipped_assets()}
				description={m.admin_libraries_sidecar_processed()}
			/>
		);
	} else {
		assetsBody = (
			<div className="flex flex-col gap-2">
				{assets.map((asset) => (
					<div key={`${asset.path}/${asset.fileName}`} className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 p-3">
						<p className="truncate font-mono text-foreground text-xs" title={asset.path}>
							{asset.path}
						</p>
						<p className="truncate text-muted-foreground text-xs" title={asset.fileName}>
							{asset.fileName}
						</p>
						<p className="text-muted-foreground text-xs">{asset.reason}</p>
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
						{m.admin_libraries_skipped_assets()}
					</DialogTitle>
					<DialogDescription>{m.admin_libraries_sidecar_skipped()}</DialogDescription>
				</DialogHeader>

				<div className="max-h-100 overflow-y-auto">{assetsBody}</div>
			</DialogContent>
		</Dialog>
	);
}
