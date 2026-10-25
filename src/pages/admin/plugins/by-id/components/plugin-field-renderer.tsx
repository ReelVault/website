import type { PluginConfigDetails } from "@reelvault/sdk";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { resolvePluginText } from "@/client/hooks/use-plugin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { m } from "@/paraglide/messages";

export type PluginConfigField = PluginConfigDetails["fields"][number];

interface PluginFieldRendererProps {
	field: PluginConfigField;
	value: unknown;
	showSecret: boolean;
	onToggleSecret: () => void;
	onChange: (val: unknown) => void;
}

interface FieldRendererProps {
	field: PluginConfigField;
	value: unknown;
	onChange: (val: unknown) => void;
}

/** Renders a plugin default value as text; objects are JSON-stringified. */
function defaultToText(value: unknown): string {
	if (value === null || value === undefined) return "";

	if (typeof value === "object") return JSON.stringify(value);

	if (typeof value === "string") return value;

	if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);

	return "";
}

/** Boolean fields render as a switch row. */
function BooleanFieldRenderer({ field, value, onChange }: FieldRendererProps) {
	const fallbackDefault = field.default === true;
	const isChecked = typeof value === "boolean" ? value : fallbackDefault;

	return (
		<Card variant="subtle">
			<CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<Label weight="semibold" className="cursor-pointer">
							{resolvePluginText(field.label)}
						</Label>
						{field.required && (
							<Badge tone="destructive" variant="outline">
								{m.common_required()}
							</Badge>
						)}
					</div>
					{field.description && <p className="text-muted-foreground text-xs">{resolvePluginText(field.description)}</p>}
				</div>
				<Switch checked={isChecked} onCheckedChange={onChange} />
			</CardContent>
		</Card>
	);
}

/** Number fields render a numeric input with the default shown beside the label. */
function NumberFieldRenderer({ field, value, onChange }: FieldRendererProps) {
	const numericDefault = typeof field.default === "number" ? field.default : 0;
	const numValue = typeof value === "number" ? value : numericDefault;

	return (
		<Card variant="subtle">
			<CardContent className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-0.5">
						<div className="flex items-center gap-2">
							<Label weight="semibold">{resolvePluginText(field.label)}</Label>
							{field.required && (
								<Badge tone="destructive" variant="outline">
									{m.common_required()}
								</Badge>
							)}
						</div>
						{field.description && <p className="text-muted-foreground text-xs">{resolvePluginText(field.description)}</p>}
					</div>
					{field.default !== undefined && (
						<span className="text-muted-foreground text-xs">
							{m.admin_plugins_default_value()} <span className="text-foreground font-mono">{defaultToText(field.default)}</span>
						</span>
					)}
				</div>
				<Input
					type="number"
					value={numValue}
					min={field.min}
					max={field.max}
					step={field.step ?? 1}
					onChange={(e) => onChange(Number(e.target.value))}
					placeholder={field.default !== undefined ? defaultToText(field.default) : ""}
					font="mono"
					className="max-w-xs"
				/>
			</CardContent>
		</Card>
	);
}

interface SelectFieldRendererProps extends FieldRendererProps {
	options: NonNullable<PluginConfigField["options"]>;
}

/** Select fields render a dropdown over the declared options. */
function SelectFieldRenderer({ field, options, value, onChange }: SelectFieldRendererProps) {
	const stringDefault = typeof field.default === "string" ? field.default : "";
	const strValue = typeof value === "string" ? value : stringDefault;

	return (
		<Card variant="subtle">
			<CardContent className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-0.5">
						<div className="flex items-center gap-2">
							<Label weight="semibold">{resolvePluginText(field.label)}</Label>
							{field.required && (
								<Badge tone="destructive" variant="outline">
									{m.common_required()}
								</Badge>
							)}
						</div>
						{field.description && <p className="text-muted-foreground text-xs">{resolvePluginText(field.description)}</p>}
					</div>
					{field.default !== undefined && (
						<span className="text-muted-foreground text-xs">
							{m.admin_plugins_default_value()} <span className="text-foreground font-mono">{defaultToText(field.default)}</span>
						</span>
					)}
				</div>
				<Select value={strValue} onValueChange={(val) => onChange(val)}>
					<SelectTrigger className="max-w-xs">
						<SelectValue placeholder={m.admin_settings_select_option()} />
					</SelectTrigger>
					<SelectContent>
						{options.map((opt) => (
							<SelectItem key={String(opt.value)} value={String(opt.value)}>
								{resolvePluginText(opt.label)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</CardContent>
		</Card>
	);
}

interface TextFieldRendererProps extends FieldRendererProps {
	showSecret: boolean;
	onToggleSecret: () => void;
}

/** String and secret fields render a text input; secrets are masked and get a reveal toggle. */
function TextFieldRenderer({ field, value, showSecret, onToggleSecret, onChange }: TextFieldRendererProps) {
	const stringDefault = typeof field.default === "string" ? field.default : "";
	const strValue = typeof value === "string" ? value : stringDefault;
	const isSecret = field.type === "secret";
	const secretPlaceholder = field.hasValue ? m.admin_plugins_secret_stored() : m.admin_plugins_enter_secret();

	return (
		<Card variant="subtle">
			<CardContent className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-0.5">
						<div className="flex items-center gap-2">
							{isSecret && <KeyRound className="text-warning size-3.5" />}
							<Label weight="semibold">{resolvePluginText(field.label)}</Label>
							{field.required && (
								<Badge tone="destructive" variant="outline">
									{m.common_required()}
								</Badge>
							)}
							{isSecret && <Badge variant="warning">{m.admin_plugins_secret_badge()}</Badge>}
							{isSecret && field.hasValue && <Badge variant="success-outline">{m.admin_plugins_secret_set()}</Badge>}
						</div>
						{field.description && <p className="text-muted-foreground text-xs">{resolvePluginText(field.description)}</p>}
					</div>
					{!isSecret && field.default !== undefined && (
						<span className="text-muted-foreground text-xs">
							{m.admin_plugins_default_value()} <span className="text-foreground font-mono">{defaultToText(field.default)}</span>
						</span>
					)}
				</div>

				<div className="relative">
					<Input
						type={isSecret && !showSecret ? "password" : "text"}
						value={strValue}
						onChange={(e) => onChange(e.target.value)}
						placeholder={isSecret ? secretPlaceholder : ""}
						font={isSecret ? "mono" : "sans"}
						className={isSecret ? "pr-10" : undefined}
					/>
					{isSecret && (
						<Button
							tone="muted"
							type="button"
							variant="ghost"
							size="icon-sm"
							onClick={onToggleSecret}
							className="absolute top-1/2 right-1 -translate-y-1/2"
							title={showSecret ? m.admin_plugins_show_secret() : m.admin_plugins_show_secret()}
						>
							{showSecret ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

/** Picks the renderer for one plugin config field; a select without options falls back to the text input. */
export function PluginFieldRenderer({ field, value, showSecret, onToggleSecret, onChange }: PluginFieldRendererProps) {
	if (field.type === "boolean") return <BooleanFieldRenderer field={field} value={value} onChange={onChange} />;

	if (field.type === "number") return <NumberFieldRenderer field={field} value={value} onChange={onChange} />;

	if (field.type === "select" && field.options) {
		return <SelectFieldRenderer field={field} options={field.options} value={value} onChange={onChange} />;
	}

	return <TextFieldRenderer field={field} value={value} showSecret={showSecret} onToggleSecret={onToggleSecret} onChange={onChange} />;
}
