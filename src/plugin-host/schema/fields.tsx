import { type ReactNode, useState } from "react";
import type { PluginSchemaFieldNode } from "@reelvault/sdk/plugin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { m } from "@/paraglide/messages";
import { evaluateCondition, resolveLabel, type SchemaScope } from "./binding";

const INPUT_TYPE: Partial<Record<PluginSchemaFieldNode["input"], string>> = {
	number: "number",
	secret: "password",
	date: "date",
};

interface SchemaFieldProps {
	node: PluginSchemaFieldNode;
	scope: SchemaScope;
	value: unknown;
	onChange: (value: unknown) => void;
}

function asText(value: unknown): string {
	if (value === null || value === undefined) return "";

	if (typeof value === "string") return value;

	if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);

	return "";
}

/** Renders one form field with the host's input components. */
export function SchemaField({ node, scope, value, onChange }: SchemaFieldProps) {
	if (node.hiddenIf && evaluateCondition(node.hiddenIf, scope)) return null;

	const label = resolveLabel(node.label, scope);
	const description = node.description ? resolveLabel(node.description, scope) : undefined;
	const placeholder = node.placeholder ? resolveLabel(node.placeholder, scope) : undefined;
	const requiredMark = node.required ? <span className="text-destructive">{m.common_required_mark()}</span> : null;

	if (node.input === "switch" || node.input === "checkbox") {
		return (
			<div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card p-3">
				<div className="space-y-0.5">
					<Label className="font-medium text-sm">
						{label}
						{requiredMark}
					</Label>
					{description ? <p className="text-muted-foreground text-xs">{description}</p> : null}
				</div>
				<Switch checked={value === true} onCheckedChange={(checked) => onChange(checked)} />
			</div>
		);
	}

	if (node.input === "select") {
		return (
			<div>
				<Label className="text-sm">
					{label}
					{requiredMark}
				</Label>
				{description ? <p className="text-muted-foreground text-xs">{description}</p> : null}
				<Select value={asText(value)} onValueChange={(next) => onChange(next)}>
					<SelectTrigger className="mt-1.5 w-full">
						<SelectValue placeholder={placeholder ?? "—"} />
					</SelectTrigger>
					<SelectContent>
						{(node.options ?? []).map((option) => (
							<SelectItem key={String(option.value)} value={String(option.value)}>
								{resolveLabel(option.label, scope)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		);
	}

	const type = INPUT_TYPE[node.input] ?? "text";

	let inputControl: ReactNode;
	if (node.input === "textarea") {
		inputControl = (
			<Textarea
				className="mt-1.5"
				value={asText(value)}
				placeholder={placeholder}
				rows={node.rows}
				onChange={(event) => onChange(event.target.value)}
			/>
		);
	} else if (node.input === "number") {
		inputControl = (
			<NumberFieldInput
				key={typeof value === "number" ? String(value) : ""}
				value={value}
				placeholder={placeholder}
				min={node.min}
				max={node.max}
				step={node.step}
				onChange={onChange}
			/>
		);
	} else {
		inputControl = (
			<Input
				className="mt-1.5"
				type={type}
				value={asText(value)}
				placeholder={placeholder}
				onChange={(event) => onChange(event.target.value)}
			/>
		);
	}

	return (
		<div>
			<Label className="text-sm">
				{label}
				{requiredMark}
			</Label>
			{description ? <p className="text-muted-foreground text-xs">{description}</p> : null}
			{inputControl}
		</div>
	);
}

/** Number fields keep a text draft and commit only a finite value on blur/Enter
 * — `Number("")` was 0 and partial input produced NaN. */
function NumberFieldInput({
	value,
	placeholder,
	min,
	max,
	step,
	onChange,
}: {
	value: unknown;
	placeholder?: string | undefined;
	min?: number | undefined;
	max?: number | undefined;
	step?: number | undefined;
	onChange: (value: unknown) => void;
}) {
	const initial = typeof value === "number" ? String(value) : "";
	const [draft, setDraft] = useState(initial);

	const commit = () => {
		const trimmed = draft.trim();
		if (trimmed === "" || !Number.isFinite(Number(trimmed))) {
			setDraft(initial);

			return;
		}

		onChange(Number(trimmed));
	};

	return (
		<Input
			className="mt-1.5"
			type="number"
			value={draft}
			placeholder={placeholder}
			min={min}
			max={max}
			step={step}
			onChange={(event) => setDraft(event.target.value)}
			onBlur={commit}
			onKeyDown={(event) => {
				if (event.key === "Enter") {
					commit();
					event.currentTarget.blur();
				}
			}}
		/>
	);
}
