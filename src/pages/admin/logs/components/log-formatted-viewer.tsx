import type { AdminLogEntry } from "@reelvault/sdk";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { m } from "@/paraglide/messages";
import { shortTimeFormatter } from "@/utils/format-utils";
import { extractErrorMessage, extractErrorStack, stringifyLogDetail } from "./log-types";

const LEVEL_VARIANTS: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
	error: "destructive",
	fatal: "destructive",
	warn: "secondary",
	info: "default",
	debug: "outline",
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
			<div className="divide-y divide-border font-mono text-xs">
				{logs.map((log, idx) => {
					const baseKey = `${log.timestamp}-${log.levelName}-${log.module ?? "Server"}`;
					const occurrence = logKeyCounts.get(baseKey) ?? 0;
					logKeyCounts.set(baseKey, occurrence + 1);
					const isExpanded = expandedIndex === idx;
					const level = log.levelName;
					const message = log.msg ?? extractErrorMessage(log.err) ?? stringifyLogDetail(log.errorDetails) ?? "No message";
					const errorStack = extractErrorStack(log.err);

					return (
						<div key={`${baseKey}-${occurrence}`} className="transition-colors hover:bg-muted/30">
							<Button
								variant="ghost"
								onClick={handleToggleExpanded}
								data-index={idx}
								className="h-auto w-full justify-start rounded-none px-3 py-2 text-left font-mono text-xs"
							>
								<span className="mr-1.5 shrink-0 text-muted-foreground">
									{isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
								</span>
								<Badge variant={LEVEL_VARIANTS[level] ?? "outline"} className="shrink-0 px-1.5 py-0 text-[9px] uppercase">
									{level}
								</Badge>
								{log.module !== undefined && (
									<span className="shrink-0 text-[11px] text-muted-foreground">{m.admin_logs_module_label({ module: log.module })}</span>
								)}
								<span className="min-w-0 flex-1 truncate text-foreground text-xs leading-relaxed">{message}</span>
								<span className="shrink-0 pl-2 text-[11px] text-muted-foreground tabular-nums">
									{shortTimeFormatter.format(new Date(log.timestamp))}
								</span>
							</Button>

							{isExpanded && (
								<div className="border-border border-t bg-muted/20 p-4 text-xs">
									{errorStack !== undefined && (
										<div className="mb-3">
											<p className="mb-1.5 font-medium text-destructive text-xs uppercase">{m.admin_logs_stack_trace()}</p>
											<pre className="overflow-x-auto rounded-md border border-destructive/20 bg-destructive/5 p-3 font-mono text-destructive/80 text-xs leading-relaxed">
												{errorStack}
											</pre>
										</div>
									)}
									<div>
										<p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase">{m.admin_logs_entry_details()}</p>
										<pre className="overflow-x-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-foreground/80 text-xs leading-relaxed">
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
