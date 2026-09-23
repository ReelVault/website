import { Textarea } from "@/components/ui/textarea";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { MetadataLockToggle } from "./metadata-lock-toggle";

export function MetadataOverviewSection({
	overview,
	onChange,
	isLocked,
	onToggleLock,
}: {
	overview: string;
	onChange: (value: string) => void;
	isLocked: boolean;
	onToggleLock: (field: string) => void;
}) {
	return (
		<AdminSection
			title={m.admin_metadata_plot_description()}
			description={m.admin_metadata_plot_full_description()}
			actions={
				<MetadataLockToggle field="overview" label={m.admin_metadata_plot_description()} isLocked={isLocked} onToggle={onToggleLock} />
			}
		>
			<Textarea
				id="metadata-overview"
				name="overview"
				autoComplete="off"
				value={overview}
				onChange={(e) => onChange(e.target.value)}
				rows={7}
				placeholder={m.admin_metadata_paste_plot_hint()}
				className="resize-y bg-background p-3.5 text-sm leading-relaxed"
			/>
		</AdminSection>
	);
}
