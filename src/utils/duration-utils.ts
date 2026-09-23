export function formatDuration(seconds: number | null | undefined): string {
	if (!seconds) return "—";

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (hours > 0) return `${hours}h ${minutes}m`;

	return `${minutes}m`;
}

export function formatDurationPrecise(ms: number): string {
	const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor((totalSeconds % 86400) / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (days > 0) {
		return `${days}d ${hours}h ${minutes}m`;
	}

	if (hours > 0) {
		return `${hours}h ${minutes}m ${seconds.toString().padStart(2, "0")}s`;
	}

	if (minutes > 0) {
		return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
	}

	return `${seconds}s`;
}
