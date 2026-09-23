import { Plus, ScanLine } from "lucide-react";
import { useState } from "react";
import { useAdminLibraries } from "@/client/hooks/use-libraries";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { CreateLibraryDialog } from "@/pages/admin/libraries/components/create-library-dialog";
import { m } from "@/paraglide/messages";

/**
 * First-run step: add one or more media libraries. Reuses the admin create
 * dialog (repeatable) and the admin libraries query, so no library UI is
 * duplicated here. The step is optional — "Next" advances with zero libraries.
 */
export function SetupStepLibraries() {
	const { libraries, isLoading, error, refetch, scanLibrary, isScanning } = useAdminLibraries();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col gap-1">
				<h2 className="font-semibold text-lg tracking-tight">{m.setup_libraries_title()}</h2>
				<p className="text-muted-foreground text-sm">{m.setup_libraries_desc()}</p>
			</div>

			{isLoading && <AppLoadingState label={m.setup_libraries_loading()} className="min-h-32" />}

			{!isLoading && error && <AppErrorState title={m.setup_libraries_failed_to_load()} error={error} onRetry={() => detach(refetch())} />}

			{!(isLoading || error) && libraries.length === 0 && (
				<AppEmptyState title={m.setup_libraries_empty_title()} description={m.setup_libraries_empty_desc()} className="min-h-32" />
			)}

			{!(isLoading || error) && libraries.length > 0 && (
				<ul className="flex flex-col gap-2">
					{libraries.map((library) => (
						<li key={library.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
							<div className="flex min-w-0 flex-col">
								<span className="truncate font-medium text-sm">{library.name}</span>
								<span className="text-muted-foreground text-xs">
									{library.type === "movies" ? m.web_watchlist_stats_movies() : m.web_watchlist_stats_series()}
								</span>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="gap-1.5"
								disabled={isScanning}
								onClick={() => detach(scanLibrary(library.id))}
							>
								<ScanLine className="size-3.5" />
								{m.setup_libraries_scan()}
							</Button>
						</li>
					))}
				</ul>
			)}

			<Button type="button" variant="outline" className="gap-2 self-start" onClick={() => setIsDialogOpen(true)}>
				<Plus className="size-4" />
				{m.setup_libraries_add()}
			</Button>

			<CreateLibraryDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
		</div>
	);
}
