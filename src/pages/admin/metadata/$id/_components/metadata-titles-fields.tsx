import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { m } from "@/paraglide/messages";
import { MetadataLockToggle } from "./metadata-lock-toggle";
import type { MetadataBasicFields, MetadataFormState } from "./types";

interface MetadataTitlesFieldsProps {
	basic: MetadataBasicFields;
	isLocked: (field: string) => boolean;
	onChange: (field: keyof MetadataFormState, value: string) => void;
	onToggleLock: (field: string) => void;
}

export function MetadataTitlesFields({ basic, isLocked, onChange, onToggleLock }: MetadataTitlesFieldsProps) {
	return (
		<>
			<div className="flex flex-col gap-1.5 sm:col-span-2">
				<div className="flex items-center justify-between">
					<Label htmlFor="metadata-title" className="font-medium text-sm">
						{m.admin_metadata_title_required()}
					</Label>
					<MetadataLockToggle field="title" label={m.admin_analytics_title_column()} isLocked={isLocked("title")} onToggle={onToggleLock} />
				</div>
				<Input
					id="metadata-title"
					name="title"
					autoComplete="off"
					required
					value={basic.title}
					onChange={(e) => onChange("title", e.target.value)}
					placeholder={m.admin_metadata_title_in_polish()}
					className="h-10 bg-background px-3.5 text-sm"
				/>
			</div>

			<div className="flex flex-col gap-1.5 sm:col-span-2">
				<div className="flex items-center justify-between">
					<Label htmlFor="metadata-sort-title" className="font-medium text-sm">
						{m.admin_metadata_sort_title()}
					</Label>
					<MetadataLockToggle
						field="sortTitle"
						label={m.admin_metadata_sort_title()}
						isLocked={isLocked("sortTitle")}
						onToggle={onToggleLock}
					/>
				</div>
				<Input
					id="metadata-sort-title"
					name="sortTitle"
					autoComplete="off"
					value={basic.sortTitle}
					onChange={(e) => onChange("sortTitle", e.target.value)}
					placeholder={m.admin_metadata_sort_title_placeholder()}
					className="h-10 bg-background px-3.5 text-sm"
				/>
				<p className="text-muted-foreground text-xs">{m.admin_metadata_manual_sort_notice()}</p>
			</div>

			<div className="flex flex-col gap-1.5">
				<div className="flex items-center justify-between">
					<Label htmlFor="metadata-numbering" className="font-medium text-sm">
						{m.admin_metadata_episode_numbering()}
					</Label>
				</div>
				<Select
					value={basic.numberingMode || "seasonal"}
					onValueChange={(value) => onChange("numberingMode", value === "seasonal" || value === null ? "" : value)}
				>
					<SelectTrigger id="metadata-numbering" className="h-10 w-full bg-background">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="seasonal">{m.admin_metadata_seasonal_numbering()}</SelectItem>
						<SelectItem value="absolute">{m.admin_metadata_absolute_numbering()}</SelectItem>
					</SelectContent>
				</Select>
				<p className="text-muted-foreground text-xs">{m.admin_metadata_next_episode_impact()}</p>
			</div>

			<div className="flex flex-col gap-1.5">
				<div className="flex items-center justify-between">
					<Label htmlFor="metadata-orig-title" className="font-medium text-sm">
						{m.admin_metadata_original_title()}
					</Label>
					<MetadataLockToggle
						field="originalTitle"
						label={m.admin_metadata_original_title()}
						isLocked={isLocked("originalTitle")}
						onToggle={onToggleLock}
					/>
				</div>
				<Input
					id="metadata-orig-title"
					name="originalTitle"
					autoComplete="off"
					value={basic.originalTitle}
					onChange={(e) => onChange("originalTitle", e.target.value)}
					placeholder={m.admin_metadata_original_title_example()}
					className="h-10 bg-background px-3.5 text-sm"
				/>
			</div>

			<div className="flex flex-col gap-1.5 sm:col-span-2">
				<div className="flex items-center justify-between">
					<Label htmlFor="metadata-tagline" className="font-medium text-sm">
						{m.admin_metadata_tagline_label()}
					</Label>
					<MetadataLockToggle field="tagline" label="Tagline" isLocked={isLocked("tagline")} onToggle={onToggleLock} />
				</div>
				<Input
					id="metadata-tagline"
					name="tagline"
					autoComplete="off"
					value={basic.tagline}
					onChange={(e) => onChange("tagline", e.target.value)}
					placeholder={m.admin_metadata_promo_password_placeholder()}
					className="h-10 bg-background px-3.5 text-sm"
				/>
			</div>
		</>
	);
}
