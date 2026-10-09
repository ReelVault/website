import type React from "react";
import { useId, useState } from "react";
import { useUploadSubtitle } from "@/client/hooks/use-admin-subtitles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { m } from "@/paraglide/messages";

/** Stores an SRT, WebVTT or ASS file as a subtitle track of this media file; the form closes once the track is saved. */
export function MediaFileSubtitleUploadForm({ mediaFileId, onUploaded }: { mediaFileId: string; onUploaded: () => void }) {
	const [language, setLanguage] = useState("");
	const [label, setLabel] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const languageId = useId();
	const labelId = useId();
	const uploadSubtitle = useUploadSubtitle(mediaFileId);
	const canSubmit = file !== null && language.trim().length >= 2 && !uploadSubtitle.isPending;

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!(file && canSubmit)) return;

		uploadSubtitle.mutate({ language: language.trim(), label: label.trim() || undefined, file }, { onSuccess: onUploaded });
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border/80 bg-background/60 p-3">
			<div className="grid gap-3 sm:grid-cols-2">
				<label htmlFor={languageId} className="flex flex-col gap-1.5 text-xs">
					<span className="text-muted-foreground">{m.admin_media_upload_subtitle_language()}</span>
					<Input id={languageId} value={language} maxLength={16} required onChange={(event) => setLanguage(event.currentTarget.value)} />
				</label>
				<label htmlFor={labelId} className="flex flex-col gap-1.5 text-xs">
					<span className="text-muted-foreground">{m.admin_media_upload_subtitle_label()}</span>
					<Input id={labelId} value={label} maxLength={100} onChange={(event) => setLabel(event.currentTarget.value)} />
				</label>
			</div>
			<label className="flex flex-col gap-1.5 text-xs">
				<span className="text-muted-foreground">{m.admin_media_upload_subtitle_file()}</span>
				<input
					type="file"
					accept=".srt,.vtt,.ass"
					className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-foreground"
					onChange={(event) => setFile(event.currentTarget.files?.[0] ?? null)}
				/>
			</label>
			<div className="flex justify-end">
				<Button type="submit" size="sm" disabled={!canSubmit}>
					{m.admin_media_upload_subtitle_submit()}
				</Button>
			</div>
		</form>
	);
}
