import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

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
