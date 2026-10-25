import type { MetadataWithRelation, PersonWithRelations, RequireFields } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { Cake, Clapperboard, Film, Quote } from "lucide-react";
import { SimpleAnimation } from "@/components/simple-animation";
import { ApiImage } from "@/components/ui/api-image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { m } from "@/paraglide/messages";
import { currentYear, getYearFromDate } from "@/utils/date-utils";

export function PersonSidebar({
	personData,
	personMetadataList,
}: {
	personData: RequireFields<PersonWithRelations, "id,name,imageId,biography,birthday,knownCredits"> & { updatedAt?: Date | string };
	personMetadataList: Array<RequireFields<MetadataWithRelation, "id,type,title,releaseDate">>;
}) {
	const birthdayYear = personData.birthday ? getYearFromDate(personData.birthday) : null;
	const age = personData.birthday ? Math.max(0, currentYear() - new Date(personData.birthday).getFullYear()) : null;

	return (
		<SimpleAnimation direction="none" className="flex h-fit shrink-0 flex-col gap-10 lg:sticky lg:top-32 lg:w-80">
			{/* Profile photo */}
			<div className="relative z-10 mx-auto w-full max-w-70 lg:max-w-none">
				<div className="border-border bg-card/60 hover:border-primary/40 aspect-3/4 overflow-hidden rounded-xl border shadow-2xl transition-[border-color] duration-500">
					<ApiImage
						fileId={personData.imageId}
						cacheKey={personData.updatedAt}
						alt={personData.name}
						width={320}
						aspectRatio={3 / 4}
						priority
						className="object-cover"
					/>
				</div>
			</div>

			{/* Quick Info Grid */}
			<div className="grid grid-cols-2 gap-3">
				{[
					{
						icon: <Cake className="size-3.5" aria-hidden="true" />,
						label: m.common_age(),
						value: age ? m.web_person_age_years({ age }) : m.common_no_data(),
					},
					{
						icon: <Clapperboard className="size-3.5" aria-hidden="true" />,
						label: m.common_debut(),
						value: birthdayYear ? m.web_person_born_year({ year: birthdayYear }) : m.common_no_data(),
					},
					...(personData.knownCredits != null
						? [
								{
									icon: <Film className="size-3.5" aria-hidden="true" />,
									label: m.web_person_known_credits(),
									value: m.web_person_known_credits_count({ count: personData.knownCredits }),
								},
							]
						: []),
				].map((stat) => (
					<div key={stat.label} className="border-border/50 bg-card/60 rounded-xl border p-4">
						<div className="text-primary/80 flex items-center gap-2 text-xs font-black">
							{stat.icon} <span>{stat.label}</span>
						</div>
						<span className="text-foreground text-sm font-bold">{stat.value}</span>
					</div>
				))}
			</div>

			{/* Bio */}
			<div className="border-border/50 bg-card/60 relative space-y-4 rounded-xl border p-6">
				<Quote className="text-primary/10 absolute top-4 right-4 size-8" />
				<h3 className="text-primary/80 text-xs font-black">{m.web_about_artist()}</h3>
				<p className="text-foreground/70 text-sm leading-relaxed">
					{personData.biography != null && personData.biography !== "" ? personData.biography : m.web_biography_unavailable()}
				</p>
			</div>

			{/* Filmografia (Timeline) */}
			<section className="space-y-4">
				<h2 className="text-foreground/50 px-1 text-xs font-black">{m.web_person_filmography()}</h2>
				<ScrollArea className="h-64 pr-4">
					<div className="space-y-1">
						{personMetadataList.map((item) => (
							<Link
								to="/details/$id"
								params={{ id: item.id }}
								key={item.id}
								className="group hover:bg-foreground/5 focus-visible:ring-primary flex items-center gap-4 rounded-xl p-2 transition-colors focus-visible:ring-2"
							>
								<span className="text-primary/40 group-hover:text-primary font-mono text-sm font-bold transition-colors">
									{getYearFromDate(item.releaseDate)}
								</span>
								<div className="flex flex-col">
									<h4 className="text-foreground/80 group-hover:text-foreground line-clamp-1 text-sm font-medium transition-colors">
										{item.title}
									</h4>
									<p className="text-foreground/30 text-xs">{item.type === "movie" ? m.common_movie_word() : m.common_series_word()}</p>
								</div>
							</Link>
						))}
					</div>
				</ScrollArea>
			</section>
		</SimpleAnimation>
	);
}
