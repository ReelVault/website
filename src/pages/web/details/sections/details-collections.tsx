import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Layers } from "lucide-react";
import type { Collection, RequireFields } from "@reelvault/sdk";
import { useMetadataCollection } from "@/client/hooks/use-metadata-queries";
import { CollectionCard } from "@/components/cards/collection-card";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { DetailsCarousel } from "../components/details-carousel";
import { DetailsSection } from "../components/details-section";

export function DetailsCollections({
	metadataId,
	collections,
}: {
	metadataId: string;
	collections: Array<RequireFields<Collection, "id">>;
}) {
	const collection = collections[0];
	const { data: results, isError, refetch } = useMetadataCollection(collection?.id);

	if (collections.length === 0 || !collection) return null;

	if (isError) {
		return (
			<DetailsSection title={m.web_series_collection_section()} icon={Layers}>
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
					<p className="text-destructive text-sm">{m.web_collection_fetch_failed()}</p>
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

	if (!results || results.data.length <= 1) return null;

	const currentIndex = results.data.findIndex((item) => item.id === metadataId);

	return (
		<DetailsSection
			title={m.web_series_collection_section()}
			icon={Layers}
			action={
				<Button nativeButton={false} render={<Link to="/collections/$id" params={{ id: collection.id }} />}>
					{m.web_go_to_collection()}
				</Button>
			}
		>
			<DetailsCarousel
				initialIndex={currentIndex >= 0 ? currentIndex : undefined}
				items={results.data.map((item, index: number) => {
					const isCurrent = item.id === metadataId;

					return {
						key: item.id,
						children: (
							<div
								className={cn(
									"relative p-4 transition-[opacity,transform] duration-300",
									isCurrent ? "z-10 scale-105" : "opacity-80 hover:opacity-100",
								)}
							>
								<div className="mb-6 max-w-125">
									<CollectionCard metadata={item} highlight={isCurrent} />
								</div>

								<div className="flex flex-col items-center">
									<div className={cn("h-2 w-2 rounded-full transition-colors", isCurrent ? "scale-150 bg-primary" : "bg-border")} />
									<div
										className={cn("h-8 w-px transition-colors", isCurrent ? "bg-linear-to-b from-primary to-transparent" : "bg-border")}
									/>
									<div
										className={cn(
											"mt-2 flex h-8 w-8 items-center justify-center rounded-lg font-medium text-sm transition-colors",
											isCurrent ? "bg-primary text-primary-foreground" : "text-muted-foreground",
										)}
									>
										{index + 1}
									</div>
								</div>
							</div>
						),
					};
				})}
			/>
		</DetailsSection>
	);
}
