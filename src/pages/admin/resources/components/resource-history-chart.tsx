import { useState } from "react";
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

const SERIES = [
	{ key: "cpu", label: m.admin_resources_cpu(), color: "var(--primary)" },
	{ key: "memory", label: m.admin_resources_memory(), color: "var(--info)" },
	{ key: "disk", label: m.admin_resource_disk(), color: "var(--warning)" },
] as const;

/** Reads a possibly-legacy numeric field without asserting the sample's shape. */
function readLegacyNumber(container: object, key: string): number | undefined {
	if (!(key in container)) return undefined;

	const candidate: unknown = Reflect.get(container, key);

	return typeof candidate === "number" && !Number.isNaN(candidate) ? candidate : undefined;
}

/** workersJson holds a per-worker activity map for the sample — shown as a total. */
function readWorkerTotal(entry: HistoryEntry): number | undefined {
	if (!entry.workersJson) return undefined;

	let parsed: unknown;
	try {
		parsed = JSON.parse(entry.workersJson);
	} catch {
		return undefined;
	}

	if (typeof parsed !== "object" || parsed === null) return undefined;

	let total = 0;
	for (const value of Object.values(parsed)) {
		if (typeof value === "number") total += value;
	}

	return total;
}

function readSeries(entry: HistoryEntry, key: (typeof SERIES)[number]["key"]): number {
	const raw = entry[key];
	if (typeof raw === "number" && !Number.isNaN(raw)) return raw;

	const legacyKey = { cpu: "cpuUsedPercent", memory: "memoryPercent", disk: "diskPercent" }[key];

	return readLegacyNumber(entry, legacyKey) ?? 0;
}

const CHART_HEIGHT = 176;

/**
 * 24h CPU/RAM/disk history as a hand-rolled SVG area chart — one shared 0-100%
 * scale, hover guide with exact sample values (incl. active worker count from
 * workersJson). Colors come from the theme tokens, not a fixed palette.
 */
export function ResourceHistoryChart({ history }: { history: HistoryEntry[] }) {
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const samples = history.slice(-24);

	const values: Record<(typeof SERIES)[number]["key"], number[]> = {
		cpu: samples.map((entry) => readSeries(entry, "cpu")),
		memory: samples.map((entry) => readSeries(entry, "memory")),
		disk: samples.map((entry) => readSeries(entry, "disk")),
	};
	const workerTotals = samples.map((entry) => readWorkerTotal(entry));

	const toPoints = (points: number[]) =>
		points
			.map((value, index) => {
				const x = samples.length > 1 ? (index / (samples.length - 1)) * 100 : 0;

				return `${x},${100 - Math.max(0, Math.min(100, value))}`;
			})
			.join(" ");

	const formatTime = (entry: HistoryEntry) => (entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString(getLocaleTag()) : "");

	const handleMove = (event: React.MouseEvent<SVGElement>) => {
		if (samples.length === 0) return;

		const bounds = event.currentTarget.getBoundingClientRect();
		const ratio = (event.clientX - bounds.left) / bounds.width;
		const index = Math.round(ratio * (samples.length - 1));
		setHoverIndex(Math.max(0, Math.min(samples.length - 1, index)));
	};

	const hovered = hoverIndex !== null ? samples[hoverIndex] : undefined;
	const hoverX = hoverIndex !== null && samples.length > 1 ? (hoverIndex / (samples.length - 1)) * 100 : 0;

	return (
		<div className="flex flex-col gap-3">
			{/* Legend */}
			<div className="flex items-center gap-4 text-xs">
				{SERIES.map((series) => (
					<span key={series.key} className="flex items-center gap-2">
						<span className="inline-block size-2 rounded-full" style={{ backgroundColor: series.color }} />
						{series.label}
					</span>
				))}
			</div>

			{/* Chart */}
			<div className="relative">
				<svg
					viewBox="0 0 100 100"
					preserveAspectRatio="none"
					className="w-full"
					style={{ height: CHART_HEIGHT }}
					role="img"
					aria-label={m.admin_resources_load_chart_description()}
					onMouseMove={handleMove}
					onMouseLeave={() => setHoverIndex(null)}
				>
					{/* Horizontal gridlines at 25/50/75% */}
					{[25, 50, 75].map((y) => (
						<line
							key={y}
							x1="0"
							x2="100"
							y1={100 - y}
							y2={100 - y}
							stroke="var(--border)"
							strokeOpacity="0.5"
							strokeWidth="1"
							vectorEffect="non-scaling-stroke"
						/>
					))}

					{SERIES.map((series) => (
						<polyline
							key={series.key}
							points={toPoints(values[series.key])}
							fill="none"
							stroke={series.color}
							strokeWidth="1.75"
							strokeLinejoin="round"
							strokeLinecap="round"
							vectorEffect="non-scaling-stroke"
						/>
					))}

					{/* Hover guide */}
					{hovered && (
						<line
							x1={hoverX}
							x2={hoverX}
							y1="0"
							y2="100"
							stroke="var(--muted-foreground)"
							strokeOpacity="0.4"
							strokeWidth="1"
							strokeDasharray="3 3"
							vectorEffect="non-scaling-stroke"
						/>
					)}
				</svg>

				{/* Hover tooltip */}
				{hovered && (
					<div
						className="pointer-events-none absolute -top-1 z-10 min-w-44 -translate-x-1/2 rounded-lg border border-border/70 bg-popover p-2.5 text-popover-foreground shadow-md"
						style={{ left: `${Math.min(88, Math.max(12, hoverX))}%` }}
					>
						<p className="font-medium font-mono text-[10px] text-muted-foreground">{formatTime(hovered)}</p>
						<div className="mt-1.5 flex flex-col gap-1 text-xs">
							{SERIES.map((series) => (
								<span key={series.key} className="flex items-center justify-between gap-3">
									<span className="flex items-center gap-1.5 text-muted-foreground">
										<span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: series.color }} />
										{series.label}
									</span>
									<span className="font-mono font-semibold tabular-nums">
										{m.common_percent_value({ value: readSeries(hovered, series.key).toFixed(1) })}
									</span>
								</span>
							))}
							{workerTotals[hoverIndex ?? 0] !== undefined && (
								<span className="flex items-center justify-between gap-3 border-border/60 border-t pt-1 text-muted-foreground">
									<span>{m.admin_resources_active_workers()}</span>
									<span className="font-mono font-semibold tabular-nums">{workerTotals[hoverIndex ?? 0]}</span>
								</span>
							)}
						</div>
					</div>
				)}
			</div>

			{/* X labels: first / middle / last */}
			{samples.length > 0 && (
				<div className="flex justify-between text-[10px] text-muted-foreground">
					{(samples.length >= 3 ? [0, Math.floor((samples.length - 1) / 2), samples.length - 1] : [0]).map((index) => {
						const entry = samples[index];
						if (!entry) return null;

						return (
							<span key={index}>
								{entry.timestamp
									? new Date(entry.timestamp).toLocaleTimeString(getLocaleTag(), { hour: "2-digit", minute: "2-digit" })
									: ""}
							</span>
						);
					})}
				</div>
			)}
		</div>
	);
}
