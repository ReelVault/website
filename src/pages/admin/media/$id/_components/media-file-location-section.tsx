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
						<Label htmlFor="media-file-name" className="font-medium text-sm">
							{m.admin_media_disk_file_name()}
						</Label>
						<span className="text-[11px] text-muted-foreground">{m.admin_media_auto_read()}</span>
					</div>
					<Input
						id="media-file-name"
						name="fileName"
						autoComplete="off"
						disabled
						readOnly
						value={fileName}
						className="h-10 cursor-not-allowed bg-muted/40 px-3.5 font-mono text-muted-foreground text-sm"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between">
						<Label htmlFor="media-file-path" className="font-medium text-sm">
							{m.admin_libraries_system_path()}
						</Label>
						<span className="text-[11px] text-muted-foreground">{m.admin_media_auto_read()}</span>
					</div>
					<Input
						id="media-file-path"
						name="filePath"
						autoComplete="off"
						disabled
						readOnly
						value={filePath}
						className="h-10 cursor-not-allowed bg-muted/40 px-3.5 font-mono text-muted-foreground text-sm"
					/>
				</div>
			</div>
		</AdminSection>
	);
}
