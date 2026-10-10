import { ArrowLeft, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { m } from "@/paraglide/messages";

export function PreferenceSelect({
	label,
	description,
	value,
	onChange,
	options,
	className,
}: {
	label: string;
	description?: string;
	value: string;
	onChange: (value: string) => void;
	options: string[][];
	className?: string;
}) {
	return (
		<Field className="gap-2">
			<FieldLabel>{label}</FieldLabel>
			<Select value={value} onValueChange={(nextValue) => nextValue !== null && onChange(nextValue)}>
				<SelectTrigger className={className ?? "h-11 w-full rounded-xl"}>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{options.map(([optionValue, optionLabel]) => (
							<SelectItem key={optionValue} value={optionValue}>
								{optionLabel}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			{description ? <FieldDescription>{description}</FieldDescription> : null}
		</Field>
	);
}

export function PreferenceToggle({
	label,
	description,
	checked,
	onChange,
	className,
}: {
	label: string;
	description?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	className?: string;
}) {
	return (
		<div
			className={className ?? "flex min-h-14 flex-col justify-center gap-1 rounded-xl border border-border bg-background/40 p-3 text-sm"}
		>
			<div className="flex items-center gap-3">
				<Switch checked={checked} onCheckedChange={(value) => onChange(value)} aria-label={label} />
				<span>{label}</span>
			</div>
			{description ? <p className="text-muted-foreground text-xs leading-snug">{description}</p> : null}
		</div>
	);
}

/** Ordered, de-duplicated language list stored as a comma-separated string (first = highest priority). */
export function PreferenceLanguageList({
	label,
	description,
	value,
	onChange,
	options,
}: {
	label: string;
	description?: string;
	value: string;
	onChange: (value: string) => void;
	options: string[][];
}) {
	const selected = value
		.split(",")
		.map((code) => code.trim())
		.filter((code) => code !== "");
	const labelFor = (code: string) => options.find(([optionValue]) => optionValue === code)?.[1] ?? code;
	const commit = (codes: string[]) => onChange(codes.join(","));
	const selectedCodes = new Set(selected);
	const remaining = options.flatMap(([code, name]) => (code && name && !selectedCodes.has(code) ? [{ code, name }] : []));

	return (
		<Field className="gap-2">
			<FieldLabel>{label}</FieldLabel>
			{selected.length > 0 && (
				<ol className="flex flex-wrap gap-2">
					{selected.map((code, index) => (
						<li key={code}>
							<Badge variant="secondary" className="h-7 gap-1.5 pr-1.5">
								<span className="font-mono text-muted-foreground text-xs">{index + 1}</span>
								{labelFor(code)}
								{index > 0 && (
									<button
										type="button"
										className="text-muted-foreground hover:text-foreground"
										aria-label={m.user_language_list_move_earlier({ language: labelFor(code) })}
										onClick={() => commit([...selected.slice(0, index - 1), code, selected[index - 1] ?? "", ...selected.slice(index + 1)])}
									>
										<ArrowLeft className="size-3" />
									</button>
								)}
								<button
									type="button"
									className="text-muted-foreground hover:text-foreground"
									aria-label={m.user_language_list_remove({ language: labelFor(code) })}
									onClick={() => commit(selected.filter((entry) => entry !== code))}
								>
									<X className="size-3" />
								</button>
							</Badge>
						</li>
					))}
				</ol>
			)}
			{remaining.length > 0 && (
				<Select value="" onValueChange={(code) => code !== null && code !== "" && commit([...selected, code])}>
					<SelectTrigger className="h-11 w-full rounded-xl">
						<SelectValue placeholder={m.user_language_list_add()} />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{remaining.map((option) => (
								<SelectItem key={option.code} value={option.code}>
									{option.name}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			)}
			{description ? <FieldDescription>{description}</FieldDescription> : null}
		</Field>
	);
}
