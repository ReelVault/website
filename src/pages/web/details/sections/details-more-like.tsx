import type { MetadataWithRelation, RequireFields } from "@reelvault/sdk";
import { Sparkles } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useMetadataSimilarByActor } from "@/client/hooks/use-metadata-queries";
import { defineFields } from "@/client/utils/fields";
import { MetadataCard } from "@/components/cards/metadata-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { DetailsCarousel } from "../components/details-carousel";
import { DetailsSection } from "../components/details-section";

type Cast = MetadataWithRelation["cast"][number];
const fields = defineFields<Cast>()("character", "data.id", "data.name");

export function DetailsSimilarByActor({
	actor,
	currentMetadataId,
}: {
	actor: RequireFields<Cast, typeof fields>;
	currentMetadataId: string;
}) {
	const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "600px 0px" });
	const actorData = actor.data;
	const actorId = actor.data?.id;

	const { data: result, isLoading, isError, refetch } = useMetadataSimilarByActor(actorId, { enabled: inView });
	if (!actorData) return null;

	const similarMetadata = result?.data ?? [];
	const filteredMovies = similarMetadata.filter((item) => item.id !== currentMetadataId);
	const sectionKey = `${actor.character ?? ""}-${actorData.name}`;

	const renderSection = () => {
		if (isError) {
			return (
				<DetailsSection key={sectionKey} title={m.web_more_from_named({ name: actorData.name })} icon={Sparkles}>
					<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
						<p className="text-destructive text-sm">{m.web_related_fetch_failed()}</p>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => {
								detach(refetch());
							}}
						>
							{m.common_try_again()}
						</Button>
					</div>
				</DetailsSection>
			);
		}

		if (inView && isLoading) {
			return (
				<DetailsSection key={sectionKey} title={m.web_more_from_named({ name: actorData.name })} icon={Sparkles}>
					<div className="flex gap-4 overflow-hidden" role="status" aria-label={m.web_loading_titles_from({ name: actorData.name })}>
						{["one", "two", "three", "four", "five"].map((key) => (
							<Skeleton key={key} className="aspect-2/3 w-48 shrink-0 rounded-xl" />
						))}
					</div>
				</DetailsSection>
			);
		}

		if (inView && filteredMovies.length > 0) {
			return (
				<DetailsSection key={sectionKey} title={m.web_more_from_named({ name: actorData.name })} icon={Sparkles}>
					<DetailsCarousel
						items={filteredMovies.map((item) => ({
							key: `actor-${actorId ?? "unknown"}-movie-${item.id}`,
							children: <MetadataCard size="lg" metadata={item} />,
						}))}
					/>
				</DetailsSection>
			);
		}

		return null;
	};

	return (
		<div ref={ref} className="min-h-12.5">
			{renderSection()}
		</div>
	);
}
