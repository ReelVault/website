import type { DiscoverResponse } from "@reelvault/sdk";
import { MetadataCard } from "@/components/cards/metadata-card";
import { LazyRender } from "@/components/lazy-render";
import { SimpleAnimation } from "@/components/simple-animation";

export type DiscoverItem = DiscoverResponse["recommendations"][number];

interface DiscoverRowProps {
	title: string;
	description: string;
	items: DiscoverItem[];
}

export function DiscoverRow({ title, description, items }: DiscoverRowProps) {
	if (items.length === 0) return null;

	return (
		<SimpleAnimation direction="up" duration={260}>
			<section aria-labelledby={`discovery-${title}`} className="scroll-mt-24">
				<div className="flex items-end justify-between gap-4">
					<div className="cinema-section-heading">
						<h2 id={`discovery-${title}`}>{title}</h2>
						<p>{description}</p>
					</div>
					<span className="font-mono text-muted-foreground text-xs tabular-nums">{items.length.toString().padStart(2, "0")}</span>
				</div>
				<div className="poster-shelf mt-7">
					{items.map((item) => (
						<LazyRender key={item.id} minHeight={320} rootMargin="350px 0px" className="flex min-w-0 justify-center">
							{() => <MetadataCard metadata={item} fluid />}
						</LazyRender>
					))}
				</div>
			</section>
		</SimpleAnimation>
	);
}
