import { m } from "@/paraglide/messages";
import { copyEntityLink, copyToClipboard } from "@/utils/clipboard-utils";
import { formatDuration } from "@/utils/duration-utils";

export function getProgressPercent(position?: number, duration?: number): number {
	return duration ? Math.round(((position ?? 0) / duration) * 100) : 0;
}

export function getVersionTitle(file: { edition?: string | null; qualityTag?: string | null; fileName?: string }, index?: number): string {
	if (file.edition?.trim()) return file.edition.trim();

	if (file.qualityTag?.trim()) return m.web_episode_version_version({ qualityTag: file.qualityTag.trim() });

	if (index !== undefined) return m.web_episode_release_number({ number: index + 1 });

	return file.fileName ?? m.player_version_word();
}

export function getVersionSubtitle(file: {
	qualityTag?: string | null;
	source?: string | null;
	duration?: number | null;
	formatName?: string | null;
}): string {
	return [file.qualityTag, file.source, file.formatName, file.duration ? formatDuration(file.duration) : null].filter(Boolean).join(" • ");
}

export const handleCopyEpisodeLink = async (mediaFileId?: string) => {
	if (mediaFileId) {
		await copyEntityLink(`/player/${mediaFileId}`, m.web_episode_link_word());

		return;
	}

	await copyToClipboard(window.location.href, m.web_episode_link_word());
};

export const handleCopyId = async (id: string) => {
	await copyToClipboard(id, m.web_copy_episode_id());
};

export type EpisodeVersionFile = Parameters<typeof getVersionTitle>[0] &
	Parameters<typeof getVersionSubtitle>[0] & { id: string; isDefault?: boolean };
