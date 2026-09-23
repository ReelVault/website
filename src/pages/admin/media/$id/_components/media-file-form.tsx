import type { MediaFileWithRelation } from "reelvault-sdk";
import { MediaFileDiagnosticsSection } from "./media-file-diagnostics-section";
import { MediaFileLocationSection } from "./media-file-location-section";
import { MediaFileParamsSection } from "./media-file-params-section";

export interface FormState {
	edition: string;
	qualityTag: string;
	source: string;
	fileName: string;
	filePath: string;
	formatName: string;
	duration: string;
	size: string;
	bitRate: string;
	isEnabled: boolean;
	isDefault: boolean;
}

interface MediaFileFormProps {
	form: FormState;
	file?: MediaFileWithRelation;
	onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
}

export function MediaFileForm({ form, file, onChange }: MediaFileFormProps) {
	return (
		<div className="flex flex-col gap-6 lg:col-span-2">
			<MediaFileParamsSection form={form} onChange={onChange} />
			<MediaFileLocationSection fileName={form.fileName} filePath={form.filePath} />
			<MediaFileDiagnosticsSection duration={form.duration} size={form.size} bitRate={form.bitRate} file={file} />
		</div>
	);
}
