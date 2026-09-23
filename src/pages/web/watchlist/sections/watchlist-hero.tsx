import { Link } from "@tanstack/react-router";
import { Flame, Play } from "lucide-react";
import type { WatchlistItem } from "@/client/hooks/use-watchlist";
import { SimpleAnimation } from "@/components/simple-animation";
import { ApiImage } from "@/components/ui/api-image";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { getMetadataBackdrop } from "@/utils/metadata-utils";

export function WatchlistHero({ featuredItem }: { featuredItem: WatchlistItem }) {
	return (
		<SimpleAnimation direction="none" duration={300}>
			<section className="relative mx-auto mb-12 h-[min(34rem,46vh)] w-[calc(100%-2rem)] overflow-hidden rounded-xl border border-border sm:w-[calc(100%-3rem)] sm:rounded-2xl">
				<ApiImage
					fileId={getMetadataBackdrop(featuredItem)?.id}
					cacheKey={getMetadataBackdrop(featuredItem)?.updatedAt}
					alt=""
					fill
					priority
					className="object-cover opacity-50"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />

				<div className="cinema-shell relative flex h-full flex-col justify-end pb-12">
					<p className="cinema-kicker">
						<Flame className="size-4" aria-hidden="true" /> {m.web_watchlist_hero_kicker()}
					</p>
					<h1 className="cinema-title mt-4 max-w-4xl">{featuredItem.title}</h1>
					<div className="mt-6 flex gap-4">
						<Button
							nativeButton={false}
							render={<Link to="/details/$id" params={{ id: featuredItem.id }} />}
							className="h-11 gap-3 px-6 font-bold"
						>
							<Play className="size-4 fill-current" data-icon="inline-start" aria-hidden="true" />
							{m.plugins_bug_reports_view_details()}
						</Button>
					</div>
				</div>
			</section>
		</SimpleAnimation>
	);
}
