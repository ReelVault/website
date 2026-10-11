import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Film, Tv } from "lucide-react";
import { useAdminMetadataEditor } from "@/client/hooks/use-admin-metadata-editor";
import { IdentifyPanel } from "@/components/identify/identify-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { EditorMessage } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

export default function MetadataIdentifyPage() {
	const { id: metadataId } = useParams({ from: "/admin/metadata/$id_/identify" });
	const navigate = useNavigate();
	const { metadataQuery } = useAdminMetadataEditor(metadataId, () => detach(() => navigate({ to: "/admin/metadata", replace: true })));

	if (metadataQuery.isLoading) {
		return (
			<div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 sm:px-6">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-10 w-full max-w-md" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	if (metadataQuery.isError || !metadataQuery.data) {
		return <EditorMessage message={m.admin_metadata_failed_to_fetch()} />;
	}

	const metadata = metadataQuery.data;
	const year = metadata.releaseDate ? Number(metadata.releaseDate.slice(0, 4)) : undefined;
	const TypeIcon = metadata.type === "movie" ? Film : Tv;

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6">
			<Button
				tone="muted"
				variant="ghost"
				size="sm"
				className="w-fit"
				nativeButton={false}
				render={<Link to="/admin/metadata/$id" params={{ id: metadataId }} />}
			>
				<ArrowLeft className="size-3.5" aria-hidden="true" />
				<span>{m.common_back()}</span>
			</Button>

			<header className="flex flex-col gap-2">
				<h1 className="flex items-center gap-2 font-bold text-2xl tracking-tight">
					<TypeIcon className="size-5 text-primary" aria-hidden="true" />
					{m.identify_dialog_change_match()}
				</h1>
				<p className="text-muted-foreground text-sm">{year ? `${metadata.title} · ${year}` : metadata.title}</p>
			</header>

			<IdentifyPanel
				key={metadataId}
				metadataId={metadataId}
				mediaType={metadata.type}
				initialTitle={metadata.title}
				initialYear={year}
				variant="page"
				onApplied={() => detach(() => navigate({ to: "/admin/metadata/$id", params: { id: metadataId } }))}
			/>
		</div>
	);
}
