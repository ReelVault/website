import { Eye, EyeOff, KeyRound } from "lucide-react";
import type { PluginConfigDetails } from "@reelvault/sdk";
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

/** Renders a plugin default value as text; objects are JSON-stringified. */
function defaultToText(value: unknown): string {
	if (value === null || value === undefined) return "";

	if (typeof value === "object") return JSON.stringify(value);

	if (typeof value === "string") return value;

	if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);

	return "";
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: one renderer dispatching every plugin field type
export function PluginFieldRenderer({ field, value, showSecret, onToggleSecret, onChange }: PluginFieldRendererProps) {
	// 1. BOOLEAN FIELD (Switch)
	if (field.type === "boolean") {
		const fallbackDefault = field.default === true;
		const isChecked = typeof value === "boolean" ? value : fallbackDefault;

		return (
			<Card className="border-border/80 bg-card/60 transition-colors hover:border-border">
				<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<Label className="cursor-pointer font-semibold text-foreground text-sm">{field.label}</Label>
							{field.required && (
								<Badge variant="outline" className="text-[10px] text-destructive">
									{m.common_required()}
								</Badge>
							)}
						</div>
						{field.description && <p className="text-muted-foreground text-xs">{field.description}</p>}
					</div>
					<Switch checked={isChecked} onCheckedChange={onChange} />
				</CardContent>
			</Card>
		);
	}

	// 2. NUMBER FIELD
	if (field.type === "number") {
		const numericDefault = typeof field.default === "number" ? field.default : 0;
		const numValue = typeof value === "number" ? value : numericDefault;

		return (
			<Card className="border-border/80 bg-card/60 transition-colors hover:border-border">
				<CardContent className="flex flex-col gap-3 p-4">
					<div className="flex items-center justify-between">
						<div className="flex flex-col gap-0.5">
							<div className="flex items-center gap-2">
								<Label className="font-semibold text-foreground text-sm">{field.label}</Label>
								{field.required && (
									<Badge variant="outline" className="text-[10px] text-destructive">
										{m.common_required()}
									</Badge>
								)}
							</div>
							{field.description && <p className="text-muted-foreground text-xs">{field.description}</p>}
						</div>
						{field.default !== undefined && (
							<span className="text-muted-foreground text-xs">
								{m.admin_plugins_default_value()} <span className="font-mono text-foreground">{defaultToText(field.default)}</span>
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
						className="max-w-xs font-mono text-sm"
					/>
				</CardContent>
			</Card>
		);
	}

	// 3. SELECT FIELD
	if (field.type === "select" && field.options) {
		const stringDefault = typeof field.default === "string" ? field.default : "";
		const strValue = typeof value === "string" ? value : stringDefault;

		return (
			<Card className="border-border/80 bg-card/60 transition-colors hover:border-border">
				<CardContent className="flex flex-col gap-3 p-4">
					<div className="flex items-center justify-between">
						<div className="flex flex-col gap-0.5">
							<div className="flex items-center gap-2">
								<Label className="font-semibold text-foreground text-sm">{field.label}</Label>
								{field.required && (
									<Badge variant="outline" className="text-[10px] text-destructive">
										{m.common_required()}
									</Badge>
								)}
							</div>
							{field.description && <p className="text-muted-foreground text-xs">{field.description}</p>}
						</div>
						{field.default !== undefined && (
							<span className="text-muted-foreground text-xs">
								{m.admin_plugins_default_value()} <span className="font-mono text-foreground">{defaultToText(field.default)}</span>
							</span>
						)}
					</div>
					<Select value={strValue} onValueChange={(val) => onChange(val)}>
						<SelectTrigger className="max-w-xs bg-background text-sm">
							<SelectValue placeholder={m.admin_settings_select_option()} />
						</SelectTrigger>
						<SelectContent>
							{field.options.map((opt) => (
								<SelectItem key={String(opt.value)} value={String(opt.value)}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>
		);
	}

	// 4. STRING / SECRET FIELD
	const stringDefault = typeof field.default === "string" ? field.default : "";
	const strValue = typeof value === "string" ? value : stringDefault;
	const isSecret = field.type === "secret";

	return (
		<Card className="border-border/80 bg-card/60 transition-colors hover:border-border">
			<CardContent className="flex flex-col gap-3 p-4">
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-0.5">
						<div className="flex items-center gap-2">
							{isSecret && <KeyRound className="size-3.5 text-warning" />}
							<Label className="font-semibold text-foreground text-sm">{field.label}</Label>
							{field.required && (
								<Badge variant="outline" className="text-[10px] text-destructive">
									{m.common_required()}
								</Badge>
							)}
							{isSecret && (
								<Badge variant="secondary" className="border-warning/20 bg-warning/10 text-[10px] text-warning">
									{m.admin_plugins_secret_badge()}
								</Badge>
							)}
						</div>
						{field.description && <p className="text-muted-foreground text-xs">{field.description}</p>}
					</div>
					{!isSecret && field.default !== undefined && (
						<span className="text-muted-foreground text-xs">
							{m.admin_plugins_default_value()} <span className="font-mono text-foreground">{defaultToText(field.default)}</span>
						</span>
					)}
				</div>

				<div className="relative">
					<Input
						type={isSecret && !showSecret ? "password" : "text"}
						value={strValue}
						onChange={(e) => onChange(e.target.value)}
						placeholder={isSecret ? m.admin_plugins_enter_secret() : ""}
						className={isSecret ? "pr-10 font-mono text-sm" : "text-sm"}
					/>
					{isSecret && (
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							onClick={onToggleSecret}
							className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
