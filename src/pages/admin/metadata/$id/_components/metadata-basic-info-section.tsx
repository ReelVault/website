import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { MetadataFinancialsFields } from "./metadata-financials-fields";
import { MetadataLockToggle } from "./metadata-lock-toggle";
import { MetadataTitlesFields } from "./metadata-titles-fields";
import type { MetadataBasicFields, MetadataFormState } from "./types";

export function MetadataBasicInfoSection({
	basic,
	lockedFields,
	onChange,
	onToggleLock,
}: {
	basic: MetadataBasicFields;
	lockedFields: string[];
	onChange: (field: keyof MetadataFormState, value: string) => void;
	onToggleLock: (field: string) => void;
}) {
	const lockedSet = new Set(lockedFields);
	const isLocked = (field: string) => lockedSet.has(field);

	return (
		<AdminSection title={m.admin_metadata_basic_info_section()} description={m.admin_metadata_main_params_description()}>
			<div className="grid gap-4 sm:grid-cols-2">
				<MetadataTitlesFields basic={basic} isLocked={isLocked} onChange={onChange} onToggleLock={onToggleLock} />

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between">
						<Label htmlFor="metadata-release-date" className="font-medium text-sm">
							{m.admin_metadata_release_date_required()}
						</Label>
						<MetadataLockToggle
							field="releaseDate"
							label={m.admin_metadata_release_date_label()}
							isLocked={isLocked("releaseDate")}
							onToggle={onToggleLock}
						/>
					</div>
					<Input
						id="metadata-release-date"
						name="releaseDate"
						type="date"
						required
						value={basic.releaseDate}
						onChange={(e) => onChange("releaseDate", e.target.value)}
						className="h-10 bg-background px-3.5 text-sm"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between">
						<Label htmlFor="metadata-status" className="font-medium text-sm">
							{m.admin_metadata_production_status()}
						</Label>
						<MetadataLockToggle field="status" label={m.common_status()} isLocked={isLocked("status")} onToggle={onToggleLock} />
					</div>
					<Input
						id="metadata-status"
						name="status"
						autoComplete="off"
						value={basic.status}
						onChange={(e) => onChange("status", e.target.value)}
						placeholder={m.admin_metadata_status_placeholder()}
						className="h-10 bg-background px-3.5 text-sm"
					/>
				</div>

				<MetadataFinancialsFields
					budget={basic.budget}
					revenue={basic.revenue}
					isLocked={isLocked}
					onChange={onChange}
					onToggleLock={onToggleLock}
				/>
			</div>
		</AdminSection>
	);
}
