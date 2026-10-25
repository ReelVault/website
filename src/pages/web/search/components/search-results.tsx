import type { GlobalSearchResponse } from "@reelvault/sdk";
import type { LucideIcon } from "lucide-react";
import { Compass, Film, Layers, User } from "lucide-react";
import type { ReactNode } from "react";
import { m } from "@/paraglide/messages";
import { CollectionSearchCard, GenreSearchCard, PersonSearchCard, type SearchResultItem, TitleSearchCard } from "./search-result-cards";

function SearchSection({ icon: Icon, title, count, children }: { icon: LucideIcon; title: string; count: number; children: ReactNode }) {
	return (
		<section className="scroll-mt-24">
			<header className="flex items-end justify-between gap-4">
				<div className="cinema-section-heading">
					<h2 className="flex items-center gap-2">
						<Icon aria-hidden="true" className="text-primary size-5" />
						{title}
					</h2>
				</div>
				<span className="text-muted-foreground font-mono text-xs tabular-nums">{count.toString().padStart(2, "0")}</span>
			</header>
			<div className="mt-6">{children}</div>
		</section>
	);
}

export function SearchResults({ results }: { results: GlobalSearchResponse }) {
	const titles: SearchResultItem[] = results.titles.map((item) => ({
		id: item.id,
		title: item.title,
		type: item.type,
		imageId: item.imageId ?? null,
		imageUpdatedAt: item.imageUpdatedAt ?? null,
	}));
	const people: SearchResultItem[] = results.people.map((item) => ({
		id: item.id,
		title: item.name,
		type: undefined,
		imageId: item.imageId ?? null,
		imageUpdatedAt: item.imageUpdatedAt ?? null,
	}));
	const collections: SearchResultItem[] = results.collections.map((item) => ({
		id: item.id,
		title: item.name,
		type: undefined,
		imageId: item.imageId ?? null,
		imageUpdatedAt: item.imageUpdatedAt ?? null,
	}));
	const genres: SearchResultItem[] = results.genres.map((item) => ({
		id: item.id,
		title: item.name,
		type: undefined,
		imageId: null,
		imageUpdatedAt: null,
	}));

	return (
		<div className="flex flex-col gap-12">
			{titles.length > 0 && (
				<SearchSection icon={Film} title={m.components_search_titles_heading()} count={titles.length}>
					<div className="poster-shelf">
						{titles.map((item) => (
							<TitleSearchCard key={item.id} item={item} />
						))}
					</div>
				</SearchSection>
			)}

			{people.length > 0 && (
				<SearchSection icon={User} title={m.components_search_people_heading()} count={people.length}>
					<div className="grid grid-cols-3 gap-x-3 gap-y-8 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
						{people.map((item) => (
							<PersonSearchCard key={item.id} item={item} />
						))}
					</div>
				</SearchSection>
			)}

			{collections.length > 0 && (
				<SearchSection icon={Layers} title={m.components_search_collections_heading()} count={collections.length}>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
						{collections.map((item) => (
							<CollectionSearchCard key={item.id} item={item} />
						))}
					</div>
				</SearchSection>
			)}

			{genres.length > 0 && (
				<SearchSection icon={Compass} title={m.components_search_genres_heading()} count={genres.length}>
					<div className="flex flex-wrap gap-2">
						{genres.map((item) => (
							<GenreSearchCard key={item.id} item={item} />
						))}
					</div>
				</SearchSection>
			)}
		</div>
	);
}
