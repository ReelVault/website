import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useAdminMetadataEditor } from "@/client/hooks/use-admin-metadata-editor";
import { LazyIdentifyDialog } from "@/components/lazy-dialogs";
import { LazyRender } from "@/components/lazy-render";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { EditorMessage } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { MetadataArtworkSection } from "./_components/metadata-artwork-section";
import { MetadataBasicInfoSection } from "./_components/metadata-basic-info-section";
import { MetadataEditorSkeleton } from "./_components/metadata-editor-skeleton";
import { MetadataHero } from "./_components/metadata-hero";
import { MetadataOverviewSection } from "./_components/metadata-overview-section";
import { MetadataProvidersSection } from "./_components/metadata-providers-section";
import { MetadataRatingsSection } from "./_components/metadata-ratings-section";
import { MetadataTaxonomySection } from "./_components/metadata-taxonomy-section";
import { MetadataTechnicalSection } from "./_components/metadata-technical-section";
import { useMetadataForm } from "./_components/use-metadata-form";

// Below-the-fold, query-carrying sections — deferred until scrolled near.
const MetadataMediaFilesSection = lazy(async () => ({
	default: (await import("./_components/metadata-media-files-section")).MetadataMediaFilesSection,
}));
const MetadataPeopleSection = lazy(async () => ({
	default: (await import("./_components/metadata-people-section")).MetadataPeopleSection,
}));

const MetadataArtworkDialog = lazy(async () => ({
	default: (await import("./_components/metadata-artwork-dialog")).MetadataArtworkDialog,
}));
const MergeMetadataDialog = lazy(async () => ({ default: (await import("./_components/merge-metadata-dialog")).MergeMetadataDialog }));

type MetadataEditorController = ReturnType<typeof useAdminMetadataEditor>;
type MetadataEditorData = NonNullable<MetadataEditorController["metadataQuery"]["data"]>;

export default function MetadataEditor() {
	const { id: metadataId } = useParams({ from: "/admin/metadata/$id" });
	const navigate = useNavigate();

	const editor = useAdminMetadataEditor(metadataId, () => detach(() => navigate({ to: "/admin/metadata", replace: true })));

	if (!metadataId) {
		return <EditorMessage message={m.admin_metadata_no_identifier_back_to_list()} />;
	}

	if (editor.metadataQuery.isLoading) {
		return <MetadataEditorSkeleton />;
	}

	if (editor.metadataQuery.isError || !editor.metadataQuery.data) {
		return <EditorMessage message={m.admin_metadata_failed_to_fetch()} />;
	}

	const metadata = editor.metadataQuery.data;

	// Remount on id/version change so the form is always seeded synchronously from
	// the loaded metadata (TanStack Form `update` must never race an async reset).
	const versionKey = new Date(metadata.updatedAt).getTime();

	return <MetadataEditorContent key={`${metadata.id}:${versionKey}`} metadataId={metadataId} metadata={metadata} editor={editor} />;
}

