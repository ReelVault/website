import { m } from "@/paraglide/messages";
import { formatNumber, getDateTimeFormatter } from "@/utils/format-utils";

export const logTimeFormatter = {
	format(date?: Date | number): string {
		return getDateTimeFormatter({ hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date);
	},
};

export const auditDateFormatter = {
	format(date?: Date | number): string {
		return getDateTimeFormatter({ dateStyle: "short", timeStyle: "short" }).format(date);
	},
};

export function formatUptime(seconds: number) {
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (days > 0) return `${days}d ${hours}h ${minutes}m`;

	if (hours > 0) return `${hours} ${m.common_hours_short()} ${minutes} min`;

	return `${minutes} min`;
}

export function formatMemory(bytes: number) {
	if (bytes < 1024 * 1024) return `${formatNumber(bytes / 1024, { maximumFractionDigits: 1 })} KB`;

	if (bytes < 1024 * 1024 * 1024) return `${formatNumber(bytes / (1024 * 1024), { maximumFractionDigits: 1 })} MB`;

	return `${formatNumber(bytes / (1024 * 1024 * 1024), { maximumFractionDigits: 1 })} GB`;
}
