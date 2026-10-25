import type { AdminLogEntry } from "@reelvault/sdk";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { m } from "@/paraglide/messages";
import { shortTimeFormatter } from "@/utils/format-utils";
import { extractErrorMessage, extractErrorStack, stringifyLogDetail } from "./log-types";

// Subtle per-level tints instead of solid pills — a wall of saturated badges
// made the log body unreadable.
const LEVEL_VARIANT: Record<string, BadgeVariant> = {
	error: "destructive",
	fatal: "destructive",
	warn: "warning",
	info: "info",
	debug: "muted",
};

interface LogFormattedViewerProps {
	logs: AdminLogEntry[];
}

export function LogFormattedViewer({ logs }: LogFormattedViewerProps) {
	const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
	const logKeyCounts = new Map<string, number>();

	const handleToggleExpanded = (event: React.MouseEvent<HTMLButtonElement>) => {
		const index = Number(event.currentTarget.dataset.index);
		setExpandedIndex((current) => (current === index ? null : index));
	};

	return (
		<ScrollArea className="h-full">
			<div className="divide-border divide-y font-mono text-xs">
				{logs.map((log, idx) => {
					const baseKey = `${log.timestamp}-${log.levelName}-${log.module ?? "Server"}`;
					const occurrence = logKeyCounts.get(baseKey) ?? 0;
					logKeyCounts.set(baseKey, occurrence + 1);
					const isExpanded = expandedIndex === idx;
					const level = log.levelName;
					const message = log.msg ?? extractErrorMessage(log.err) ?? stringifyLogDetail(log.errorDetails) ?? "No message";
					const errorStack = extractErrorStack(log.err);

					return (
						<div key={`${baseKey}-${occurrence}`} className="hover:bg-muted/30 transition-colors">
							<Button
								variant="ghost"
								onClick={handleToggleExpanded}
								data-index={idx}
								size="sm"
								className="w-full justify-start text-left sm:min-h-8"
							>
								<span className="text-muted-foreground mr-1.5 shrink-0">
									{isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
								</span>
								<Badge variant={LEVEL_VARIANT[level]}>{level}</Badge>
								{log.module !== undefined && (
									<span className="text-muted-foreground shrink-0 text-xs">{m.admin_logs_module_label({ module: log.module })}</span>
								)}
								<span className="text-foreground min-w-0 flex-1 truncate text-xs leading-relaxed">{message}</span>
								<span className="text-muted-foreground shrink-0 pl-2 text-xs tabular-nums">
									{shortTimeFormatter.format(new Date(log.timestamp))}
								</span>
							</Button>

							{isExpanded && (
								<div className="border-border bg-muted/20 border-t p-4 text-xs">
									{errorStack !== undefined && (
										<div className="mb-3">
											<p className="text-destructive mb-1.5 text-xs font-medium">{m.admin_logs_stack_trace()}</p>
											<pre className="border-destructive/20 bg-destructive/5 text-destructive/80 overflow-x-auto rounded-md border p-3 font-mono text-xs leading-relaxed">
												{errorStack}
											</pre>
										</div>
									)}
									<div>
										<p className="text-muted-foreground mb-1.5 text-xs font-medium">{m.admin_logs_entry_details()}</p>
										<pre className="border-border bg-muted/30 text-foreground/80 overflow-x-auto rounded-md border p-3 font-mono text-xs leading-relaxed">
											{JSON.stringify(log, null, 2)}
										</pre>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</ScrollArea>
	);
}
