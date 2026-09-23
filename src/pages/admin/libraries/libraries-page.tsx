import type { LibraryWithRelations } from "@reelvault/sdk";
import { useState } from "react";
import { useAdminLibraries, useCheckLibraryErrors } from "@/client/hooks/use-libraries";
import { AppErrorState } from "@/components/app-states";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { CreateLibraryDialog } from "./components/create-library-dialog";
import { EditLibraryDialog } from "./components/edit-library-dialog";
import { IgnoredAssetsDialog } from "./components/ignored-assets-dialog";
import { LibraryFilterBar, type LibraryTypeFilter } from "./components/library-filter-bar";
import { LibraryGrid } from "./components/library-grid";
import { LibraryHeader } from "./components/library-header";
import { LibraryKpiGrid } from "./components/library-kpi-grid";
import { ScanFindingsDialog } from "./components/scan-findings-dialog";

const EMPTY_SET = new Set<string>();

export default function AdminLibrariesPage() {
	const {
		libraries,
		total,
		scanLibrary,
		isScanning,
		scanAllLibraries,
		isScanningAll,
		scanLibraryPath,
		isScanningPath,
		deleteLibrary,
		mutationVariables,
		isDeleting,
		isLoading,
		error,
		refetch,
	} = useAdminLibraries();

	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState<LibraryTypeFilter>("all");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingLibrary, setEditingLibrary] = useState<LibraryWithRelations | null>(null);
	const [ignoredAssetsLibraryId, setIgnoredAssetsLibraryId] = useState<string | null>(null);
	const [scanFindingsLibraryId, setScanFindingsLibraryId] = useState<string | null>(null);
	const checkErrorsMutation = useCheckLibraryErrors();

	const handleDelete = (id: string, _name: string) => deleteLibrary(id);

	const handleScan = (id: string) => detach(scanLibrary(id));

	const handlePathScan = (libraryId: string, pathId: string) => detach(scanLibraryPath({ libraryId, pathId }));

	const openEditModal = (lib: LibraryWithRelations) => {
		setEditingLibrary(lib);
		setIsEditModalOpen(true);
	};

	const handleCheckErrors = (libraryPaths: string[]) => {
		if (libraryPaths.length === 0) {
			return;
		}

		checkErrorsMutation.mutate(libraryPaths);
	};

	const scanningIds = isScanning && mutationVariables.scan ? new Set([mutationVariables.scan]) : EMPTY_SET;
	const scanningPathIds = isScanningPath && mutationVariables.scanPath ? new Set([mutationVariables.scanPath.pathId]) : EMPTY_SET;
	const deletingIds = isDeleting && mutationVariables.delete ? new Set([mutationVariables.delete]) : EMPTY_SET;

	let movieLibs = 0;
	let tvLibs = 0;
	for (const lib of libraries) {
		if (lib.type === "movies") movieLibs++;

		if (lib.type === "tv_shows") tvLibs++;
	}

	// Filter libraries by search query and type filter
	const normalizedQuery = search.trim().toLowerCase();
	const filteredLibraries = libraries.filter((lib) => {
		if (typeFilter !== "all" && lib.type !== typeFilter) return false;

		if (!normalizedQuery) return true;

		return lib.name.toLowerCase().includes(normalizedQuery) || lib.paths.some((p) => p.path.toLowerCase().includes(normalizedQuery));
	});

	if (error) {
		return <AppErrorState title={m.admin_libraries_failed_to_fetch()} error={error} onRetry={() => detach(refetch())} />;
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Page Header */}
			<LibraryHeader
				total={total}
				onAddClick={() => setIsCreateModalOpen(true)}
				onScanAll={() => scanAllLibraries()}
				isScanningAll={isScanningAll}
			/>

			{/* KPI Stats overview */}
			{!isLoading && libraries.length > 0 && <LibraryKpiGrid libraries={libraries} total={total} />}

			{/* Filter & Search Bar */}
			{libraries.length > 0 && (
				<LibraryFilterBar
					typeFilter={typeFilter}
					onTypeFilterChange={setTypeFilter}
					search={search}
					onSearchChange={setSearch}
					totalCount={libraries.length}
					movieCount={movieLibs}
					tvCount={tvLibs}
				/>
			)}

			{/* Libraries Grid */}
			<LibraryGrid
				libraries={filteredLibraries}
				isLoading={isLoading}
				scanningIds={scanningIds}
				scanningPathIds={scanningPathIds}
				deletingIds={deletingIds}
				onScan={handleScan}
				onPathScan={handlePathScan}
				onDelete={handleDelete}
				onEdit={openEditModal}
				onCheckErrors={handleCheckErrors}
				onShowIgnoredAssets={setIgnoredAssetsLibraryId}
				onShowScanFindings={setScanFindingsLibraryId}
				onAddClick={() => setIsCreateModalOpen(true)}
				hasSearchQuery={Boolean(search.trim()) || typeFilter !== "all"}
			/>

			{/* Dialogs */}
			<CreateLibraryDialog isOpen={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
			<EditLibraryDialog library={editingLibrary} isOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen} />
			<IgnoredAssetsDialog
				libraryId={ignoredAssetsLibraryId}
				isOpen={ignoredAssetsLibraryId !== null}
				onOpenChange={(open) => !open && setIgnoredAssetsLibraryId(null)}
			/>
			<ScanFindingsDialog
				libraryId={scanFindingsLibraryId}
				isOpen={scanFindingsLibraryId !== null}
				onOpenChange={(open) => !open && setScanFindingsLibraryId(null)}
			/>
		</div>
	);
}
