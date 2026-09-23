import type { SystemSettingItemView } from "@reelvault/sdk";
import { useForm } from "@tanstack/react-form";
import { Check, RotateCcw, Save } from "lucide-react";
import { useEffect } from "react";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { SettingField } from "./setting-field";

function isItemModified(item: SystemSettingItemView, value: unknown) {
	const original: unknown = item.value;
	if (Array.isArray(value) && Array.isArray(original)) {
		return value.join(",") !== original.join(",");
	}

	return value !== original;
}

function resolveFieldValue(fieldValue: unknown, fallback: unknown): unknown {
	return fieldValue ?? fallback;
}

function buildInitial(items: SystemSettingItemView[]): Record<string, unknown> {
	const initial: Record<string, unknown> = {};
	for (const item of items) {
		initial[item.key] = item.value;
	}

	return initial;
}

/** TanStack Form pilot (T5): dynamic-key form — one field per setting, dirty diff at submit. */
export function SettingsGroupView({
	items,
	onSave,
	onResetKeys,
	isSaving,
	isResetting,
}: {
	items: SystemSettingItemView[];
	onSave: (updates: Record<string, unknown>) => Promise<unknown>;
	onResetKeys: (keys: string[]) => Promise<unknown>;
	isSaving: boolean;
	isResetting: boolean;
}) {
	const form = useForm({
		defaultValues: buildInitial(items),
		onSubmit: async ({ value }) => {
			const changed: Record<string, unknown> = {};
			for (const item of items) {
				const current = value[item.key];
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

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-3">
				{items.map((item) => (
					<form.Field key={item.key} name={item.key}>
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
				))}
			</div>

			<div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-border/80 border-t pt-4">
				<ConfirmAction
					trigger={
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
							disabled={disabled}
						>
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
					<form.Subscribe
						selector={(state) => items.some((item) => state.values[item.key] !== undefined && isItemModified(item, state.values[item.key]))}
					>
						{(hasChanges) => (
							<>
								{hasChanges && <span className="text-muted-foreground text-xs">{m.admin_settings_unsaved_changes()}</span>}
								<Button
									type="button"
									size="sm"
									onClick={() => detach(form.handleSubmit())}
									disabled={!hasChanges || disabled}
									className="gap-2"
								>
									{isSaving ? <Save className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
									{m.common_save_changes()}
								</Button>
							</>
						)}
					</form.Subscribe>
				</div>
			</div>
		</div>
	);
}
