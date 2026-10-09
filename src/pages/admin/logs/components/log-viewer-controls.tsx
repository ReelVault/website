import { Code, List } from "lucide-react";
import { Input } from "@/components/ui/input";
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
	moduleFilter: string;
	onModuleChange: (value: string) => void;
	excludeQuery: string;
	onExcludeChange: (value: string) => void;
	fromDate: string;
	onFromChange: (value: string) => void;
	toDate: string;
	onToChange: (value: string) => void;
}

export function LogViewerControls({
	searchQuery,
	onSearchChange,
	viewMode,
	onViewModeChange,
	selectedLevel,
	onLevelChange,
	moduleFilter,
	onModuleChange,
	excludeQuery,
	onExcludeChange,
	fromDate,
	onFromChange,
	toDate,
	onToChange,
}: LogViewerControlsProps) {
	const handleViewModeChange = (value: string[]) => {
		const mode = value[0];
		if (mode === "formatted" || mode === "raw") onViewModeChange(mode);
	};

	const handleLevelChange = (value: string[]) => {
		if (value[0]) onLevelChange(value[0]);
	};

	return (
		<div className="flex flex-col gap-3">
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
			<div className="flex flex-wrap items-center gap-2">
				<Input
					value={moduleFilter}
					placeholder={m.admin_logs_filter_module()}
					aria-label={m.admin_logs_filter_module()}
					className="h-8 w-40 text-xs"
					onChange={(event) => onModuleChange(event.target.value)}
				/>
				<Input
					value={excludeQuery}
					placeholder={m.admin_logs_filter_exclude()}
					aria-label={m.admin_logs_filter_exclude()}
					className="h-8 w-48 text-xs"
					onChange={(event) => onExcludeChange(event.target.value)}
				/>
				<Input
					type="datetime-local"
					value={fromDate}
					aria-label={m.admin_logs_filter_from()}
					className="h-8 w-auto text-xs"
					onChange={(event) => onFromChange(event.target.value)}
				/>
				<Input
					type="datetime-local"
					value={toDate}
					aria-label={m.admin_logs_filter_to()}
					className="h-8 w-auto text-xs"
					onChange={(event) => onToChange(event.target.value)}
				/>
			</div>
		</div>
	);
}
