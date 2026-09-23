import { Users } from "lucide-react";
import type { ComponentProps } from "react";
import { PersonCard } from "@/components/cards/person-card";
import { m } from "@/paraglide/messages";
import { DetailsCarousel } from "../components/details-carousel";
import { DetailsSection } from "../components/details-section";

export function DetailsCast({ cast }: { cast: Array<ComponentProps<typeof PersonCard>["person"]> }) {
	return (
		<DetailsSection title={m.web_cast_crew()} icon={Users}>
			<DetailsCarousel
				items={cast.map((person) => ({
					key: `cast-${person.data?.id ?? `${person.character ?? "person"}-${person.data?.name ?? "unknown"}`}`,
					children: person.data && <PersonCard person={person} />,
				}))}
			/>
		</DetailsSection>
	);
}
