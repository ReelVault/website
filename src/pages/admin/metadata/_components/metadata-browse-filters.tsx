import {
	ADMIN_METADATA_MIN_MATCH_SCORES,
	type AdminMetadataBrowseFilters,
	parseMetadataMinMatchScore,
	parseMetadataStartsWith,
	parseMetadataYear,
	useMetadataStatuses,
} from "@/client/hooks/use-admin-metadata";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { m } from "@/paraglide/messages";

const ANY = "any";
const LETTERS = [...Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index)), "#"];

const percentLabel = (score: number) => m.admin_metadata_min_match_option({ percent: Math.round(score * 100) });
const letterLabel = (letter: string) => (letter === "#" ? m.admin_metadata_letter_other() : letter);

interface YearInputProps {
	label: string;
	value: number | undefined;
	onCommit: (year: number | undefined) => void;
}

/** Commits on blur or Enter, so typing a year does not query the catalog for every digit. */
function YearInput({ label, value, onCommit }: YearInputProps) {
	return (
		<Input
			key={value ?? ANY}
			type="number"
			inputMode="numeric"
			min={1}
			max={9999}
			defaultValue={value}
			placeholder={label}
			aria-label={label}
			className="h-9 w-28"
			onBlur={(event) => {
				const next = parseMetadataYear(event.currentTarget.value);
				if (next !== value) onCommit(next);
			}}
			onKeyDown={(event) => {
				if (event.key === "Enter") event.currentTarget.blur();
			}}
		/>
	);
}

interface MetadataBrowseFiltersProps {
	filters: AdminMetadataBrowseFilters;
	onChange: (patch: AdminMetadataBrowseFilters) => void;
}

export function MetadataBrowseFilters({ filters, onChange }: MetadataBrowseFiltersProps) {
	const statuses = useMetadataStatuses();

	return (
		<div className="flex flex-wrap items-center gap-2">
			<YearInput label={m.admin_metadata_year_from()} value={filters.yearFrom} onCommit={(yearFrom) => onChange({ yearFrom })} />
			<YearInput label={m.admin_metadata_year_to()} value={filters.yearTo} onCommit={(yearTo) => onChange({ yearTo })} />
			<Select
				value={filters.minMatchScore === undefined ? ANY : String(filters.minMatchScore)}
				onValueChange={(value) => onChange({ minMatchScore: parseMetadataMinMatchScore(value) })}
			>
				<SelectTrigger className="h-9 w-full sm:w-44" aria-label={m.admin_metadata_min_match_label()}>
					<SelectValue>
						{filters.minMatchScore === undefined ? m.admin_metadata_min_match_any() : percentLabel(filters.minMatchScore)}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectItem value={ANY}>{m.admin_metadata_min_match_any()}</SelectItem>
						{ADMIN_METADATA_MIN_MATCH_SCORES.map((score) => (
							<SelectItem key={score} value={String(score)}>
								{percentLabel(score)}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<Select value={filters.status ?? ANY} onValueChange={(value) => onChange({ status: value === ANY || !value ? undefined : value })}>
				<SelectTrigger className="h-9 w-full sm:w-44" aria-label={m.admin_metadata_status_label()}>
					<SelectValue>{filters.status ?? m.admin_metadata_status_any()}</SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectItem value={ANY}>{m.admin_metadata_status_any()}</SelectItem>
						{(statuses.data?.statuses ?? []).map((status) => (
							<SelectItem key={status} value={status}>
								{status}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<Select value={filters.startsWith ?? ANY} onValueChange={(value) => onChange({ startsWith: parseMetadataStartsWith(value) })}>
				<SelectTrigger className="h-9 w-full sm:w-40" aria-label={m.admin_metadata_letter_label()}>
					<SelectValue>{filters.startsWith === undefined ? m.admin_metadata_letter_any() : letterLabel(filters.startsWith)}</SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectItem value={ANY}>{m.admin_metadata_letter_any()}</SelectItem>
						{LETTERS.map((letter) => (
							<SelectItem key={letter} value={letter}>
								{letterLabel(letter)}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
}
