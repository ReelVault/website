import type { MetadataWithRelation } from "@reelvault/sdk";
import { ExternalLink, Star, ThumbsUp } from "lucide-react";
import { formatProviderName, formatProviderShortName, getProviderUrl } from "@/client/utils/provider-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatNumber, formatRating } from "@/utils/format-utils";

export function MetadataRatingsSection({ metadata }: { metadata: MetadataWithRelation }) {
	const scores = metadata.rating.scores;
	const avgScore = metadata.rating.avgScore;
	const formattedAvg = formatRating(avgScore);

	return (
		<AdminSection title={m.admin_metadata_ratings_section()} description={m.admin_metadata_rating_stats_description()}>
			<div className="flex flex-col gap-4">
				{/* Average Score Summary Card */}
				<div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-background p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-warning/20 bg-warning/10 text-warning shadow-xs">
							<Star className="size-7 fill-warning" />
						</div>
						<div>
							<div className="flex items-baseline gap-2">
								<span className="font-extrabold text-3xl text-foreground tracking-tight sm:text-4xl">{formattedAvg}</span>
								<span className="font-semibold text-muted-foreground text-sm">{m.admin_metadata_rating_out_of()}</span>
							</div>
							<p className="text-muted-foreground text-xs">{m.admin_metadata_aggregated_rating()}</p>
						</div>
					</div>

					<div className="flex items-center gap-2 border-border/50 border-t pt-3 sm:border-t-0 sm:pt-0">
						<Badge variant="secondary" size="sm" className="gap-1 font-medium text-xs">
							<ThumbsUp className="size-3 text-primary" />
							<span>{m.admin_metadata_rating_sources_total({ count: scores.length })}</span>
						</Badge>
					</div>
				</div>

				{/* Individual Score Cards Grid */}
				{scores.length > 0 ? (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{scores.map((score) => (
							<RatingCard key={`${score.source}-${score.metadataId}`} score={score} metadata={metadata} />
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/80 border-dashed bg-muted/20 p-6 text-center">
						<Star className="size-6 text-muted-foreground/50" />
						<p className="font-medium text-foreground text-sm">{m.admin_metadata_no_detailed_ratings()}</p>
						<p className="max-w-md text-muted-foreground text-xs">{m.admin_metadata_no_ratings_hint()}</p>
					</div>
				)}
			</div>
		</AdminSection>
	);
}

function RatingCard({
	score,
	metadata,
}: {
	score: NonNullable<MetadataWithRelation["rating"]>["scores"][number];
	metadata: MetadataWithRelation;
}) {
	const matchingProvider = metadata.providers.find((p) => p.name.toLowerCase() === score.source.toLowerCase());
	const resolvedUrl =
		score.url ?? (matchingProvider ? getProviderUrl(matchingProvider.name, matchingProvider.externalId, metadata.type) : null);
	const shortSource = formatProviderShortName(score.source);
	const displayName = score.label ?? formatProviderName(score.source);
	const percentage = Math.round(Math.min(100, Math.max(0, (score.value / (score.maxValue || 10)) * 100)));

	return (
		<div className="flex flex-col justify-between gap-3 rounded-xl border border-border/80 bg-background p-4 shadow-xs">
			<div>
				<div className="flex items-start justify-between gap-2">
					<div>
						<h4 className="font-semibold text-foreground text-sm">{displayName}</h4>
						<span className="text-[11px] text-muted-foreground">{m.admin_metadata_source_site_label({ source: shortSource })}</span>
					</div>

					<span className="flex items-center gap-1 rounded-md border border-warning/20 bg-warning/10 px-2 py-0.5 font-bold text-warning text-xs">
						<Star className="size-3 fill-current" />
						<span>
							{formatRating(score.value)}
							<span className="font-normal opacity-70">{m.admin_metadata_score_of_max({ max: score.maxValue })}</span>
						</span>
					</span>
				</div>

				<div className="mt-3 flex flex-col gap-1.5">
					<div className="flex items-center justify-between text-muted-foreground text-xs">
						<span>{m.admin_score_percent()}</span>
						<span className="font-mono font-semibold text-foreground">{m.common_percent_value({ value: percentage })}</span>
					</div>
					<Progress value={percentage} className="h-1.5" />
				</div>
			</div>

			<div className="flex items-center justify-between gap-2 border-border/40 border-t pt-2.5">
				<span className="text-[11px] text-muted-foreground">
					{score.votes > 0 ? m.admin_metadata_votes_count({ votes: formatNumber(score.votes) }) : m.admin_metadata_no_vote_count()}
				</span>

				{resolvedUrl && (
					<Button
						variant="ghost"
						size="sm"
						className="h-6 gap-1 px-1.5 text-primary text-xs hover:bg-primary/10 hover:text-primary"
						nativeButton={false}
						render={
							<a href={resolvedUrl} target="_blank" rel="noopener noreferrer" aria-label={m.admin_metadata_rating_source_profile()} />
						}
					>
						<span>{m.user_profile_page_title()}</span>
						<ExternalLink className="size-3" />
					</Button>
				)}
			</div>
		</div>
	);
}
