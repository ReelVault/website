import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { shortDateFormatter } from "@/utils/format-utils";
import { AuditDetailInspector, type AuditEntryItem } from "./audit-detail-inspector";

function auditEntryLabel(entry: {
	summary?: string | null;
	resourceType?: string;
	resourceName?: string | null;
	resourceId?: string | null;
}): string {
	if (entry.summary) return entry.summary;

	const type = entry.resourceType ?? "resource";
	if (entry.resourceName) return `${type}: ${entry.resourceName}`;

	return `${type} / ${entry.resourceId ?? "—"}`;
}

export function AuditEntryRow({ entry }: { entry: AuditEntryItem }) {
	const [expanded, setExpanded] = useState(false);

	let variant: "destructive" | "secondary" | "default" = "default";
	if (entry.action === "delete") variant = "destructive";
	else if (entry.action === "update") variant = "secondary";

	return (
		<div className="transition-colors hover:bg-muted/30">
			<Button
				variant="ghost"
				data-entry-id={entry.id}
				aria-expanded={expanded}
				onClick={() => setExpanded((prev) => !prev)}
				className="h-auto w-full justify-start rounded-none p-3 text-left text-sm"
			>
				<span className="shrink-0 text-muted-foreground">
					{expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
				</span>
				<Badge variant={variant} className="shrink-0 px-1.5 py-0 text-[10px] uppercase">
					{entry.action}
				</Badge>
				<span className="min-w-0 flex-1 truncate">{auditEntryLabel(entry)}</span>
				<time dateTime={entry.createdAt} className="shrink-0 text-muted-foreground text-xs tabular-nums">
					{shortDateFormatter.format(new Date(entry.createdAt))}
				</time>
			</Button>
			{expanded && <AuditDetailInspector entry={entry} />}
		</div>
	);
}
