import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useAdminMediaFile, useAdminRefreshMediaFile, useAdminUpdateMediaFile } from "@/client/hooks/use-admin-media";
import { AppErrorState } from "@/components/app-states";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { type FormState, MediaFileForm } from "./_components/media-file-form";
import { MediaFileHeader } from "./_components/media-file-header";
import { MediaFileSidebar } from "./_components/media-file-sidebar";

const emptyForm: FormState = {
	edition: "",
	qualityTag: "",
	source: "",
	fileName: "",
	filePath: "",
	formatName: "",
	duration: "",
	size: "",
	bitRate: "",
	isEnabled: true,
	isDefault: false,
};

export default function MediaFileEditor() {
	const { id: mediaFileId } = useParams({ from: "/admin/media/$id" });
	const [form, setForm] = useState<FormState>(emptyForm);

	const mediaQuery = useAdminMediaFile(mediaFileId);
	const { updateMediaFile, isUpdating } = useAdminUpdateMediaFile();
	const { refreshMediaFile, isRefreshing, refreshStatus } = useAdminRefreshMediaFile();

	const mediaFile = mediaQuery.data;
	const [syncedMediaFile, setSyncedMediaFile] = useState<typeof mediaFile>();
	if (mediaFile !== syncedMediaFile) {
		setSyncedMediaFile(mediaFile);
		if (mediaFile) {
			setForm({
				edition: mediaFile.edition ?? "",
				qualityTag: mediaFile.qualityTag ?? "",
				source: mediaFile.source ?? "",
				fileName: mediaFile.fileName,
				filePath: mediaFile.filePath,
				formatName: mediaFile.formatName ?? "",
				duration: mediaFile.duration?.toString() ?? "",
				size: mediaFile.size?.toString() ?? "",
				bitRate: mediaFile.bitRate?.toString() ?? "",
				isEnabled: mediaFile.isEnabled,
				isDefault: mediaFile.isDefault,
			});
		}
	}

	if (!mediaFileId) return <AppErrorState title={m.admin_media_no_identifier_back_to_list()} />;

	if (mediaQuery.isLoading) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-9 w-64" />
					</div>
					<div className="flex gap-2">
						<Skeleton className="h-9 w-28" />
						<Skeleton className="h-9 w-28" />
					</div>
				</div>
				<Skeleton className="h-40 w-full" />
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					<Skeleton className="h-96 w-full lg:col-span-2" />
					<Skeleton className="h-96 w-full" />
				</div>
			</div>
		);
	}

	if (mediaQuery.isError || !mediaQuery.data) {
		return <AppErrorState title={m.admin_media_failed_to_fetch_info()} error={mediaQuery.error} />;
	}

	const file = mediaQuery.data;
	const set = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((current) => ({ ...current, [field]: value }));

	const save = () => {
		detach(
			updateMediaFile({
				mediaFileId,
				body: {
					edition: form.edition.trim() || null,
					qualityTag: form.qualityTag.trim() || null,
					source: form.source.trim() || null,
					isEnabled: form.isEnabled,
					isDefault: form.isDefault,
				},
			}),
		);
	};

	return (
		<div className="flex flex-col gap-6">
			<MediaFileHeader
				file={file}
				mediaFileId={mediaFileId}
				isRefreshing={isRefreshing}
				isUpdating={isUpdating}
				refreshStatus={refreshStatus}
				onRefresh={() => detach(refreshMediaFile(mediaFileId))}
				onSave={save}
			/>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<MediaFileForm form={form} file={file} onChange={set} />
				<MediaFileSidebar file={file} />
			</div>
		</div>
	);
}
