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
		<div className="border-border/70 bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-2 shadow-2xs">
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
				<ToggleGroupItem value="all" size="sm">
					<ListFilter className="size-3.5" />
					<span>{m.admin_media_all_files()}</span>
					<Badge variant="secondary" size="compact" className="ml-1">
						{total}
					</Badge>
				</ToggleGroupItem>

				<ToggleGroupItem value="audit" size="sm">
					<AlertTriangle className="size-3.5" />
					<span>{m.admin_media_match_audit()}</span>
					{suspectCount > 0 ? (
						<Badge variant="destructive" size="compact" className="ml-1">
							{suspectCount}
						</Badge>
					) : (
						<Badge variant="success-outline" size="sm" className="ml-1">
							{m.admin_media_audit_zero()}
						</Badge>
					)}
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);
}
