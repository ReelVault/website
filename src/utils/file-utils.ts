import { formatNumber } from "@/utils/format-utils";

const FILE_SIZES = ["Bytes", "KB", "MB", "GB", "TB"] as const;
const LOG_1024 = Math.log(1024);

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const i = Math.min(Math.floor(Math.log(bytes) / LOG_1024), FILE_SIZES.length - 1);
	const unit = FILE_SIZES[i] ?? "Bytes";

	return `${formatNumber(bytes / 1024 ** i, { maximumFractionDigits: 2 })} ${unit}`;
}
