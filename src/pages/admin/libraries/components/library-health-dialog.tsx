import type { LibraryHealth } from "@reelvault/sdk";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { m } from "@/paraglide/messages";
import { formatDateTime } from "@/utils/format-utils";
import { translateCode } from "@/utils/translate-error";

interface LibraryHealthDialogProps {
	libraryName: string | null;
	health: LibraryHealth | undefined;
	isOpen: boolean;
	isValidating: boolean;
	onOpenChange: (open: boolean) => void;
	onValidate: () => void;
}

/** One library's paths as they are now: on disk, watched live or not, and when the library was last scanned. */
export function LibraryHealthDialog({ libraryName, health, isOpen, isValidating, onOpenChange, onValidate }: LibraryHealthDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{m.admin_libraries_health_title({ name: libraryName ?? "" })}</DialogTitle>
					<DialogDescription>
						{health?.lastScanAt
							? m.admin_libraries_health_last_scan({ date: formatDateTime(health.lastScanAt) })
							: m.admin_libraries_health_never_scanned()}
					</DialogDescription>
				</DialogHeader>

				<ul className="flex flex-col gap-2">
					{(health?.paths ?? []).map((path) => (
						<li key={path.pathId} className="border-border flex flex-col gap-2 rounded-lg border p-3">
							<span className="truncate font-mono text-xs" title={path.path}>
								{path.path}
							</span>
							<div className="flex flex-wrap gap-2">
								<Badge variant={path.exists ? "secondary" : "destructive"}>
									{path.exists ? m.admin_libraries_health_present() : m.admin_libraries_health_missing()}
								</Badge>
								<Badge variant={path.watchStatus === "watching" ? "secondary" : "outline"}>
									{path.watchStatus === "watching" ? m.admin_libraries_health_watching() : m.admin_libraries_health_unwatchable()}
								</Badge>
							</div>
							{path.unwatchableCode && (
								<span className="text-muted-foreground text-xs">
									{translateCode(path.unwatchableCode, m.admin_libraries_health_unwatchable_fallback())}
									{path.unwatchableSince ? ` · ${formatDateTime(path.unwatchableSince)}` : ""}
								</span>
							)}
						</li>
					))}
				</ul>

				<DialogFooter>
					<Button variant="outline" disabled={isValidating} onClick={onValidate}>
						<RefreshCw className={isValidating ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden="true" />
						{m.admin_libraries_health_validate()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
