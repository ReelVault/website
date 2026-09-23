import { Link } from "@tanstack/react-router";
import { Cake, Clapperboard, Film, Quote } from "lucide-react";
import type { MetadataWithRelation, PersonWithRelations, RequireFields } from "@reelvault/sdk";
import { SimpleAnimation } from "@/components/simple-animation";
import { ApiImage } from "@/components/ui/api-image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { m } from "@/paraglide/messages";
import { getYearFromDate } from "@/utils/date-utils";

export function PersonSidebar({
	personData,
	personMetadataList,
}: {
	personData: RequireFields<PersonWithRelations, "id,name,imageId,biography,birthday,knownCredits"> & { updatedAt?: Date | string };
	personMetadataList: Array<RequireFields<MetadataWithRelation, "id,type,title,releaseDate">>;
}) {
	const birthdayYear = personData.birthday ? getYearFromDate(personData.birthday) : null;
	const age = personData.birthday ? Math.max(0, new Date().getFullYear() - new Date(personData.birthday).getFullYear()) : null;

	return (
		<SimpleAnimation direction="none" className="flex h-fit shrink-0 flex-col gap-10 lg:sticky lg:top-32 lg:w-80">
			{/* Profile photo */}
			<div className="relative z-10 mx-auto w-full max-w-70 lg:max-w-none">
				<div className="aspect-3/4 overflow-hidden rounded-xl border border-border bg-card/60 shadow-2xl transition-[border-color] duration-500 hover:border-primary/40">
					<ApiImage
						fileId={personData.imageId}
						cacheKey={personData.updatedAt}
						alt={personData.name}
						width={320}
						aspectRatio={3 / 4}
						priority
						className="object-cover transition-transform duration-700 hover:scale-105"
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
					<div key={stat.label} className="rounded-xl border border-border/50 bg-card/60 p-4">
						<div className="flex items-center gap-2 font-black text-[10px] text-primary/80 uppercase tracking-wider">
							{stat.icon} <span>{stat.label}</span>
						</div>
						<span className="font-bold text-foreground text-sm">{stat.value}</span>
					</div>
				))}
			</div>

			{/* Bio */}
			<div className="relative space-y-4 rounded-xl border border-border/50 bg-card/60 p-6">
				<Quote className="absolute top-4 right-4 size-8 text-primary/10" />
				<h3 className="font-black text-primary/80 text-xs uppercase tracking-widest">{m.web_about_artist()}</h3>
				<p className="text-foreground/70 text-sm leading-relaxed">
					{personData.biography != null && personData.biography !== "" ? personData.biography : m.web_biography_unavailable()}
				</p>
			</div>

			{/* Filmografia (Timeline) */}
			<section className="space-y-4">
				<h2 className="px-1 font-black text-foreground/50 text-xs uppercase tracking-[0.2em]">{m.web_person_filmography()}</h2>
				<ScrollArea className="h-64 pr-4">
					<div className="space-y-1">
						{personMetadataList.map((item) => (
							<Link
								to="/details/$id"
								params={{ id: item.id }}
								key={item.id}
								className="group flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-primary"
							>
								<span className="font-bold font-mono text-primary/40 text-sm transition-colors group-hover:text-primary">
									{getYearFromDate(item.releaseDate)}
								</span>
								<div className="flex flex-col">
									<h4 className="line-clamp-1 font-medium text-foreground/80 text-sm transition-colors group-hover:text-foreground">
										{item.title}
									</h4>
									<p className="text-[10px] text-foreground/30 uppercase tracking-wider">
										{item.type === "movie" ? m.common_movie_word() : m.common_series_word()}
									</p>
								</div>
							</Link>
						))}
					</div>
				</ScrollArea>
			</section>
		</SimpleAnimation>
	);
}
