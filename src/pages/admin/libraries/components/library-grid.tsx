import type { LibraryWithRelations } from "@reelvault/sdk";
import { FolderOpen, Plus } from "lucide-react";
import { AppEmptyState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";
import { LibraryCard } from "./library-card";

export function LibraryGrid({
	libraries,
	isLoading,
	scanningIds,
	scanningPathIds,
	deletingIds,
	onScan,
	onPathScan,
	onDelete,
	onEdit,
	onCheckErrors,
	onShowIgnoredAssets,
	onShowScanFindings,
	onAddClick,
	hasSearchQuery,
}: {
	libraries: LibraryWithRelations[];
	isLoading: boolean;
	scanningIds: Set<string>;
	scanningPathIds: Set<string>;
	deletingIds: Set<string>;
	onScan: (id: string) => void;
	onPathScan: (libraryId: string, pathId: string) => void;
	onDelete: (id: string, name: string) => Promise<unknown>;
	onEdit: (lib: LibraryWithRelations) => void;
	onCheckErrors: (libraryPaths: string[]) => void;
	onShowIgnoredAssets: (libraryId: string) => void;
	onShowScanFindings: (libraryId: string) => void;
	onAddClick?: () => void;
	hasSearchQuery?: boolean;
}) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
				{["skel-1", "skel-2", "skel-3", "skel-4"].map((key) => (
					<Card key={key} className="overflow-hidden border-border/80 bg-card">
						<CardHeader className="flex flex-row items-center justify-between gap-4 p-5 pb-4">
							<div className="flex items-center gap-3.5">
								<Skeleton className="size-11 rounded-xl" />
								<div className="flex flex-col gap-2">
									<Skeleton className="h-5 w-40 rounded-md" />
									<Skeleton className="h-3.5 w-24 rounded-md" />
								</div>
							</div>
							<Skeleton className="h-8 w-16 rounded-md" />
						</CardHeader>
						<CardContent className="flex flex-col gap-4 p-5 pt-0">
							<Skeleton className="h-16 w-full rounded-lg" />
							<div className="flex flex-col gap-2">
								<Skeleton className="h-12 w-full rounded-lg" />
								<Skeleton className="h-12 w-full rounded-lg" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (libraries.length === 0) {
		if (hasSearchQuery) {
			return <AppEmptyState icon={FolderOpen} title={m.admin_libraries_no_search_results()} description={m.admin_libraries_no_matches()} />;
		}

		return (
			<div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 border-dashed bg-card/50 p-12 text-center">
				<div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-muted/40 text-muted-foreground shadow-xs">
					<FolderOpen className="size-7 text-primary" />
				</div>
				<h3 className="mt-4 font-semibold text-foreground text-lg">{m.admin_libraries_empty_heading()}</h3>
				<p className="mt-1.5 max-w-md text-muted-foreground text-sm">{m.admin_libraries_empty_desc()}</p>
				{onAddClick !== undefined && (
					<Button type="button" size="default" onClick={onAddClick} className="mt-5 gap-2">
						<Plus className="size-4" />
						<span>{m.admin_libraries_add_first_library()}</span>
					</Button>
				)}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
			{libraries.map((lib) => (
				<LibraryCard
					key={lib.id}
					lib={lib}
					isScanning={scanningIds.has(lib.id)}
					scanningPathIds={scanningPathIds}
					isDeleting={deletingIds.has(lib.id)}
					onScan={onScan}
					onPathScan={onPathScan}
					onDelete={onDelete}
					onEdit={onEdit}
					onCheckErrors={onCheckErrors}
					onShowIgnoredAssets={onShowIgnoredAssets}
					onShowScanFindings={onShowScanFindings}
				/>
			))}
		</div>
	);
}
