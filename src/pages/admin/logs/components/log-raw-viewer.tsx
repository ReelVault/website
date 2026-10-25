import type { AdminLogEntry } from "@reelvault/sdk";
import { cn } from "cn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { extractErrorMessage, stringifyLogDetail } from "./log-types";

function getLogLineClass(isError: boolean, isWarn: boolean): "text-destructive" | "text-warning" | "text-foreground/90" {
	if (isError) return "text-destructive";

	if (isWarn) return "text-warning";

	return "text-foreground/90";
}

interface LogRawViewerProps {
	logs: AdminLogEntry[];
	page: number;
}

export function LogRawViewer({ logs, page }: LogRawViewerProps) {
	const logKeyCounts = new Map<string, number>();

	return (
		<ScrollArea className="h-full">
			<div className="flex flex-col gap-1 p-4 select-text">
				{logs.map((log, idx) => {
					const lineText = log.msg ?? extractErrorMessage(log.err) ?? stringifyLogDetail(log.errorDetails) ?? JSON.stringify(log);
					const isError = log.levelName === "error" || lineText.toLowerCase().includes("error");
					const isWarn = log.levelName === "warn" || lineText.includes("[stderr]");
					const lineIndex = (page - 1) * 100 + idx + 1;
					const baseKey = `${log.timestamp}-${log.levelName}`;
					const occurrence = logKeyCounts.get(baseKey) ?? 0;
					logKeyCounts.set(baseKey, occurrence + 1);

					return (
						<div key={`${baseKey}-${occurrence}`} className="hover:bg-muted/40 flex items-start gap-3 rounded px-1.5 py-0.5">
							<span className="text-muted-foreground/60 w-8 shrink-0 text-right text-xs tabular-nums select-none">{lineIndex}</span>
							<pre
								className={cn(
									"flex-1 overflow-x-auto font-mono text-xs leading-relaxed break-all whitespace-pre-wrap",
									getLogLineClass(isError, isWarn),
								)}
							>
								{lineText}
							</pre>
						</div>
					);
				})}
			</div>
		</ScrollArea>
	);
}
