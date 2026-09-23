import type { SystemSettingItemView } from "@reelvault/sdk";
import { RotateCcw } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { m } from "@/paraglide/messages";
import { getSettingDescription, getSettingLabel, getSettingOptionLabel } from "./settings-i18n";

/** Renders a setting value as text; objects are JSON-stringified to avoid "[object Object]". */
function settingValueToText(value: unknown): string {
	if (Array.isArray(value)) return value.join(", ");

	if (typeof value === "object" && value !== null) return JSON.stringify(value);

	if (typeof value === "string") return value;

	if (typeof value === "number" || typeof value === "boolean") return String(value);

	return "";
}

/** Number fields keep a text draft and only commit a finite value on blur/Enter —
 * `Number("")`/`Number("-")` previously committed 0/NaN and re-rendered as 0. */
function NumberSettingInput({
	id,
	initial,
	onCommit,
	disabled,
}: {
	id: string;
	initial: string;
	onCommit: (val: unknown) => void;
	disabled?: boolean | undefined;
}) {
	const [draft, setDraft] = useState(initial);

	const commit = () => {
		const trimmed = draft.trim();
		if (trimmed === "" || !Number.isFinite(Number(trimmed))) {
			setDraft(initial);

			return;
		}

		onCommit(Number(trimmed));
	};

	return (
		<Input
			id={id}
			type="number"
			value={draft}
			onChange={(event) => setDraft(event.target.value)}
			onBlur={commit}
			onKeyDown={(event) => {
				if (event.key === "Enter") {
					commit();
					event.currentTarget.blur();
				}
			}}
			disabled={disabled}
			className="min-w-0 flex-1 text-right text-xs sm:w-32 sm:flex-none"
		/>
	);
}

export function SettingField({
	item,
	currentValue,
	onChange,
	onResetSingle,
	disabled,
}: {
	item: SystemSettingItemView;
	currentValue: unknown;
	onChange: (val: unknown) => void;
	onResetSingle: () => void;
	disabled?: boolean;
}) {
	const isUnsaved =
		Array.isArray(currentValue) && Array.isArray(item.value)
			? currentValue.join(",") !== item.value.join(",")
			: currentValue !== item.value;

	const canReset = item.isCustom || isUnsaved;
	const label = getSettingLabel(item.key);
	const description = getSettingDescription(item.key);
	const fieldId = useId();
	// Remount text inputs whenever the committed value changes externally
	// (save/reset), so the visible draft never desyncs from the store.
	const committedKey = settingValueToText(currentValue);

	const parseArrayField = (raw: string) => {
		onChange(
			raw
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
		);
	};

	let control: ReactNode;
	if (item.type === "boolean") {
		control = <Switch checked={Boolean(currentValue)} onCheckedChange={onChange} disabled={disabled} aria-label={label} />;
	} else if (item.type === "enum" && item.options) {
		control = (
			<Select value={String(currentValue ?? item.default)} onValueChange={onChange} disabled={disabled}>
				<SelectTrigger id={fieldId} className="min-w-0 flex-1 text-xs sm:w-56 sm:flex-none">
					<SelectValue placeholder={m.admin_settings_select_option()} />
				</SelectTrigger>
				<SelectContent>
					{item.options.map((opt: string) => (
						<SelectItem key={opt} value={opt} className="text-xs">
							{getSettingOptionLabel(item.key, opt)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	} else if (item.type === "number") {
		control = (
			<NumberSettingInput
				key={committedKey}
				id={fieldId}
				initial={currentValue !== undefined && currentValue !== null ? settingValueToText(currentValue) : ""}
				onCommit={onChange}
				disabled={disabled}
			/>
		);
	} else if (item.type === "string_array") {
		control = (
			<Input
				key={committedKey}
				id={fieldId}
				type="text"
				defaultValue={Array.isArray(currentValue) ? currentValue.join(", ") : settingValueToText(currentValue)}
				onBlur={(e) => parseArrayField(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						parseArrayField(e.currentTarget.value);
						e.currentTarget.blur();
					}
				}}
				disabled={disabled}
				placeholder=".mp4, .mkv, .avi"
				className="min-w-0 flex-1 text-xs sm:w-64 sm:flex-none"
			/>
		);
	} else {
		control = (
			<Input
				id={fieldId}
				type="text"
				value={currentValue !== null && currentValue !== undefined ? settingValueToText(currentValue) : ""}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				placeholder={item.default === null ? m.common_none_lowercase() : settingValueToText(item.default)}
				className="min-w-0 flex-1 text-xs sm:w-48 sm:flex-none"
			/>
		);
	}

	return (
		<div className="flex flex-col justify-between gap-3 rounded-lg border border-border/60 bg-card/50 p-4 transition-[border-color,background-color,color,box-shadow] hover:border-border sm:flex-row sm:items-center">
			<div className="flex flex-1 flex-col gap-1">
				<div className="flex flex-wrap items-center gap-2">
					<Label htmlFor={fieldId} className="font-semibold text-foreground text-sm">
						{label}
					</Label>
					<Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
						{item.key}
					</Badge>
					{item.isCustom && (
						<Badge variant="secondary" className="text-[10px] text-primary">
							{m.admin_settings_custom_value()}
						</Badge>
					)}
					{isUnsaved && (
						<Badge variant="outline" className="border-warning/40 text-[10px] text-warning">
							{m.admin_settings_unsaved_change()}
						</Badge>
					)}
				</div>
				{description && <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>}
				<p className="font-mono text-[11px] text-muted-foreground/80">
					{m.admin_settings_default_word()}{" "}
					<span className="font-medium text-foreground/80">
						{item.default === null ? m.common_none_lowercase() : settingValueToText(item.default)}
					</span>
				</p>
			</div>

			<div className="flex shrink-0 items-center gap-2">{control}</div>

			{canReset && (
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					onClick={onResetSingle}
					disabled={disabled}
					title={item.isCustom ? m.admin_settings_restore_factory_value() : m.admin_settings_undo_change()}
					aria-label={m.admin_settings_restore_default_for({ label })}
					className="size-8 text-muted-foreground hover:text-foreground"
				>
					<RotateCcw className="size-3.5" />
				</Button>
			)}
		</div>
	);
}
