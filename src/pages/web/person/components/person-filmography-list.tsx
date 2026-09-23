import type { MetadataWithRelation, SelectFields } from "@reelvault/sdk";
import type { metadataCardFields } from "@/client/utils/fields";
import { MetadataCard } from "@/components/cards/metadata-card";
import { LazyRender } from "@/components/lazy-render";
import { SimpleAnimation } from "@/components/simple-animation";
import { m } from "@/paraglide/messages";

type PersonMetadataItem = SelectFields<MetadataWithRelation, typeof metadataCardFields>;

export function PersonFilmographyList({ metadataList }: { metadataList: PersonMetadataItem[] }) {
	if (metadataList.length === 0) {
		return <div className="cinema-surface p-8 text-center text-muted-foreground">{m.web_no_related_titles()}</div>;
	}

	return (
		<div className="poster-shelf">
			{metadataList.map((item) => (
				<LazyRender key={item.id} minHeight={320} rootMargin="350px 0px" className="flex min-w-0 justify-center">
					{() => (
						<SimpleAnimation direction="up" duration={240} className="w-full">
							<MetadataCard metadata={item} fluid />
						</SimpleAnimation>
					)}
				</LazyRender>
			))}
		</div>
	);
}
