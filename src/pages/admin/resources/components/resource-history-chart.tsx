import { cn } from "cn";
import { m } from "@/paraglide/messages";
import { getLocaleTag } from "@/utils/format-utils";

interface HistoryEntry {
	id: string | number;
	timestamp: string;
	cpu: number;
	memory: number;
	disk: number;
	pressure: string;
	workersJson?: string;
}

/** Reads a possibly-legacy numeric field without asserting the sample's shape. */
function readLegacyNumber(container: object, key: string): number | undefined {
	if (!(key in container)) return undefined;

	const candidate: unknown = Reflect.get(container, key);

	return typeof candidate === "number" && !Number.isNaN(candidate) ? candidate : undefined;
}

function MiniBar({ value, color }: { value: number | undefined; color: string }) {
	const safeValue = typeof value === "number" && !Number.isNaN(value) ? value : 0;

	return (
		<div className="flex h-16 items-end gap-0.5">
			<div
				className={cn("w-full rounded-t-sm", color)}
				style={{ height: `${Math.max(2, safeValue)}%` }}
				title={`${safeValue.toFixed(1)}%`}
			/>
		</div>
	);
}

export function ResourceHistoryChart({ history }: { history: HistoryEntry[] }) {
	const last24 = history.slice(-24);
	const step = Math.max(1, Math.floor(last24.length / 12));
	const labels = last24.filter((_, i) => i % step === 0 || i === last24.length - 1);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4 text-xs">
				<span className="flex items-center gap-2">
					<span className="inline-block size-2 rounded-full bg-blue-500" />
					{m.admin_resources_cpu()}
				</span>
				<span className="flex items-center gap-2">
					<span className="inline-block size-2 rounded-full bg-violet-500" />
					{m.admin_resources_memory()}
				</span>
				<span className="flex items-center gap-2">
					<span className="inline-block size-2 rounded-full bg-emerald-500" />
					{m.admin_resource_disk()}
				</span>
			</div>

			<div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${last24.length}, minmax(0, 1fr))` }}>
				{last24.map((entry) => {
					const rawCpu = typeof entry.cpu === "number" ? entry.cpu : readLegacyNumber(entry, "cpuUsedPercent");
					const rawMem = typeof entry.memory === "number" ? entry.memory : readLegacyNumber(entry, "memoryPercent");
					const rawDisk = typeof entry.disk === "number" ? entry.disk : readLegacyNumber(entry, "diskPercent");

					const cpuVal = rawCpu ?? 0;
					const memVal = rawMem ?? 0;
					const diskVal = rawDisk ?? 0;
					const timeVal = entry.timestamp;

					return (
						<div
							key={entry.id}
							className="flex flex-col gap-0.5"
							title={m.admin_resources_chart_tooltip({
								time: timeVal ? new Date(timeVal).toLocaleTimeString(getLocaleTag()) : "",
								cpu: cpuVal.toFixed(1),
								mem: memVal.toFixed(1),
								disk: diskVal.toFixed(1),
							})}
						>
							<MiniBar value={cpuVal} color="bg-blue-500" />
							<MiniBar value={memVal} color="bg-violet-500" />
							<MiniBar value={diskVal} color="bg-emerald-500" />
						</div>
					);
				})}
			</div>

			<div className="flex justify-between text-[10px] text-muted-foreground">
				{labels.map((entry) => {
					const timeVal = entry.timestamp;

					return (
						<span key={entry.id}>
							{timeVal ? new Date(timeVal).toLocaleTimeString(getLocaleTag(), { hour: "2-digit", minute: "2-digit" }) : ""}
						</span>
					);
				})}
			</div>
		</div>
	);
}
