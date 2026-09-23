import { useEffect, useState } from "react";
import { getReelVaultApiUrl } from "@/client/client";
import { useAdminLogFiles, useAdminLogs } from "@/client/hooks/use-admin-logs";
import { useDebounce } from "@/hooks/use-debounce";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { isFfmpegLog, isServerLog } from "../components/log-file-utils";

export function useLogsPageController() {
	const [selectedFileId, setSelectedFileId] = useState<string>("");
	const [selectedLevel, setSelectedLevel] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [fileTypeFilter, setFileTypeFilter] = useState("all");
	const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");
	const [isFullscreen, setIsFullscreen] = useState(false);
	const { hasCopied, copy } = useCopyToClipboard();
	const [autoRefresh, setAutoRefresh] = useState(true);
	const [page, setPage] = useState(1);

	const debouncedSearch = useDebounce({ value: searchQuery, delay: 350 });

	const {
		files,
		isLoading: isLoadingFiles,
		refetch: refetchFiles,
		deleteLogFile,
		isDeleting,
		cleanupLogs,
		isCleaningUp,
	} = useAdminLogFiles();

	const filteredFiles =
		fileTypeFilter === "all"
			? files
			: files.filter((file) => {
					if (fileTypeFilter === "server") return isServerLog(file);

					if (fileTypeFilter === "ffmpeg") return isFfmpegLog(file);

					return true;
				});

	const activeFile = filteredFiles.find((f) => f.id === selectedFileId) ?? filteredFiles[0] ?? files[0];
	const effectiveFileId = activeFile ? activeFile.id : "";

	const { logs, pagination, isLoading, isFetching, error, refetch } = useAdminLogs(
		{
			fileId: effectiveFileId,
			level: selectedLevel,
			search: debouncedSearch,
			page,
			limit: viewMode === "raw" ? 100 : 50,
		},
		autoRefresh && !isFullscreen,
	);

	const handleDownload = () => {
		const apiUrl = getReelVaultApiUrl();
		const url = effectiveFileId
			? `${apiUrl}/v1/admin/logs/download?fileId=${encodeURIComponent(effectiveFileId)}`
			: `${apiUrl}/v1/admin/logs/download`;
		window.open(url, "_blank", "noopener,noreferrer");
	};

	const handleDeleteFile = async (fileId: string) => {
		try {
			await deleteLogFile(fileId);
			if (selectedFileId === fileId) {
				const remaining = filteredFiles.find((f) => f.id !== fileId);
				setSelectedFileId(remaining?.id ?? "");
			}
		} catch (err) {
			console.error("Failed to delete log file", err);
		}
	};

	const handleCopyRaw = async () => {
		const text = logs.map((l) => (typeof l.msg === "string" ? l.msg : JSON.stringify(l))).join("\n");
		await copy(text, "logi");
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isFullscreen) {
				setIsFullscreen(false);
			}
		};
		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isFullscreen]);

	const handleFilterChange = (nextFilter: string) => {
		setFileTypeFilter(nextFilter);
		const matching = files.filter((f) => {
			if (nextFilter === "server") return isServerLog(f);

			if (nextFilter === "ffmpeg") return isFfmpegLog(f);

			return true;
		});
		const firstMatching = matching[0];
		if (firstMatching && !matching.some((f) => f.id === selectedFileId)) {
			setSelectedFileId(firstMatching.id);
			setPage(1);
		}
	};

	return {
		selectedFileId,
		setSelectedFileId,
		selectedLevel,
		setSelectedLevel,
		searchQuery,
		setSearchQuery,
		fileTypeFilter,
		handleFilterChange,
		viewMode,
		setViewMode,
		isFullscreen,
		setIsFullscreen,
		hasCopied,
		autoRefresh,
		setAutoRefresh,
		page,
		setPage,
		files,
		filteredFiles,
		activeFile,
		effectiveFileId,
		isLoadingFiles,
		refetchFiles,
		isDeleting,
		cleanupLogs,
		isCleaningUp,
		logs,
		pagination,
		isLoading,
		isFetching,
		error,
		refetch,
		handleDownload,
		handleDeleteFile,
		handleCopyRaw,
	};
}
