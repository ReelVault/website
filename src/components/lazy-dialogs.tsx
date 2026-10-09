import { lazy } from "react";

export const LazyReassignMediaFileDialog = lazy(async () => {
	const mod = await import("@/components/reassign-media-file-dialog");

	return { default: mod.ReassignMediaFileDialog };
});

export const LazyIdentifyDialog = lazy(async () => {
	const mod = await import("@/components/identify-dialog");

	return { default: mod.IdentifyDialog };
});

export const LazySeasonDownloadDialog = lazy(async () => {
	const mod = await import("@/components/season-download-dialog");

	return { default: mod.SeasonDownloadDialog };
});

export const LazyOfflineDownloadDialog = lazy(async () => {
	const mod = await import("@/components/offline-download-dialog");

	return { default: mod.OfflineDownloadDialog };
});
