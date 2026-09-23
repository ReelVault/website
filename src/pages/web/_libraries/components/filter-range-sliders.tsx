import { Timer } from "lucide-react";
import { useState } from "react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { m } from "@/paraglide/messages";

interface FilterRangeSlidersProps {
	range: [number, number];
	setRange: (value: [number, number]) => void;
	yearRange: { min: number; max: number };
	durationRange: [number, number];
	setDurationRange: (value: [number, number]) => void;
	durationBounds: { min: number; max: number };
}

// The slider emits either a single number or a value array; only a two-element
// array is a meaningful range commit. Returns null when the payload is unusable.
const readRange = (value: number | readonly number[], fallback: [number, number]): [number, number] | null => {
	if (typeof value === "number") return null;

	if (value.length !== 2) return null;

	return [value[0] ?? fallback[0], value[1] ?? fallback[1]];
};

export function FilterRangeSliders({
	range,
	setRange,
	yearRange,
	durationRange,
	setDurationRange,
	durationBounds,
}: FilterRangeSlidersProps) {
	const [localRange, setLocalRange] = useState<[number, number]>(range);
	const [localDurationRange, setLocalDurationRange] = useState<[number, number]>(durationRange);

	// Adopt externally reset ranges while rendering (React's documented
	// "adjust state when props change" pattern); slider drags keep local state.
	const [lastSyncedRange, setLastSyncedRange] = useState(range);
	if (range !== lastSyncedRange) {
		setLastSyncedRange(range);
		setLocalRange(range);
	}

	const [lastSyncedDurationRange, setLastSyncedDurationRange] = useState(durationRange);
	if (durationRange !== lastSyncedDurationRange) {
		setLastSyncedDurationRange(durationRange);
		setLocalDurationRange(durationRange);
	}

	return (
		<>
			<Field>
				<FieldLabel htmlFor="library-year-range">{m.web_filter_year_range_label({ min: localRange[0], max: localRange[1] })}</FieldLabel>
				<Slider
					id="library-year-range"
					value={localRange}
					min={yearRange.min}
					max={yearRange.max}
					step={1}
					onValueChange={(value) => {
						const next = readRange(value, [yearRange.min, yearRange.max]);
						if (next) setLocalRange(next);
					}}
					onValueCommitted={(value) => {
						const next = readRange(value, [yearRange.min, yearRange.max]);
						if (next) setRange(next);
					}}
				/>
				<FieldDescription>{m.web_filter_year_range({ min: yearRange.min, max: yearRange.max })}</FieldDescription>
			</Field>

			<Field>
				<FieldLabel htmlFor="library-duration-range" className="gap-2">
					<Timer className="size-3.5 text-primary" aria-hidden="true" />
					{m.web_filter_duration_range({ min: localDurationRange[0], max: localDurationRange[1] })}
				</FieldLabel>
				<Slider
					id="library-duration-range"
					value={localDurationRange}
					min={durationBounds.min}
					max={durationBounds.max}
					step={5}
					onValueChange={(value) => {
						const next = readRange(value, [durationBounds.min, durationBounds.max]);
						if (next) setLocalDurationRange(next);
					}}
					onValueCommitted={(value) => {
						const next = readRange(value, [durationBounds.min, durationBounds.max]);
						if (next) setDurationRange(next);
					}}
				/>
				<FieldDescription>{m.web_file_range_match_hint()}</FieldDescription>
			</Field>
		</>
	);
}
