import { Clapperboard, ExternalLink, Lock, Radio, Star, Tv, Unlock } from "lucide-react";
import type { MetadataWithRelation } from "reelvault-sdk";
import { formatProviderName, formatProviderShortName, getProviderUrl } from "@/client/utils/provider-links";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { m } from "@/paraglide/messages";
import { formatNumber, formatRating } from "@/utils/format-utils";

interface MetadataHeroBadgesProps {
	metadata: MetadataWithRelation;
	releaseYear: string | number;
	rating: string;
	lockedCount: number;
}

export function MetadataHeroBadges({ metadata, releaseYear, rating, lockedCount }: MetadataHeroBadgesProps) {
	const isMovie = metadata.type === "movie";

	return (
		<div className="flex flex-wrap items-center gap-2">
			<Badge variant={isMovie ? "default" : "secondary"} size="sm" className="gap-1 font-medium capitalize">
				{isMovie ? <Clapperboard className="size-3" /> : <Tv className="size-3" />}
				<span>{isMovie ? m.common_movie_word() : m.common_series_word()}</span>
			</Badge>
			<Badge variant="outline" size="sm" className="font-mono text-xs">
				{releaseYear}
			</Badge>
			{metadata.status !== null && (
				<Badge variant="secondary" size="sm" className="text-[11px]">
					{metadata.status}
				</Badge>
			)}
			{rating !== "—" && (
				<Tooltip>
					<TooltipTrigger
						render={
							<span className="flex cursor-default items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 font-medium text-warning text-xs">
								<Star className="size-3 fill-warning text-warning" />
								<span className="tabular-nums">{rating}</span>
							</span>
						}
					/>
					<TooltipContent side="top" className="flex flex-col gap-1 text-xs">
						<div className="border-border/50 border-b pb-1 font-semibold text-foreground">
							{m.admin_metadata_average_rating({ rating })}
						</div>
						{metadata.rating.scores.length > 0 ? (
							metadata.rating.scores.map((s) => (
								<div key={s.source} className="flex items-center justify-between gap-3">
									<span className="text-muted-foreground">
										{m.admin_metadata_rating_source_label({ source: s.label ?? formatProviderShortName(s.source) })}
									</span>
									<span className="font-medium font-mono text-foreground">
										{m.admin_metadata_score_value({ value: formatRating(s.value), max: s.maxValue })}
										{s.votes > 0 ? ` (${formatNumber(s.votes)})` : ""}
									</span>
								</div>
							))
						) : (
							<span className="text-muted-foreground">{m.admin_metadata_no_rating_breakdown()}</span>
						)}
					</TooltipContent>
				</Tooltip>
			)}

			{metadata.primaryProviderId && (
				<Tooltip>
					<TooltipTrigger
						render={
							<Badge variant="outline" size="sm" className="gap-1 border-primary/30 bg-primary/5 font-mono text-primary text-xs">
								<Radio className="size-3" />
								<span>
									{m.admin_metadata_source_label()} {formatProviderShortName(metadata.primaryProviderId)}
								</span>
							</Badge>
						}
					/>
					<TooltipContent side="top" className="text-xs">
						{m.admin_metadata_primary_provider_tooltip({ provider: formatProviderName(metadata.primaryProviderId) })}
					</TooltipContent>
				</Tooltip>
			)}

			{metadata.providers.map((p) => {
				const short = formatProviderShortName(p.name);
				const url = getProviderUrl(p.name, p.externalId, metadata.type);

				return (
					<Tooltip key={p.id || `${p.name}-${p.externalId}`}>
						<TooltipTrigger
							render={
								url ? (
									<a
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 font-mono text-foreground text-xs transition-colors hover:border-primary/50 hover:bg-muted"
									>
										<span>{m.admin_metadata_provider_external_id({ provider: short, id: p.externalId })}</span>
										<ExternalLink className="size-2.5 text-muted-foreground" />
									</a>
								) : (
									<Badge variant="outline" size="sm" className="font-mono text-xs">
										{m.admin_metadata_provider_external_id({ provider: short, id: p.externalId })}
									</Badge>
								)
							}
						/>
						<TooltipContent side="top" className="text-xs">
							{m.admin_metadata_external_identifier({ provider: formatProviderName(p.name), id: p.externalId })}
							{p.name.toLowerCase() === metadata.primaryProviderId?.toLowerCase() && m.admin_metadata_primary_provider_paren()}
						</TooltipContent>
					</Tooltip>
				);
			})}

			{lockedCount > 0 ? (
				<Badge variant="outline" size="sm" className="gap-1 border-warning/30 bg-warning/10 text-warning text-xs">
					<Lock className="size-3" />
					<span>{m.admin_metadata_locked_fields_total({ count: lockedCount })}</span>
				</Badge>
			) : (
				<Badge variant="outline" size="sm" className="gap-1 text-muted-foreground text-xs">
					<Unlock className="size-3" />
					<span>{m.admin_metadata_no_locked_fields()}</span>
				</Badge>
			)}
		</div>
	);
}
