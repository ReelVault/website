import { Download } from "lucide-react";
import { useEffect, useRef } from "react";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { m } from "@/paraglide/messages";
import { usePlayerSubtitles } from "../player-context";

export function PlayerSubtitleSearchPanel() {
	const {
		subtitleLanguage,
		setSubtitleLanguage,
		preferredSubtitleLanguages,
		subtitleCandidates,
		downloadingCandidateId,
		isSearchingSubtitles,
		isSearchError,
		isDownloadingSubtitle,
		isDownloadError,
		searchSubtitles,
		downloadSubtitle,
	} = usePlayerSubtitles();

	// Search once when the panel opens with a usable language; later searches stay manual.
	const hasAutoSearchedRef = useRef(false);
	useEffect(() => {
		if (hasAutoSearchedRef.current || subtitleCandidates !== undefined || subtitleLanguage.trim().length < 2) return;

		hasAutoSearchedRef.current = true;
		searchSubtitles();
	}, [subtitleCandidates, subtitleLanguage, searchSubtitles]);

	return (
		<div className="flex flex-col gap-3">
			{preferredSubtitleLanguages.length > 0 && (
				<div className="flex flex-wrap gap-1.5">
					{preferredSubtitleLanguages.map((code) => (
						<Button
							key={code}
							type="button"
							size="sm"
							variant={code === subtitleLanguage.trim().toLowerCase() ? "default" : "outline"}
							onClick={() => setSubtitleLanguage(code)}
						>
							{code}
						</Button>
					))}
				</div>
			)}
			<div className="flex gap-2">
				<label className="sr-only" htmlFor="subtitle-language">
					{m.admin_users_subtitle_language()}
				</label>
				<InputGroup className="min-w-0 flex-1">
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
						<div key={candidateKey} className="bg-muted flex items-center justify-between gap-3 rounded-md p-2">
							<span className="min-w-0 truncate text-xs">
								{m.player_subtitle_candidate_meta({ label: candidate.label ?? candidate.language, format: candidate.format })}
							</span>
							<Button
								type="button"
								variant="primary-ghost"
								size="icon-lg"
								className="shrink-0"
								disabled={isDownloadingSubtitle}
								onClick={() => downloadSubtitle(candidate.providerId, candidate.id)}
								aria-label={m.player_subtitles_label({ label: candidate.label ?? candidate.language })}
							>
								{isThisDownloading ? <Spinner aria-hidden="true" /> : <Download aria-hidden="true" />}
							</Button>
						</div>
					);
				})}
			</div>
			{isDownloadError && <p className="text-destructive text-xs">{m.player_subtitles_download_failed_short()}</p>}
		</div>
	);
}
