/** Parses a WebVTT/SRT timestamp ("HH:MM:SS.mmm" or "MM:SS,mmm") into seconds; null when it is not one. */
export function parseVttTimestamp(timestamp: string): number | null {
	const clean = timestamp.trim().replace(",", ".");
	const parts = clean.split(":");
	if (parts.length === 3) {
		const hours = Number.parseFloat(parts[0] ?? "0");
		const minutes = Number.parseFloat(parts[1] ?? "0");
		const seconds = Number.parseFloat(parts[2] ?? "0");
		if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) return null;

		return hours * 3600 + minutes * 60 + seconds;
	}

	if (parts.length === 2) {
		const minutes = Number.parseFloat(parts[0] ?? "0");
		const seconds = Number.parseFloat(parts[1] ?? "0");
		if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;

		return minutes * 60 + seconds;
	}

	return null;
}
