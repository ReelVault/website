import type { PluginConfigDetails } from "@reelvault/sdk";
import { Save } from "lucide-react";
import { useState } from "react";
import { useAdminPluginConfig } from "@/client/hooks/use-admin-plugin-config";
import { AsyncButton } from "@/components/async-button";
import { detach } from "@/lib/detach";
import { PluginFieldRenderer } from "@/pages/admin/plugins/by-id/components/plugin-field-renderer";
import { m } from "@/paraglide/messages";

/**
 * Inline plugin settings for the first-run wizard. Reuses the admin config hook
 * and field renderer so a plugin that needs credentials (e.g. a TMDB token) can
 * be configured before finishing setup instead of only afterwards.
 */
export function SetupPluginConfig({ pluginId }: { pluginId: string }) {
	const { configDetails, isLoading, isError, updateConfig, isUpdating } = useAdminPluginConfig(pluginId);

	if (isLoading) return <p className="text-muted-foreground text-xs">{m.admin_plugins_loading_config()}</p>;

	if (isError || !configDetails) return <p className="text-destructive text-xs">{m.admin_plugins_failed_to_load_config()}</p>;

	if (configDetails.fields.length === 0) return <p className="text-muted-foreground text-xs">{m.setup_plugins_configure_hint()}</p>;

	// Mount the form only once the config has loaded so its state can be
	// initialized during render (no setState-in-effect).
	return <SetupPluginConfigFields configDetails={configDetails} isUpdating={isUpdating} updateConfig={updateConfig} />;
}

function SetupPluginConfigFields({
	configDetails,
	isUpdating,
	updateConfig,
}: {
	configDetails: PluginConfigDetails;
	isUpdating: boolean;
	updateConfig: (values: Record<string, unknown>) => Promise<unknown>;
}) {
	const [formValues, setFormValues] = useState<Record<string, unknown>>(() => {
		const initial: Record<string, unknown> = { ...configDetails.config };
		for (const field of configDetails.fields) {
			if (initial[field.name] === undefined && field.default !== undefined) {
				initial[field.name] = field.default;
			}
		}

		return initial;
	});
	const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				detach(() => updateConfig(formValues));
			}}
			className="flex flex-col gap-3 rounded-md border border-border bg-background/60 p-3"
		>
			<div className="grid grid-cols-1 gap-3">
				{configDetails.fields.map((field) => (
					<PluginFieldRenderer
						key={field.name}
						field={field}
						value={formValues[field.name]}
						showSecret={Boolean(showSecrets[field.name])}
						onToggleSecret={() => setShowSecrets((prev) => ({ ...prev, [field.name]: !prev[field.name] }))}
						onChange={(value) => setFormValues((prev) => ({ ...prev, [field.name]: value }))}
					/>
				))}
			</div>

			<AsyncButton
				type="submit"
				size="sm"
				isPending={isUpdating}
				pendingLabel={m.common_saving_dots()}
				className="gap-1.5 self-start text-xs"
			>
				<Save className="size-3.5" />
				{m.admin_plugins_save_config()}
			</AsyncButton>
		</form>
	);
}
