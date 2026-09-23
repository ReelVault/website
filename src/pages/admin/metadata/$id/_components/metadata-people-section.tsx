import { ChevronDown, ChevronUp, Clapperboard, User, Users } from "lucide-react";
import { useState } from "react";
import type { MetadataWithRelation } from "reelvault-sdk";
import { ApiImage } from "@/components/ui/api-image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

const INITIAL_LIMIT = 12;

export function MetadataPeopleSection({ metadata }: { metadata: MetadataWithRelation }) {
	const cast = metadata.cast;
	const crew = metadata.crew;

	const [showAllCast, setShowAllCast] = useState(false);
	const [showAllCrew, setShowAllCrew] = useState(false);

	if (cast.length === 0 && crew.length === 0) return null;

	const visibleCast = showAllCast ? cast : cast.slice(0, INITIAL_LIMIT);
	const visibleCrew = showAllCrew ? crew : crew.slice(0, INITIAL_LIMIT);

	return (
		<AdminSection title={m.admin_metadata_cast_crew()} description={m.admin_metadata_cast_crew_description()}>
			<Tabs defaultValue={cast.length > 0 ? "cast" : "crew"} className="w-full">
				<div className="flex items-center justify-between gap-2 border-border/50 border-b pb-3">
					<TabsList className="h-9">
						<TabsTrigger value="cast" disabled={cast.length === 0} className="gap-1.5 text-xs">
							<Users className="size-3.5" />
							<span>{m.admin_metadata_cast_count({ count: cast.length })}</span>
						</TabsTrigger>
						<TabsTrigger value="crew" disabled={crew.length === 0} className="gap-1.5 text-xs">
							<Clapperboard className="size-3.5" />
							<span>{m.admin_metadata_crew_count({ count: crew.length })}</span>
						</TabsTrigger>
					</TabsList>
				</div>

				{/* Cast Content */}
				{cast.length > 0 && (
					<TabsContent value="cast" className="pt-4 outline-hidden">
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{visibleCast.map((actor) => (
								<PersonCard
									key={actor.data?.id ? `cast-${actor.data.id}` : `cast-${actor.character ?? "actor"}-${actor.data?.name ?? "unknown"}`}
									name={actor.data?.name ?? "Nieznana osoba"}
									detail={actor.character ?? m.admin_metadata_role_unknown()}
									imageId={actor.data?.imageId}
									imageUpdatedAt={actor.data?.updatedAt}
									badge={`#${actor.sortOrder + 1}`}
								/>
							))}
						</div>

						{cast.length > INITIAL_LIMIT && (
							<div className="mt-4 flex justify-center">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setShowAllCast((prev) => !prev)}
									className="gap-1.5 text-xs"
								>
									{showAllCast ? (
										<>
											<ChevronUp className="size-3.5" />
											<span>{m.admin_metadata_collapse_cast({ INITIAL_LIMIT })}</span>
										</>
									) : (
										<>
											<ChevronDown className="size-3.5" />
											<span>{m.admin_metadata_show_all_cast({ castCount: cast.length })}</span>
										</>
									)}
								</Button>
							</div>
						)}
					</TabsContent>
				)}

				{/* Crew Content */}
				{crew.length > 0 && (
					<TabsContent value="crew" className="pt-4 outline-hidden">
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{visibleCrew.map((member) => (
								<PersonCard
									key={
										member.data?.id
											? `crew-${member.data.id}-${member.job}`
											: `crew-${member.data?.name ?? "unknown"}-${member.job}-${member.department}`
									}
									name={member.data?.name ?? "Nieznana osoba"}
									detail={`${member.job}${member.department ? ` (${member.department})` : ""}`}
									imageId={member.data?.imageId}
									imageUpdatedAt={member.data?.updatedAt}
								/>
							))}
						</div>

						{crew.length > INITIAL_LIMIT && (
							<div className="mt-4 flex justify-center">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setShowAllCrew((prev) => !prev)}
									className="gap-1.5 text-xs"
								>
									{showAllCrew ? (
										<>
											<ChevronUp className="size-3.5" />
											<span>{m.admin_metadata_collapse_people({ INITIAL_LIMIT })}</span>
										</>
									) : (
										<>
											<ChevronDown className="size-3.5" />
											<span>{m.admin_metadata_show_full_crew({ crewCount: crew.length })}</span>
										</>
									)}
								</Button>
							</div>
						)}
					</TabsContent>
				)}
			</Tabs>
		</AdminSection>
	);
}

function PersonCard({
	name,
	detail,
	imageId,
	imageUpdatedAt,
	badge,
}: {
	name: string;
	detail: string;
	imageId?: string | null;
	imageUpdatedAt?: string | Date | null;
	badge?: string;
}) {
	return (
		<div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background p-2.5 shadow-xs transition-colors hover:border-border">
			<div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-muted/40">
				{imageId ? (
					<ApiImage
						fileId={imageId}
						cacheKey={imageUpdatedAt ?? undefined}
						alt={name}
						width={60}
						aspectRatio={1}
						className="size-full object-cover"
					/>
				) : (
					<div className="flex size-full items-center justify-center text-muted-foreground/60">
						<User className="size-5" />
					</div>
				)}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<p className="truncate font-medium text-foreground text-sm">{name}</p>
					{badge && <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{badge}</span>}
				</div>
				<p className="truncate text-muted-foreground text-xs">{detail}</p>
			</div>
		</div>
	);
}
