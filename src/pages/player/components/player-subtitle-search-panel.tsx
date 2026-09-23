import { Download, Loader2 } from "lucide-react";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { m } from "@/paraglide/messages";
import { usePlayerSubtitles } from "../player-context";

export function PlayerSubtitleSearchPanel() {
	const {
		subtitleLanguage,
		setSubtitleLanguage,
		subtitleCandidates,
		downloadingCandidateId,
		isSearchingSubtitles,
		isSearchError,
		isDownloadingSubtitle,
		isDownloadError,
		searchSubtitles,
		downloadSubtitle,
	} = usePlayerSubtitles();

	return (
		<div className="flex flex-col gap-3">
			<div className="flex gap-2">
				<label className="sr-only" htmlFor="subtitle-language">
					{m.admin_users_subtitle_language()}
				</label>
				<InputGroup className="h-9 min-w-0 flex-1">
					<InputGroupInput
						id="subtitle-language"
						name="subtitle-language"
						autoComplete="off"
						spellCheck={false}
						type="text"
						value={subtitleLanguage}
						onChange={(event) => setSubtitleLanguage(event.target.value)}
						onKeyDown={(event) => {
							event.stopPropagation();
							if (event.key === "Enter" && subtitleLanguage.trim().length >= 2 && !isSearchingSubtitles) {
								event.preventDefault();
								searchSubtitles();
							}
						}}
						maxLength={16}
						placeholder={m.player_subtitle_search_placeholder()}
					/>
				</InputGroup>
				<AsyncButton
					type="button"
					size="sm"
					disabled={subtitleLanguage.trim().length < 2}
					isPending={isSearchingSubtitles}
					pendingLabel={m.player_searching_dots()}
					onClick={searchSubtitles}
				>
					{m.common_search()}
				</AsyncButton>
			</div>
			{isSearchError && <p className="text-destructive text-xs">{m.player_subtitle_search_failed()}</p>}
			{subtitleCandidates?.length === 0 && <p className="text-muted-foreground text-xs">{m.player_no_results_for_language()}</p>}
			<div className="flex max-h-52 flex-col gap-2 overflow-y-auto">
				{subtitleCandidates?.map((candidate) => {
					const candidateKey = `${candidate.providerId}:${candidate.id}`;
					const isThisDownloading = downloadingCandidateId === candidateKey;

					return (
						<div key={candidateKey} className="flex items-center justify-between gap-3 rounded-md bg-muted p-2">
							<span className="min-w-0 truncate text-xs">
								{m.player_subtitle_candidate_meta({ label: candidate.label ?? candidate.language, format: candidate.format })}
							</span>
							<Button
								type="button"
								variant="ghost"
								size="icon-lg"
								className="size-11 shrink-0 text-primary"
								disabled={isDownloadingSubtitle}
								onClick={() => downloadSubtitle(candidate.providerId, candidate.id)}
								aria-label={m.player_subtitles_label({ label: candidate.label ?? candidate.language })}
							>
								{isThisDownloading ? (
									<Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
								) : (
									<Download aria-hidden="true" />
								)}
							</Button>
						</div>
					);
				})}
			</div>
			{isDownloadError && <p className="text-destructive text-xs">{m.player_subtitles_download_failed_short()}</p>}
		</div>
	);
}
