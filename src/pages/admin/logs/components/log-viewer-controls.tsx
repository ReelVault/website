import { Code, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdminSearch } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

interface LogViewerControlsProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	viewMode: "formatted" | "raw";
	onViewModeChange: (mode: "formatted" | "raw") => void;
	selectedLevel: string;
	onLevelChange: (level: string) => void;
}

export function LogViewerControls({
	searchQuery,
	onSearchChange,
	viewMode,
	onViewModeChange,
	selectedLevel,
	onLevelChange,
}: LogViewerControlsProps) {
	const handleViewModeChange = (value: string[]) => {
		const mode = value[0];
		if (mode === "formatted" || mode === "raw") onViewModeChange(mode);
	};

	const handleLevelChange = (value: string[]) => {
		if (value[0]) onLevelChange(value[0]);
	};

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<AdminSearch value={searchQuery} onChange={onSearchChange} placeholder={m.admin_logs_search_content()} className="sm:max-w-xs" />
			<div className="flex flex-wrap items-center gap-2">
				<ToggleGroup multiple={false} value={[viewMode]} onValueChange={handleViewModeChange} variant="outline" size="sm">
					<ToggleGroupItem value="formatted" className="gap-1 px-2.5 text-xs">
						<List className="size-3.5" />
						{m.media_format()}
					</ToggleGroupItem>
					<ToggleGroupItem value="raw" className="gap-1 px-2.5 text-xs">
						<Code className="size-3.5" />
						{m.admin_logs_raw_view()}
					</ToggleGroupItem>
				</ToggleGroup>

				<ToggleGroup
					multiple={false}
					value={[selectedLevel]}
					onValueChange={handleLevelChange}
					variant="outline"
					size="sm"
					className="flex-wrap"
				>
					{["all", "error", "warn", "info", "debug"].map((level) => (
						<ToggleGroupItem key={level} value={level} className="text-xs uppercase">
							{level}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</div>
		</div>
	);
}