function MetadataEditorContent({
	metadataId,
	metadata,
	editor,
}: {
	metadataId: string;
	metadata: MetadataEditorData;
	editor: MetadataEditorController;
}) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogType, setDialogType] = useState<"poster" | "backdrop">("poster");
	const [identifyOpen, setIdentifyOpen] = useState(false);
	const [mergeOpen, setMergeOpen] = useState(false);

	const { updateMutation, deleteMutation, refreshMutation, refreshImagesMutation, deleteImageMutation, mergeMutation } = editor;

	const { basic, overview, lockedFields, setField, toggleFieldLock, handleLockAll, handleUnlockAll, handleSave } = useMetadataForm(
		metadata,
		updateMutation,
	);

	const openArtworkDialog = (type: "poster" | "backdrop") => {
		setDialogType(type);
		setDialogOpen(true);
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Top breadcrumb navigation */}
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					className="h-8 gap-1.5 px-2 text-muted-foreground text-xs hover:text-foreground"
					nativeButton={false}
					render={<Link to="/admin/metadata" />}
				>
					<ArrowLeft className="size-3.5" />
					<span>{m.admin_metadata_back_to_list()}</span>
				</Button>
			</div>

			{/* Hero Header Card */}
			<MetadataHero
				metadata={metadata}
				lockedFields={lockedFields}
				onLockAll={handleLockAll}
				onUnlockAll={handleUnlockAll}
				onOpenPosterDialog={() => openArtworkDialog("poster")}
				onOpenIdentifyDialog={() => setIdentifyOpen(true)}
				onOpenMergeDialog={() => setMergeOpen(true)}
				onRefresh={() => refreshMutation.mutate()}
				onRefreshImages={() => refreshImagesMutation.mutate()}
				onSave={() => detach(handleSave)}
				onDelete={() => deleteMutation.mutateAsync()}
				isRefreshing={refreshMutation.isPending}
				isRefreshingImages={refreshImagesMutation.isPending}
				isSaving={updateMutation.isPending}
				isDeleting={deleteMutation.isPending}
			/>

			{/* Main Grid: Form / Taxonomy & Artwork */}
			<div className="grid gap-6 lg:grid-cols-3">
				<div className="flex flex-col gap-6 lg:col-span-2">
					<MetadataBasicInfoSection basic={basic} lockedFields={lockedFields} onChange={setField} onToggleLock={toggleFieldLock} />
					<MetadataOverviewSection
						overview={overview}
						onChange={(v) => setField("overview", v)}
						isLocked={lockedFields.includes("overview")}
						onToggleLock={toggleFieldLock}
					/>
					<MetadataProvidersSection metadata={metadata} onOpenIdentify={() => setIdentifyOpen(true)} />
					<MetadataRatingsSection metadata={metadata} />
					<MetadataTaxonomySection metadata={metadata} lockedFields={lockedFields} onToggleLock={toggleFieldLock} />
					<Suspense fallback={<Skeleton className="h-40 rounded-xl" />}>
						<LazyRender>{() => <MetadataPeopleSection metadata={metadata} />}</LazyRender>
					</Suspense>
				</div>

				<div className="flex flex-col gap-6">
					<MetadataTechnicalSection metadata={metadata} />
					<MetadataArtworkSection
						metadata={metadata}
						lockedFields={lockedFields}
						onToggleLock={toggleFieldLock}
						onOpenDialog={openArtworkDialog}
						onRemoveImage={(imageId) => deleteImageMutation.mutateAsync(imageId)}
						isDeletingImage={deleteImageMutation.isPending}
					/>
				</div>
			</div>

			<Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
				<LazyRender>{() => <MetadataMediaFilesSection metadataId={metadataId} />}</LazyRender>
			</Suspense>

			{/* Dialogs */}
			{dialogOpen && (
				<Suspense fallback={null}>
					<MetadataArtworkDialog metadataId={metadataId} type={dialogType} open={dialogOpen} onOpenChange={setDialogOpen} />
				</Suspense>
			)}
			{mergeOpen && (
				<Suspense fallback={null}>
					<MergeMetadataDialog
						metadata={metadata}
						open={mergeOpen}
						onOpenChange={setMergeOpen}
						onMerge={(sourceId) => mergeMutation.mutateAsync(sourceId)}
						isMerging={mergeMutation.isPending}
					/>
				</Suspense>
			)}
			{identifyOpen && (
				<Suspense fallback={null}>
					<LazyIdentifyDialog
						metadataId={metadataId}
						mediaType={metadata.type}
						initialTitle={metadata.title}
						initialYear={metadata.releaseDate ? Number(metadata.releaseDate.slice(0, 4)) : undefined}
						open={identifyOpen}
						onOpenChange={setIdentifyOpen}
					/>
				</Suspense>
			)}
		</div>
	);
}
