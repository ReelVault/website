import type { MetadataWithRelation, RequireFields } from "@reelvault/sdk";
import { Sparkles } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useMetadataSimilarByActor } from "@/client/hooks/use-metadata-queries";
import { defineFields } from "@/client/utils/fields";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { DetailsRail } from "../components/details-rail";

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

	const filteredMovies = (result?.data ?? []).filter((item) => item.id !== currentMetadataId);
	const sectionKey = `${actor.character ?? ""}-${actorData.name}`;

	return (
		<div ref={ref} className="min-h-12.5">
			<DetailsRail
				key={sectionKey}
				title={m.web_more_from_named({ name: actorData.name })}
				icon={Sparkles}
				items={inView ? filteredMovies : []}
				keyPrefix={`actor-${actorId ?? "unknown"}-movie-`}
				isLoading={inView && isLoading}
				isError={isError}
				onRetry={() => detach(refetch())}
				errorMessage={m.web_related_fetch_failed()}
				loadingLabel={m.web_loading_titles_from({ name: actorData.name })}
			/>
		</div>
	);
}
