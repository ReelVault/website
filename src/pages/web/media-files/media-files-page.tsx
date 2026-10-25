import { Link, useParams, useSearch } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { useDetailsView } from "@/client/hooks/use-metadata-queries";
import { isAdminUser } from "@/components/auth/admin-access";
import { AdminRefreshButtons } from "@/components/media-files/media-files-admin-actions";
import { MediaFilesList } from "@/components/media-files/media-files-list";
import { useMediaFiles } from "@/components/media-files/use-media-files";
import { useMediaFilesRefresh } from "@/components/media-files/use-media-files-refresh";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/use-page-title";
import { m } from "@/paraglide/messages";

export default function MediaFilesPage() {
	const { id } = useParams({ from: "/_web/media-files/$id" });
	const { episode, label } = useSearch({ from: "/_web/media-files/$id" });
	const { user } = useCurrentUser();
	const detailsQuery = useDetailsView(id);
	const title = detailsQuery.data?.metadata.title;

	usePageTitle(title ? m.components_media_files_params_for({ title }) : m.components_media_files_data_heading());

	const { query, files, filteredFiles, searchQuery, setSearchQuery, retry } = useMediaFiles({
		metadataId: id,
		episodeId: episode,
		enabled: true,
	});
	const refresh = useMediaFilesRefresh({ metadataId: id, episodeId: episode });

	return (
		<main className="cinema-shell flex flex-col gap-8 pt-24 pb-16 lg:pt-28">
			<Link
				to="/details/$id"
				params={{ id }}
				className="text-muted-foreground hover:text-foreground inline-flex min-h-11 w-fit items-center gap-2 text-sm transition-colors"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				{m.common_back()}
			</Link>

			<header className="flex flex-wrap items-end justify-between gap-4">
				<div className="flex min-w-0 flex-col gap-2">
					<h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{m.components_media_files_data_heading()}</h1>
					{label && <p className="text-foreground text-lg font-semibold">{label}</p>}
					<p className="text-muted-foreground text-sm">
						{title ? m.components_media_files_params_for({ title }) : m.components_media_files_params_quality_heading()}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					{files.length > 0 && (
						<Badge variant="secondary" font="mono">
							{m.common_files_count({ count: files.length })}
						</Badge>
					)}
					{isAdminUser(user) && <AdminRefreshButtons metadataId={id} episodeId={episode} {...refresh} />}
				</div>
			</header>

			<section className="cinema-surface overflow-hidden">
				<MediaFilesList
					isPending={query.isPending}
					isError={query.isError}
					error={query.error}
					files={files}
					filteredFiles={filteredFiles}
					metadataId={id}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					onRetry={retry}
				/>
			</section>
		</main>
	);
}
