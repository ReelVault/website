import { Compass } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useMetadataRelated } from "@/client/hooks/use-metadata-queries";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { DetailsRail } from "../components/details-rail";

export function DetailsRelated({ metadataId }: { metadataId: string }) {
	const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "600px 0px" });
	const { data: results, isLoading, isError, refetch } = useMetadataRelated(metadataId, { enabled: inView });

	return (
		<div ref={ref} className="min-h-12.5">
			<DetailsRail
				title={m.web_more_like_this()}
				icon={Compass}
				items={results?.data ?? []}
				keyPrefix="similar-"
				isLoading={inView && isLoading}
				isError={isError}
				onRetry={() => detach(refetch())}
				errorMessage={m.web_similar_fetch_failed()}
				loadingLabel={m.web_loading_similar()}
			/>
		</div>
	);
}
