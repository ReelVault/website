import { Compass } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useMetadataRelated } from "@/client/hooks/use-metadata-queries";
import { MetadataCard } from "@/components/cards/metadata-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { DetailsCarousel } from "../components/details-carousel";
import { DetailsSection } from "../components/details-section";

export function DetailsRelated({ metadataId }: { metadataId: string }) {
	const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "600px 0px" });
	const { data: results, isLoading, isError, refetch } = useMetadataRelated(metadataId, { enabled: inView });
	const similarItems = results?.data ?? [];

	const renderRelatedArea = () => {
		if (isError) {
			return (
				<DetailsSection title={m.web_more_like_this()} icon={Compass}>
					<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
						<p className="text-destructive text-sm">{m.web_similar_fetch_failed()}</p>
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
				<DetailsSection title={m.web_more_like_this()} icon={Compass}>
					<div className="flex gap-4 overflow-hidden" role="status" aria-label={m.web_loading_similar()}>
						{["one", "two", "three", "four", "five"].map((key) => (
							<Skeleton key={key} className="aspect-2/3 w-48 shrink-0 rounded-xl" />
						))}
					</div>
				</DetailsSection>
			);
		}

		if (similarItems.length > 0) {
			return (
				<DetailsSection title={m.web_more_like_this()} icon={Compass}>
					<DetailsCarousel
						items={similarItems.map((item) => ({
							key: `similar-${item.id}`,
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
			{renderRelatedArea()}
		</div>
	);
}
