import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import type { FormState } from "./media-file-form";

interface MediaFileParamsSectionProps {
	form: FormState;
	onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
}

export function MediaFileParamsSection({ form, onChange }: MediaFileParamsSectionProps) {
	return (
		<AdminSection title={m.admin_media_edition_params_section()} description={m.admin_media_release_version_description()}>
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="mb-2 flex flex-col gap-3 sm:col-span-2">
					<div className="border-border bg-muted/40 flex items-center justify-between gap-4 rounded-xl border p-3.5">
						<div className="flex flex-col gap-0.5">
							<Label weight="semibold" htmlFor="media-is-enabled" className="cursor-pointer">
								{m.admin_media_enabled_active()}
							</Label>
							<p className="text-muted-foreground text-xs">{m.admin_media_disable_blocks_playback()}</p>
						</div>
						<Switch id="media-is-enabled" checked={form.isEnabled} onCheckedChange={(checked) => onChange("isEnabled", checked)} />
					</div>

					<div className="border-border bg-muted/40 flex items-center justify-between gap-4 rounded-xl border p-3.5">
						<div className="flex flex-col gap-0.5">
							<Label weight="semibold" htmlFor="media-is-default" className="cursor-pointer">
								{m.admin_media_default_playback()}
							</Label>
							<p className="text-muted-foreground text-xs">{m.admin_media_auto_selected_notice()}</p>
						</div>
						<Switch id="media-is-default" checked={form.isDefault} onCheckedChange={(checked) => onChange("isDefault", checked)} />
					</div>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="media-edition">{m.media_edition_label()}</Label>
					<Input
						id="media-edition"
						name="edition"
						autoComplete="off"
						value={form.edition}
						onChange={(e) => onChange("edition", e.target.value)}
						placeholder={m.admin_media_edition_examples()}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="media-quality">{m.admin_media_quality_tag()}</Label>
					<Input
						id="media-quality"
						name="qualityTag"
						autoComplete="off"
						value={form.qualityTag}
						onChange={(e) => onChange("qualityTag", e.target.value)}
						placeholder={m.admin_media_quality_placeholder()}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="media-source">{m.admin_media_source_label()}</Label>
					<Input
						id="media-source"
						name="source"
						autoComplete="off"
						value={form.source}
						onChange={(e) => onChange("source", e.target.value)}
						placeholder={m.admin_media_source_placeholder()}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between">
						<Label htmlFor="media-format">{m.media_container_format()}</Label>
						<span className="text-muted-foreground text-xs">{m.admin_media_format_auto_label()}</span>
					</div>
					<Input
						id="media-format"
						name="formatName"
						autoComplete="off"
						disabled
						readOnly
						value={form.formatName || "—"}
						className="cursor-not-allowed"
					/>
				</div>
			</div>
		</AdminSection>
	);
}
