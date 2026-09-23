import { AlertTriangle, ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { m } from "@/paraglide/messages";

interface MediaViewModeToggleProps {
	viewMode: "all" | "audit";
	onViewModeChange: (mode: "all" | "audit") => void;
	total: number;
	suspectCount: number;
}

export function MediaViewModeToggle({ viewMode, onViewModeChange, total, suspectCount }: MediaViewModeToggleProps) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-2 shadow-2xs">
			<ToggleGroup
				value={[viewMode]}
				onValueChange={(val) => {
					const next = val[0];
					if (next === "all" || next === "audit") {
						onViewModeChange(next);
					}
				}}
				className="justify-start gap-1"
			>
				<ToggleGroupItem
					value="all"
					className="gap-2 px-3 py-1.5 font-medium text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
				>
					<ListFilter className="size-3.5" />
					<span>{m.admin_media_all_files()}</span>
					<Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
						{total}
					</Badge>
				</ToggleGroupItem>

				<ToggleGroupItem
					value="audit"
					className="gap-2 px-3 py-1.5 font-medium text-xs data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground"
				>
					<AlertTriangle className="size-3.5" />
					<span>{m.admin_media_match_audit()}</span>
					{suspectCount > 0 ? (
						<Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">
							{suspectCount}
						</Badge>
					) : (
						<Badge variant="outline" className="ml-1 h-5 border-success/40 text-[10px] text-success">
							{m.admin_media_audit_zero()}
						</Badge>
					)}
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);
}
