import { Link } from "@tanstack/react-router";
import { Building2, Clapperboard, ExternalLink, Tag } from "lucide-react";
import { formatProviderShortName, getProviderUrl } from "@/client/utils/provider-links";
import { m } from "@/paraglide/messages";

interface DetailsHeaderSpecsProps {
	directors: Array<{ id: string; name: string }>;
	studios: Array<{ id: string; name: string }>;
	keywords?: Array<{ id: string; name: string }>;
	providers?: Array<{ id: string; name: string; externalId: string }>;
	mediaType: "movie" | "tv_show";
}

export function DetailsHeaderSpecs({ directors, studios, keywords, providers, mediaType }: DetailsHeaderSpecsProps) {
	// TV shows have no series-level directors (TMDB carries creators separately),
	// so the empty section is hidden instead of showing "no data".
	const showDirecting = directors.length > 0;

	return (
		<div className="border-border/70 mt-8 flex flex-col gap-4 border-y py-5">
			<div className="flex flex-col gap-6">
				{/* Directing */}
				{showDirecting ? (
					<div className="flex flex-col gap-1.5">
						<span className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
							<Clapperboard className="text-primary size-3.5" aria-hidden="true" />
							{m.web_directed_by()}
						</span>
						<div className="flex flex-wrap gap-x-3 gap-y-1">
							{directors.map((director) => (
								<Link
									key={director.id}
									to="/person/$id"
									params={{ id: director.id }}
									className="border-border/70 bg-card/60 text-foreground hover:border-primary/50 hover:bg-muted hover:text-primary focus-visible:ring-primary inline-flex min-h-10 items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 sm:min-h-0"
								>
									{director.name}
								</Link>
							))}
						</div>
					</div>
				) : null}

				{/* Studios */}
				<div className="flex flex-col gap-1.5">
					<span className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
						<Building2 className="text-primary size-3.5" aria-hidden="true" /> {m.admin_companies_word()}
					</span>
					{studios.length > 0 ? (
						<div className="flex flex-wrap gap-1.5">
							{studios.map((studio) => (
								<Link
									key={studio.id}
									to="/companies/$id"
									params={{ id: studio.id }}
									className="border-border/70 bg-card/60 text-foreground hover:border-primary/50 hover:bg-muted hover:text-primary focus-visible:ring-primary inline-flex min-h-10 items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 sm:min-h-0"
								>
									{studio.name}
								</Link>
							))}
						</div>
					) : (
						<span className="text-muted-foreground text-sm font-medium">{m.common_no_data()}</span>
					)}
				</div>

				{keywords && keywords.length > 0 && (
					<div className="flex flex-col gap-2">
						<span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
							<Tag className="text-primary size-3.5" aria-hidden="true" /> {m.admin_nav_keywords()}
						</span>
						<div className="flex flex-wrap gap-1.5">
							{keywords.map((keyword) => (
								<Link
									key={keyword.id}
									to="/keywords/$id"
									params={{ id: keyword.id }}
									className="border-border/50 bg-card/50 text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground focus-visible:ring-primary inline-flex min-h-10 items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus-visible:ring-2 sm:min-h-0"
								>
									{m.web_keyword_hashtag({ name: keyword.name })}
								</Link>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Dostawcy */}
			{providers && providers.length > 0 && (
				<div className="border-border/40 flex flex-wrap items-center gap-2 border-t pt-3">
					<span className="text-muted-foreground min-w-20 text-xs font-semibold">{m.web_providers_label()}</span>
					<div className="flex flex-wrap gap-1.5">
						{providers.map((p) => {
							const url = getProviderUrl(p.name, p.externalId, mediaType);
							if (!url) return null;

							return (
								<Link
									key={p.id || `${p.name}-${p.externalId}`}
									to={url}
									target="_blank"
									rel="noopener noreferrer"
									className="border-border/80 bg-card/80 text-muted-foreground hover:border-primary/50 hover:bg-muted hover:text-foreground focus-visible:ring-primary inline-flex min-h-10 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 sm:min-h-0"
								>
									<ExternalLink className="text-primary size-3" />
									<span>{formatProviderShortName(p.name)}</span>
								</Link>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
