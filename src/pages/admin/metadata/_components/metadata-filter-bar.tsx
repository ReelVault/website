import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdminSearch } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

export type MediaFilter = "all" | "low_confidence" | "with_media" | "without_media" | "missing_translation";

function isValidMediaFilter(val: unknown): val is MediaFilter {
	return val === "all" || val === "low_confidence" || val === "with_media" || val === "without_media" || val === "missing_translation";
}

interface MetadataFilterBarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	mediaFilter: MediaFilter;
	onFilterChange: (value: MediaFilter) => void;
}

export function MetadataFilterBar({ searchQuery, onSearchChange, mediaFilter, onFilterChange }: MetadataFilterBarProps) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<AdminSearch
				value={searchQuery}
				onChange={onSearchChange}
				placeholder={m.admin_metadata_filter_placeholder()}
				className="w-full sm:max-w-xs"
			/>

			<div className="flex items-center gap-2">
				<span className="text-muted-foreground text-xs">{m.admin_metadata_filter_label()}</span>
				<ToggleGroup
					multiple={false}
					value={[mediaFilter]}
					onValueChange={(val) => {
						const first = val[0];
						if (isValidMediaFilter(first)) {
							onFilterChange(first);
						}
					}}
					variant="outline"
					size="sm"
					className="flex-wrap"
				>
					<ToggleGroupItem value="all" className="text-xs">
						{m.common_all()}
					</ToggleGroupItem>
					<ToggleGroupItem value="low_confidence" className="gap-1 text-xs">
						<AlertTriangle className="size-3 text-warning" />
						{m.admin_metadata_low_recognition()}
					</ToggleGroupItem>
					<ToggleGroupItem value="missing_translation" className="gap-1 text-xs">
						<AlertTriangle className="size-3 text-orange-400" />
						{m.admin_metadata_fallback_chip()}
					</ToggleGroupItem>
					<ToggleGroupItem value="with_media" className="gap-1 text-xs">
						<CheckCircle2 className="size-3 text-success" />
						{m.admin_metadata_with_files_chip()}
					</ToggleGroupItem>
					<ToggleGroupItem value="without_media" className="gap-1 text-xs">
						<AlertTriangle className="size-3 text-destructive" />
						{m.admin_metadata_orphan_chip()}
					</ToggleGroupItem>
				</ToggleGroup>
			</div>
		</div>
	);
}
