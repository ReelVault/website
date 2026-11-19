import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { shortDateFormatter } from "@/utils/format-utils";
import { auditActionLabel, auditEntryLabel } from "../audit-entry-label";
import { AuditDetailInspector, type AuditEntryItem } from "./audit-detail-inspector";

export function AuditEntryRow({ entry }: { entry: AuditEntryItem }) {
	const [expanded, setExpanded] = useState(false);

	let variant: "destructive" | "secondary" | "default" = "default";
	if (entry.action === "delete") variant = "destructive";
	else if (entry.action === "update") variant = "secondary";

	return (
		<div className="hover:bg-muted/30 transition-colors">
			<Button
				size="inline"
				variant="ghost"
				data-entry-id={entry.id}
				aria-expanded={expanded}
				onClick={() => setExpanded((prev) => !prev)}
				className="w-full justify-start text-left sm:min-h-8"
			>
				<span className="text-muted-foreground shrink-0">
					{expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
				</span>
				<Badge variant={variant} className="shrink-0">
					{auditActionLabel(entry.action)}
				</Badge>
				<span className="min-w-0 flex-1 truncate">{auditEntryLabel(entry)}</span>
				<time dateTime={entry.createdAt} className="text-muted-foreground shrink-0 text-xs tabular-nums">
					{shortDateFormatter.format(new Date(entry.createdAt))}
				</time>
			</Button>
			{expanded && <AuditDetailInspector entry={entry} />}
		</div>
	);
}
