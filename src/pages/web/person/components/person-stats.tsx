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
				<div className="col-span-2 flex flex-col justify-center rounded-xl border border-border/50 bg-linear-to-br from-primary/20 to-transparent p-8 md:col-span-2">
					<Clapperboard className="mb-4 size-8 text-primary" />
					<h4 className="font-black text-5xl text-foreground">{metadata.length}</h4>
					<p className="font-bold text-foreground/40 text-xs uppercase tracking-widest">{m.web_body_of_work_titles()}</p>
				</div>
				<div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/60 p-8 text-center transition-transform hover:scale-[1.02]">
					<Star className="mb-2 size-6 fill-yellow-500/50 text-yellow-500/50" />
					<p className="font-black text-2xl text-foreground">
						{averageRating == null ? m.common_not_available() : formatRating(averageRating)}
					</p>
					<p className="font-bold text-[10px] text-foreground/40 uppercase">{m.web_average_rating()}</p>
				</div>
				<div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/60 p-8 text-center transition-transform hover:scale-[1.02]">
					<Calendar className="mb-2 size-6 text-primary/40" />
					<p className="font-black text-2xl text-foreground">{debutYear ?? m.common_not_available()}</p>
					<p className="font-bold text-[10px] text-foreground/40 uppercase">{m.web_first_title()}</p>
				</div>
			</section>
		</SimpleAnimation>
	);
}
