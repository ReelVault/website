import { useParams } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { useDetailsView } from "@/client/hooks/use-metadata-queries";
import { AppErrorState } from "@/components/app-states";
import { LazyRender } from "@/components/lazy-render";
import { PageContainer } from "@/components/page-container";
import { usePageTitle } from "@/hooks/use-page-title";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { DetailsPageSkeleton } from "./components/details-page-skeleton";
import DetailsHeader from "./sections/details-header";

// Below-fold sections — LazyRender guards mounting, lazy() also guards the code (chunk).
// Fallback = null: the section is outside the viewport, nothing invisible flickers.
const LazyDetailsCollections = lazy(async () => {
	const mod = await import("./sections/details-collections");

	return { default: mod.DetailsCollections };
});
const LazyDetailsFiles = lazy(async () => {
	const mod = await import("./sections/details-files");

	return { default: mod.DetailsFiles };
});
const LazyDetailsSeasons = lazy(async () => {
	const mod = await import("./sections/details-seasons");

	return { default: mod.DetailsSeasons };
});
const LazyDetailsCast = lazy(async () => {
	const mod = await import("./sections/details-cast");

	return { default: mod.DetailsCast };
});
const LazyDetailsRelated = lazy(async () => {
	const mod = await import("./sections/details-related");

	return { default: mod.DetailsRelated };
});
const LazyDetailsSimilarByActor = lazy(async () => {
	const mod = await import("./sections/details-more-like");

	return { default: mod.DetailsSimilarByActor };
});
const LazyPluginTabHost = lazy(async () => {
	const mod = await import("@/plugin-host/tab-host");

	return { default: mod.PluginTabHost };
});

export default function DetailsByIdPage() {
	const { id } = useParams({ from: "/_web/details/$id" });
	const detailsViewQuery = useDetailsView(id);
	usePageTitle(detailsViewQuery.data?.metadata.title);
	const { user } = useCurrentUser();
	const isAdmin = user?.role === "admin";

	if (detailsViewQuery.isLoading) return <DetailsPageSkeleton />;

	if (detailsViewQuery.isError || !detailsViewQuery.data) {
		return (
			<div className="cinema-shell flex min-h-screen items-center justify-center py-16">
				<AppErrorState
					title={m.web_details_fetch_failed()}
					description={m.web_check_connection()}
					error={detailsViewQuery.error}
					onRetry={() => detach(detailsViewQuery.refetch())}
				/>
			</div>
		);
	}

	const metadata = detailsViewQuery.data.metadata;

	const actorsToDisplay: NonNullable<typeof metadata.cast> = [];
	for (const p of metadata.cast) {
		if (p.role === "Acting") {
			actorsToDisplay.push(p);
			if (actorsToDisplay.length === 3) break;
		}
	}

	return (
		<div className="relative min-h-screen bg-background text-foreground">
			<DetailsHeader metadata={metadata} isAdmin={isAdmin} />

			<PageContainer className="relative flex flex-col gap-16 py-16 lg:gap-24">
				{/* 01 // COLLECTION */}
				<LazyRender minHeight={260} rootMargin="400px 0px">
					{() => (
						<Suspense fallback={null}>
							<LazyDetailsCollections collections={metadata.collections} metadataId={id} />
						</Suspense>
					)}
				</LazyRender>

				{/* 03 // AVAILABLE VERSIONS (movies only) */}
				{metadata.type === "movie" && (
					<LazyRender minHeight={200} rootMargin="400px 0px">
						{() => (
							<Suspense fallback={null}>
								<LazyDetailsFiles metadataId={metadata.id} isAdmin={isAdmin} />
							</Suspense>
						)}
					</LazyRender>
				)}

				{/* 03 // SEASONS (series only) */}
				{metadata.type === "tv_show" && (
					<LazyRender minHeight={350} rootMargin="400px 0px">
						{() => (
							<Suspense fallback={null}>
								{/* key: remount on title change so stored/picked season state resets. */}
								<LazyDetailsSeasons key={metadata.id} metadataId={metadata.id} isAdmin={isAdmin} />
							</Suspense>
						)}
					</LazyRender>
				)}

				{/* 02 // OBSADA */}
				<LazyRender minHeight={240} rootMargin="400px 0px">
					{() => (
						<Suspense fallback={null}>
							<LazyDetailsCast cast={metadata.cast} />
						</Suspense>
					)}
				</LazyRender>

				{/* 04 // PODOBNE */}
				<LazyRender minHeight={350} rootMargin="400px 0px">
					{() => (
						<Suspense fallback={null}>
							<LazyDetailsRelated metadataId={id} />
						</Suspense>
					)}
				</LazyRender>

				{/* DYNAMIC CAST SECTIONS */}
				{actorsToDisplay.map((actor) => (
					<LazyRender key={actor.data?.id} minHeight={320} rootMargin="400px 0px">
						{() => (
							<Suspense fallback={null}>
								<LazyDetailsSimilarByActor actor={actor} currentMetadataId={id} />
							</Suspense>
						)}
					</LazyRender>
				))}

				{/* PLUGIN TABS (host details) — renders nothing when there is no contribution */}
				<Suspense fallback={null}>
					<LazyPluginTabHost host="details" params={{ metadataId: id }} />
				</Suspense>
			</PageContainer>
		</div>
	);
}
