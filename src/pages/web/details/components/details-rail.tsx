import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { MetadataCard } from "@/components/cards/metadata-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";
import { DetailsCarousel } from "./details-carousel";
import { DetailsSection } from "./details-section";

type RailMetadata = ComponentProps<typeof MetadataCard>["metadata"];

interface DetailsRailProps {
	title: string;
	icon: LucideIcon;
	items: RailMetadata[];
	keyPrefix: string;
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
	errorMessage: string;
	loadingLabel: string;
}

/** A titled row of title cards with its loading and retry states; renders nothing without items. */
export function DetailsRail({ title, icon, items, keyPrefix, isLoading, isError, onRetry, errorMessage, loadingLabel }: DetailsRailProps) {
	if (isError) {
		return (
			<DetailsSection title={title} icon={icon}>
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
					<p className="text-destructive text-sm">{errorMessage}</p>
					<Button type="button" variant="outline" size="sm" onClick={onRetry}>
						{m.common_try_again()}
					</Button>
				</div>
			</DetailsSection>
		);
	}

	if (isLoading) {
		return (
			<DetailsSection title={title} icon={icon}>
				<div className="flex gap-4 overflow-hidden" role="status" aria-label={loadingLabel}>
					{["one", "two", "three", "four", "five"].map((key) => (
						<Skeleton key={key} className="aspect-2/3 w-48 shrink-0" />
					))}
				</div>
			</DetailsSection>
		);
	}

	if (items.length === 0) {
		return null;
	}

	return (
		<DetailsSection title={title} icon={icon}>
			<DetailsCarousel
				items={items.map((item) => ({
					key: `${keyPrefix}${item.id}`,
					children: <MetadataCard size="lg" metadata={item} />,
				}))}
			/>
		</DetailsSection>
	);
}
