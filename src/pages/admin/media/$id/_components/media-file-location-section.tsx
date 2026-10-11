import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

interface MediaFileLocationSectionProps {
	fileName: string;
	filePath: string;
}

export function MediaFileLocationSection({ fileName, filePath }: MediaFileLocationSectionProps) {
	return (
		<AdminSection title={m.admin_media_location_section()} description={m.admin_media_name_and_path_description()}>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between">
						<Label htmlFor="media-file-name">{m.admin_media_disk_file_name()}</Label>
						<span className="text-muted-foreground text-xs">{m.admin_media_auto_read()}</span>
					</div>
					<Input
						id="media-file-name"
						name="fileName"
						autoComplete="off"
						disabled
						readOnly
						value={fileName}
						font="mono"
						className="cursor-not-allowed"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between">
						<Label htmlFor="media-file-path">{m.admin_libraries_system_path()}</Label>
						<span className="text-muted-foreground text-xs">{m.admin_media_auto_read()}</span>
					</div>
					<Input
						id="media-file-path"
						name="filePath"
						autoComplete="off"
						disabled
						readOnly
						value={filePath}
						font="mono"
						className="cursor-not-allowed"
					/>
				</div>
			</div>
		</AdminSection>
	);
}
