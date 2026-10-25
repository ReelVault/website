import type { MetadataWithRelation } from "@reelvault/sdk";
import { ChevronDown, ChevronUp, Clapperboard, User, Users } from "lucide-react";
import { useState } from "react";
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
				<div className="border-border/50 flex items-center justify-between gap-2 border-b pb-3">
					<TabsList>
						<TabsTrigger value="cast" disabled={cast.length === 0}>
							<Users className="size-3.5" />
							<span>{m.admin_metadata_cast_count({ count: cast.length })}</span>
						</TabsTrigger>
						<TabsTrigger value="crew" disabled={crew.length === 0}>
							<Clapperboard className="size-3.5" />
							<span>{m.admin_metadata_crew_count({ count: crew.length })}</span>
						</TabsTrigger>
					</TabsList>
				</div>

				{/* Cast Content */}
				{cast.length > 0 && (
					<TabsContent value="cast" className="pt-4">
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{visibleCast.map((actor) => (
								<PersonCard
									key={actor.data?.id ? `cast-${actor.data.id}` : `cast-${actor.character ?? "actor"}-${actor.data?.name ?? "unknown"}`}
									name={actor.data?.name ?? m.components_unknown_person()}
									detail={actor.character ?? m.admin_metadata_role_unknown()}
									imageId={actor.data?.imageId}
									imageUpdatedAt={actor.data?.updatedAt}
									badge={`#${actor.sortOrder + 1}`}
								/>
							))}
						</div>

						{cast.length > INITIAL_LIMIT && (
							<div className="mt-4 flex justify-center">
								<Button type="button" variant="outline" size="sm" onClick={() => setShowAllCast((prev) => !prev)}>
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
					<TabsContent value="crew" className="pt-4">
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{visibleCrew.map((member) => (
								<PersonCard
									key={
										member.data?.id
											? `crew-${member.data.id}-${member.job}`
											: `crew-${member.data?.name ?? "unknown"}-${member.job}-${member.department}`
									}
									name={member.data?.name ?? m.components_unknown_person()}
									detail={`${member.job}${member.department ? ` (${member.department})` : ""}`}
									imageId={member.data?.imageId}
									imageUpdatedAt={member.data?.updatedAt}
								/>
							))}
						</div>

						{crew.length > INITIAL_LIMIT && (
							<div className="mt-4 flex justify-center">
								<Button type="button" variant="outline" size="sm" onClick={() => setShowAllCrew((prev) => !prev)}>
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
		<div className="border-border/70 bg-background hover:border-border flex items-center gap-3 rounded-xl border p-2.5 shadow-xs transition-colors">
			<div className="border-border/80 bg-muted/40 relative size-11 shrink-0 overflow-hidden rounded-lg border">
				{imageId ? (
					<ApiImage
						fileId={imageId}
						cacheKey={imageUpdatedAt ?? undefined}
						alt={name}
						width={60}
						aspectRatio={1}
						className="object-cover"
					/>
				) : (
					<div className="text-muted-foreground/60 flex size-full items-center justify-center">
						<User className="size-5" />
					</div>
				)}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<p className="text-foreground truncate text-sm font-medium">{name}</p>
					{badge && <span className="text-muted-foreground shrink-0 font-mono text-xs">{badge}</span>}
				</div>
				<p className="text-muted-foreground truncate text-xs">{detail}</p>
			</div>
		</div>
	);
}
