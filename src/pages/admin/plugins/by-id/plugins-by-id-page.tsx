import { Link, useParams } from "@tanstack/react-router";
import { cn } from "cn";
import { ArrowLeft, RefreshCw, RotateCcw, Save, Sliders } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { getSdkErrorMessage } from "@/client/client";
import { useAdminPluginConfig } from "@/client/hooks/use-admin-plugin-config";
import { useAdminPlugins } from "@/client/hooks/use-admin-plugins";
import { AppErrorState, AppLoadingState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { PluginEmptyConfig } from "./components/plugin-empty-config";
import { PluginFieldRenderer } from "./components/plugin-field-renderer";

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

export default function AdminPluginSettingsPage() {
	const params = useParams({ from: "/admin/plugins/$id" });
	const pluginId = safeDecode(params.id);

	const { configDetails, isLoading, isError, error, refetch, updateConfig, isUpdating } = useAdminPluginConfig(pluginId);
	const { reloadPlugin, isReloading } = useAdminPlugins();

	const [formValues, setFormValues] = useState<Record<string, unknown>>({});
	const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

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

	const handleResetDefaults = () => {
		if (!configDetails) return;

		const defaults: Record<string, unknown> = {};
		for (const field of configDetails.fields) {
			if (field.default !== undefined) {
				defaults[field.name] = field.default;
			}
		}

		setFormValues(defaults);
		toast.info(m.admin_plugins_defaults_restored());
	};

	const handleSubmit = async () => {
		try {
			await updateConfig(formValues);
		} catch {
			// Toast is handled by hook
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
		<main className="flex flex-col gap-6 text-foreground">
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
								<PluginFieldRenderer
									key={field.name}
									field={field}
									value={formValues[field.name]}
									showSecret={Boolean(showSecrets[field.name])}
									onToggleSecret={() => toggleSecretVisibility(field.name)}
									onChange={(val) => handleValueChange(field.name, val)}
								/>
							))}
						</div>
					</AdminSection>

					<div className="flex items-center justify-between border-border/80 border-t pt-4">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleResetDefaults}
							className="gap-1.5 text-muted-foreground text-xs hover:text-foreground"
						>
							<RotateCcw className="size-3.5" />
							{m.admin_settings_restore_default()}
						</Button>

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

			{/* PLUGIN TABS (host admin-plugin) — renders nothing when there is no contribution */}
			<Suspense fallback={null}>
				<LazyPluginTabHost host="admin-plugin" params={{ pluginId }} />
			</Suspense>
		</main>
	);
}
