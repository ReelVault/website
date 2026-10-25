import type { SystemSettingItemView } from "@reelvault/sdk";
import { useForm } from "@tanstack/react-form";
import { Check, RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { UnsavedChangesDialog } from "@/components/unsaved-changes-dialog";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { SettingField } from "./setting-field";
import { getSettingDescription, getSettingLabel } from "./settings-i18n";

function isItemModified(item: SystemSettingItemView, value: unknown) {
	const original: unknown = item.value;
	if (Array.isArray(value) && Array.isArray(original)) {
		return value.join(",") !== original.join(",");
	}

	return value !== original;
}

function hasModifiedItems(values: Record<string, unknown>, items: SystemSettingItemView[]): boolean {
	return items.some((item) => {
		const current = readItemValue(values, item.key);

		return current !== undefined && isItemModified(item, current);
	});
}

function resolveFieldValue(fieldValue: unknown, fallback: unknown): unknown {
	return fieldValue ?? fallback;
}

/**
 * Setting keys contain dots (`system.resources.monitoringEnabled`), which
 * TanStack Form interprets as nested paths. Build the baseline nested too, so
 * field reads/writes and the dirty check all resolve the same location.
 */
export function buildInitial(items: SystemSettingItemView[]): Record<string, unknown> {
	const initial: Record<string, unknown> = {};
	for (const item of items) {
		setNestedValue(initial, item.key.split("."), item.value);
	}

	return initial;
}

/** Reads a dotted setting key from the nested form values. */
export function readItemValue(values: Record<string, unknown>, key: string): unknown {
	let cursor: unknown = values;
	for (const segment of key.split(".")) {
		if (!isRecord(cursor)) return undefined;

		cursor = cursor[segment];
	}

	return cursor;
}

function setNestedValue(target: Record<string, unknown>, path: string[], value: unknown): void {
	let cursor = target;
	for (const key of path.slice(0, -1)) {
		const next = cursor[key];
		if (isRecord(next)) {
			cursor = next;
		} else {
			const created: Record<string, unknown> = {};
			cursor[key] = created;
			cursor = created;
		}
	}

	const last = path.at(-1);
	if (last !== undefined) cursor[last] = value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Matches a lowercase query against the setting's key, translated name and description. */
function matchesSettingSearch(item: SystemSettingItemView, normalizedQuery: string): boolean {
	return [item.key, getSettingLabel(item.key), getSettingDescription(item.key)].some((text) =>
		text.toLowerCase().includes(normalizedQuery),
	);
}

/** TanStack Form pilot (T5): dynamic-key form — one field per setting, dirty diff at submit. */
export function SettingsGroupView({
	items,
	onSave,
	onResetKeys,
	isSaving,
	isResetting,
	searchQuery = "",
}: {
	items: SystemSettingItemView[];
	onSave: (updates: Record<string, unknown>) => Promise<unknown>;
	onResetKeys: (keys: string[]) => Promise<unknown>;
	isSaving: boolean;
	isResetting: boolean;
	searchQuery?: string;
}) {
	const form = useForm({
		defaultValues: buildInitial(items),
		onSubmit: async ({ value }) => {
			const changed: Record<string, unknown> = {};
			for (const item of items) {
				const current = readItemValue(value, item.key);
				if (current !== undefined && isItemModified(item, current)) {
					changed[item.key] = current;
				}
			}

			if (Object.keys(changed).length > 0) {
				await onSave(changed);
			}
		},
	});

	// Settings arrive async — re-seed the form when the group data lands/changes.
	useEffect(() => {
		form.reset(buildInitial(items));
	}, [items, form]);

	const [hasChanges, setHasChanges] = useState(false);
	useEffect(() => {
		const syncHasChanges = () => setHasChanges(hasModifiedItems(form.state.values, items));
		syncHasChanges();
		const subscription = form.store.subscribe(syncHasChanges);

		return () => subscription.unsubscribe();
	}, [form, items]);

	// Unsaved edits: closing the tab asks the browser, leaving the page asks in the dialog below.
	const { leaveRequested, answerLeave } = useUnsavedChangesGuard(hasChanges);

	const handleResetSingle = (item: SystemSettingItemView) => {
		if (item.isCustom) {
			detach(onResetKeys([item.key]));
		} else {
			form.setFieldValue(item.key, item.default);
		}
	};

	const handleResetAllSection = async () => {
		const allKeys = items.map((i) => i.key);
		await onResetKeys(allKeys);
	};

	const disabled = isSaving || isResetting;

	// Search only hides rows: every field stays mounted, so edits in hidden rows are still saved.
	const normalizedQuery = searchQuery.trim().toLowerCase();
	const isVisible = (item: SystemSettingItemView) => normalizedQuery === "" || matchesSettingSearch(item, normalizedQuery);
	const hasVisibleItems = items.some((item) => isVisible(item));

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-3">
				{items.map((item) => (
					<div key={item.key} hidden={!isVisible(item)}>
						<form.Field name={item.key}>
							{(field) => (
								<SettingField
									item={item}
									currentValue={resolveFieldValue(field.state.value, item.value)}
									onChange={(val) => field.handleChange(val)}
									onResetSingle={() => handleResetSingle(item)}
									disabled={disabled}
								/>
							)}
						</form.Field>
					</div>
				))}
				{normalizedQuery !== "" && !hasVisibleItems && (
					<p className="text-muted-foreground text-sm">{m.admin_settings_search_no_matches()}</p>
				)}
			</div>

			<div className="border-border/80 mt-2 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
				<ConfirmAction
					trigger={
						<Button type="button" variant="destructive-outline" size="sm" disabled={disabled}>
							<RotateCcw className="size-3.5" />
							{m.admin_settings_restore_section()}
						</Button>
					}
					title={m.admin_settings_restore_section_confirm()}
					description={m.admin_settings_reset_section_notice()}
					confirmLabel={m.admin_settings_restore_default()}
					onConfirm={handleResetAllSection}
				/>

				<div className="flex items-center gap-2">
					{hasChanges && <span className="text-muted-foreground text-xs">{m.admin_settings_unsaved_changes()}</span>}
					<Button type="button" size="sm" onClick={() => detach(form.handleSubmit())} disabled={!hasChanges || disabled}>
						{isSaving ? <Save className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
						{m.common_save_changes()}
					</Button>
				</div>
			</div>
			<UnsavedChangesDialog open={leaveRequested} onAnswer={answerLeave} />
		</div>
	);
}
