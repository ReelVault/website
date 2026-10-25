import type { MetadataWithRelation, RequireFields } from "@reelvault/sdk";
import { Calendar, Clapperboard, Star } from "lucide-react";
import { defineFields } from "@/client/utils/fields";
import { SimpleAnimation } from "@/components/simple-animation";
import { m } from "@/paraglide/messages";
import { formatRating } from "@/utils/format-utils";

const fields = defineFields<MetadataWithRelation>()("releaseDate", "rating");

export function PersonStats({ metadata }: { metadata: Array<RequireFields<MetadataWithRelation, typeof fields>> }) {
	const averageRating = metadata.length > 0 ? metadata.reduce((sum, item) => sum + item.rating.avgScore, 0) / metadata.length : null;
	const debutYear = metadata.reduce<number | null>((year, item) => {
		const currentYear = item.releaseDate ? new Date(item.releaseDate).getFullYear() : null;

		return currentYear && (year === null || currentYear < year) ? currentYear : year;
	}, null);

	return (
		<SimpleAnimation direction="up" delay={60} duration={260}>
			<section className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<div className="border-border/50 from-primary/20 col-span-2 flex flex-col justify-center rounded-xl border bg-linear-to-br to-transparent p-8 md:col-span-2">
					<Clapperboard className="text-primary mb-4 size-8" />
					<h4 className="text-foreground text-5xl font-black">{metadata.length}</h4>
					<p className="text-foreground/40 text-xs font-bold">{m.web_body_of_work_titles()}</p>
				</div>
				<div className="border-border/50 bg-card/60 flex flex-col items-center justify-center rounded-xl border p-8 text-center transition-transform hover:scale-[1.02]">
					<Star className="fill-warning/50 text-warning/50 mb-2 size-6" />
					<p className="text-foreground text-2xl font-black">
						{averageRating == null ? m.common_not_available() : formatRating(averageRating)}
					</p>
					<p className="text-foreground/40 text-xs font-bold">{m.web_average_rating()}</p>
				</div>
				<div className="border-border/50 bg-card/60 flex flex-col items-center justify-center rounded-xl border p-8 text-center transition-transform hover:scale-[1.02]">
					<Calendar className="text-primary/40 mb-2 size-6" />
					<p className="text-foreground text-2xl font-black">{debutYear ?? m.common_not_available()}</p>
					<p className="text-foreground/40 text-xs font-bold">{m.web_first_title()}</p>
				</div>
			</section>
		</SimpleAnimation>
	);
}
