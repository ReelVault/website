import { Search } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { AsyncButton } from "@/components/async-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { m } from "@/paraglide/messages";

export interface TmdbSearchParams {
	title: string;
	year?: number;
	seasonNumber?: number;
	episodeNumber?: number;
}

interface ReassignTmdbSearchFormProps {
	initialTitle: string;
	initialYear?: number;
	mediaType: "movie" | "tv_show";
	isSearching: boolean;
	onSearch: (params: TmdbSearchParams) => void;
}

export function ReassignTmdbSearchForm({ initialTitle, initialYear, mediaType, isSearching, onSearch }: ReassignTmdbSearchFormProps) {
	const [tmdbTitle, setTmdbTitle] = useState(initialTitle);
	const [tmdbYear, setTmdbYear] = useState<string>(initialYear ? String(initialYear) : "");
	const [tmdbSeasonNumber, setTmdbSeasonNumber] = useState<string>("1");
	const [tmdbEpisodeNumber, setTmdbEpisodeNumber] = useState<string>("1");

	const handleSubmit = (e?: React.SyntheticEvent<HTMLFormElement>) => {
		e?.preventDefault();
		const trimmedTitle = tmdbTitle.trim();
		if (!trimmedTitle) return;

		const yearNum = tmdbYear.trim() ? Number(tmdbYear.trim()) : undefined;
		const seasonNum = mediaType === "tv_show" ? Number(tmdbSeasonNumber || 1) : undefined;
		const episodeNum = mediaType === "tv_show" ? Number(tmdbEpisodeNumber || 1) : undefined;

		onSearch({
			title: trimmedTitle,
			year: yearNum,
			seasonNumber: seasonNum,
			episodeNumber: episodeNum,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<div className="grid gap-3 sm:grid-cols-4">
				<div className="space-y-1.5 sm:col-span-2">
					<Label htmlFor="tmdb-title">{m.components_reassign_tmdb_title_label()}</Label>
					<Input
						id="tmdb-title"
						value={tmdbTitle}
						onChange={(e) => setTmdbTitle(e.target.value)}
						placeholder={m.components_provider_search_placeholder()}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="tmdb-year">{m.common_release_year()}</Label>
					<Input
						id="tmdb-year"
						type="number"
						value={tmdbYear}
						onChange={(e) => setTmdbYear(e.target.value)}
						placeholder={m.components_year_placeholder()}
					/>
				</div>
				<div className="flex items-end">
					<AsyncButton type="submit" isPending={isSearching} pendingLabel={m.common_searching()} className="w-full gap-2">
						<Search className="size-4" />
						{m.common_search()}
					</AsyncButton>
				</div>
			</div>

			{mediaType === "tv_show" && (
				<div className="grid grid-cols-2 gap-3 rounded-lg border border-border/80 bg-muted/20 p-3">
					<div className="space-y-1.5">
						<Label htmlFor="tmdb-season">{m.common_episode_number()}</Label>
						<Input
							id="tmdb-season"
							type="number"
							min={0}
							value={tmdbSeasonNumber}
							onChange={(e) => setTmdbSeasonNumber(e.target.value)}
							placeholder="1"
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="tmdb-episode">{m.common_episode_number()}</Label>
						<Input
							id="tmdb-episode"
							type="number"
							min={1}
							value={tmdbEpisodeNumber}
							onChange={(e) => setTmdbEpisodeNumber(e.target.value)}
							placeholder="1"
						/>
					</div>
				</div>
			)}
		</form>
	);
}
