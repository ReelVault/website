import type { PluginConfigExport } from "@reelvault/sdk";
import { Link, useParams } from "@tanstack/react-router";
import { cn } from "cn";
import { ArrowLeft, Download, RefreshCw, RotateCcw, Save, Sliders, Upload } from "lucide-react";
import { type ChangeEvent, lazy, Suspense, useEffect, useRef, useState } from "react";
import { getSdkErrorMessage } from "@/client/client";
import { useAdminPluginConfig } from "@/client/hooks/use-admin-plugin-config";
import { useAdminPlugins } from "@/client/hooks/use-admin-plugins";
import { AppErrorState, AppLoadingState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { PluginEmptyConfig } from "./components/plugin-empty-config";
import { PluginFieldRenderer } from "./components/plugin-field-renderer";
import { PluginUiSwitches } from "./components/plugin-ui-switches";

const LazyPluginTabHost = lazy(async () => {
	const mod = await import("@/plugin-host/tab-host");

	return { default: mod.PluginTabHost };
});

function safeDecode(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

/** A file this page may import: the export format, version 1, with its values object. */
function isPluginConfigExport(value: unknown): value is PluginConfigExport {
	if (typeof value !== "object" || value === null) return false;

	return (
		Reflect.get(value, "format") === "reelvault.plugin-config" &&
		Reflect.get(value, "formatVersion") === 1 &&
		typeof Reflect.get(value, "pluginId") === "string" &&
		typeof Reflect.get(value, "values") === "object"
	);
}

/** A field can be reset to its default when it has one and the form holds something else. */
/** The field a rejected config save names (`plugin.config_invalid` with `params.field`), if any. */
function invalidConfigField(error: unknown): string | null {
	if (!error || typeof error !== "object") return null;

	const { code, params } = error as { code?: unknown; params?: unknown };
	if (code !== "plugin.config_invalid" || !params || typeof params !== "object") return null;

	const { field } = params as { field?: unknown };

	return typeof field === "string" ? field : null;
}

function canRestoreField(field: { type: string; default?: unknown }, value: unknown): boolean {
	return field.type !== "secret" && field.default !== undefined && JSON.stringify(value) !== JSON.stringify(field.default);
}

export default function AdminPluginSettingsPage() {
	const params = useParams({ from: "/admin/plugins/$id" });
	const pluginId = safeDecode(params.id);

	const {
		configDetails,
		isLoading,
		isError,
		error,
		refetch,
		updateConfig,
		isUpdating,
		resetConfig,
		importConfig,
		exportConfig,
		isResetting,
		isImporting,
	} = useAdminPluginConfig(pluginId);
	const importInput = useRef<HTMLInputElement>(null);
	const { reloadPlugin, isReloading } = useAdminPlugins();

	const [formValues, setFormValues] = useState<Record<string, unknown>>({});
	const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
	const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

	useEffect(() => {
		if (configDetails?.config) {
			const initial: Record<string, unknown> = { ...configDetails.config };
			for (const field of configDetails.fields) {
				if (initial[field.name] === undefined && field.default !== undefined) {
					initial[field.name] = field.default;
				}
			}

			setFormValues(initial);
		}
	}, [configDetails]);

	const handleValueChange = (name: string, value: unknown) => {
		setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
		setFormValues((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const toggleSecretVisibility = (fieldName: string) => {
		setShowSecrets((prev) => ({
			...prev,
			[fieldName]: !prev[fieldName],
		}));
	};

	const handleResetDefaults = async () => {
		try {
			await resetConfig();
		} catch {
			// Toast is handled by hook
		}
	};

	const handleExport = async () => {
		try {
			const exported = await exportConfig();
			const url = URL.createObjectURL(new Blob([`${JSON.stringify(exported, null, 2)}\n`], { type: "application/json" }));
			const link = document.createElement("a");
			link.href = url;
			link.download = `${pluginId}-config.json`;
			link.click();
			URL.revokeObjectURL(url);
		} catch (exportError) {
			toastError(m.admin_plugins_config_export_failed(), exportError);
		}
	};

	const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		let parsed: unknown;
		try {
			parsed = JSON.parse(await file.text());
		} catch {
			toast.error(m.admin_plugins_config_import_invalid());

			return;
		}
		if (!isPluginConfigExport(parsed)) {
			toast.error(m.admin_plugins_config_import_invalid());

			return;
		}

		try {
			await importConfig(parsed);
		} catch {
			// Toast is handled by hook
		}
	};

	const handleSubmit = async () => {
		try {
			setFieldErrors({});
			await updateConfig(formValues);
		} catch (saveError) {
			// The hook shows the toast; the named field also gets an inline message.
			const field = invalidConfigField(saveError);
			if (field) setFieldErrors({ [field]: m.admin_plugins_config_field_error() });
		}
	};

	if (isLoading) {
		return <AppLoadingState label={m.admin_plugins_loading_config()} className="min-h-96" />;
	}

	if (isError || !configDetails) {
		return (
			<AppErrorState
				title={m.admin_plugins_failed_to_load_config()}
				description={getSdkErrorMessage(error) ?? m.admin_plugins_check_state_hint()}
				error={error}
				onRetry={() => detach(refetch)}
			/>
		);
	}

	const fields = configDetails.fields;

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={Sliders}
				eyebrow={m.admin_plugins_version_eyebrow({ version: configDetails.version })}
				title={m.admin_plugins_settings_for({ name: configDetails.name })}
				description={configDetails.description ?? m.admin_plugins_config_description()}
				actions={
					<div className="flex flex-wrap items-center gap-2">
						<Button variant="outline" size="sm" nativeButton={false} render={<Link to={"/admin/plugins"} />} className="gap-2 text-xs">
							<ArrowLeft className="size-3.5" />
							{m.admin_plugins_back_to_list()}
						</Button>
						<Button type="button" variant="outline" size="sm" onClick={() => detach(handleExport())} className="gap-2 text-xs">
							<Download className="size-3.5" />
							{m.admin_plugins_config_export()}
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={isImporting}
							onClick={() => importInput.current?.click()}
							className="gap-2 text-xs"
						>
							<Upload className="size-3.5" />
							{m.admin_plugins_config_import()}
						</Button>
						<input
							ref={importInput}
							type="file"
							accept="application/json,.json"
							className="hidden"
							onChange={(event) => detach(handleImportFile(event))}
						/>
						<Button
							variant="ghost"
							size="sm"
							disabled={isReloading}
							onClick={() => detach(() => reloadPlugin(configDetails.id))}
							className="gap-1.5 text-muted-foreground text-xs hover:text-foreground"
						>
							<RefreshCw className={cn("size-3.5", { "animate-spin": isReloading })} />
							{m.admin_plugins_reload()}
						</Button>
					</div>
				}
			/>

			{fields.length === 0 ? (
				<PluginEmptyConfig pluginName={configDetails.name} />
			) : (
				<form
					onSubmit={(event) => {
						event.preventDefault();
						detach(handleSubmit);
					}}
					className="flex flex-col gap-6"
				>
					<AdminSection title={m.admin_plugins_config_parameters()} description={m.admin_plugins_realtime_sync_notice()}>
						<div className="grid grid-cols-1 gap-4">
							{fields.map((field) => (
								<div key={field.name} className="flex flex-col gap-2">
									<PluginFieldRenderer
										field={field}
										value={formValues[field.name]}
										showSecret={Boolean(showSecrets[field.name])}
										onToggleSecret={() => toggleSecretVisibility(field.name)}
										onChange={(val) => handleValueChange(field.name, val)}
									/>
									{fieldErrors[field.name] && <p className="text-destructive text-xs">{fieldErrors[field.name]}</p>}
									{canRestoreField(field, formValues[field.name]) && (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => handleValueChange(field.name, field.default)}
											className="gap-1.5 self-start text-muted-foreground text-xs hover:text-foreground"
										>
											<RotateCcw className="size-3" />
											{m.admin_plugins_field_reset()}
										</Button>
									)}
								</div>
							))}
						</div>
					</AdminSection>

					<div className="flex items-center justify-between border-border/80 border-t pt-4">
						<ConfirmAction
							trigger={
								<Button
									type="button"
									variant="ghost"
									size="sm"
									disabled={isResetting}
									className="gap-1.5 text-muted-foreground text-xs hover:text-foreground"
								>
									<RotateCcw className="size-3.5" />
									{m.admin_settings_restore_default()}
								</Button>
							}
							title={m.admin_plugins_config_reset_confirm()}
							description={m.admin_plugins_config_reset_description()}
							confirmLabel={m.admin_settings_restore_default()}
							onConfirm={handleResetDefaults}
						/>

						<div className="flex items-center gap-3">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								nativeButton={false}
								render={<Link to={"/admin/plugins"} />}
								className="text-xs"
							>
								{m.common_cancel()}
							</Button>
							<AsyncButton type="submit" size="sm" isPending={isUpdating} pendingLabel={m.common_saving_dots()} className="gap-1.5 text-xs">
								<Save className="size-3.5" />
								{m.admin_plugins_save_config()}
							</AsyncButton>
						</div>
					</div>
				</form>
			)}

			<PluginUiSwitches pluginId={pluginId} />

			{/* PLUGIN TABS (host admin-plugin) — renders nothing when there is no contribution */}
			<Suspense fallback={null}>
				<LazyPluginTabHost host="admin-plugin" params={{ pluginId }} />
			</Suspense>
		</div>
	);
}
