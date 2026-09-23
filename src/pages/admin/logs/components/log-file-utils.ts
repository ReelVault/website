import { Play, Server, Video } from "lucide-react";
import { getLocaleTag } from "@/utils/format-utils";

export function formatLogDate(dateString: string): string {
	try {
		const date = new Date(dateString);

		return date.toLocaleString(getLocaleTag(), {
			month: "numeric",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	} catch {
		return dateString;
	}
}

export function isFfmpegLog(file: { id: string; name: string; type: string }) {
	const t = file.type.toLowerCase();
	const id = file.id.toLowerCase();
	const name = file.name.toLowerCase();

	return (
		t.startsWith("ffmpeg") ||
		id.includes("ffmpeg") ||
		name.includes("ffmpeg") ||
		name.includes("transcode") ||
		name.includes("directstream")
	);
}

export function isServerLog(file: { id: string; name: string; type: string }) {
	return file.type === "server" || !isFfmpegLog(file);
}

export function getLogIcon(file: { id: string; name: string; type: string }) {
	if (file.type === "ffmpeg-transcode" || file.name.includes("Transcode")) return Video;

	if (file.type === "ffmpeg-directstream" || file.name.includes("DirectStream")) return Play;

	if (isFfmpegLog(file)) return Video;

	return Server;
}
