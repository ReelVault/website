import type { PluginTabHostName } from "reelvault-sdk/plugin";
import { resolvePluginText, usePluginTabs } from "@/client/hooks/use-plugin-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPluginIcon } from "./icons";
import { PluginSurface } from "./surface";

interface PluginTabHostProps {
	host: PluginTabHostName;
	className?: string;
	contentClassName?: string;
	/** Params forwarded to each tab's page surface (e.g. the current metadata id). */
	params?: Record<string, string>;
}

/** Trigger + content pair for every tab a plugin contributes to `host`. Renders nothing when empty. */
export function PluginTabTriggers({ host }: { host: PluginTabHostName }) {
	const { tabs } = usePluginTabs(host);

	if (tabs.length === 0) return null;

	return (
		<>
			{tabs.map((tab) => {
				const Icon = getPluginIcon(tab.icon);
				const value = `${tab.pluginId}:${tab.id}`;

				return (
					<TabsTrigger key={value} value={value} className="gap-1.5">
						<Icon className="size-3.5" aria-hidden="true" />
						{resolvePluginText(tab.label, tab.defaultLocale)}
					</TabsTrigger>
				);
			})}
		</>
	);
}

export function PluginTabContents({
	host,
	className,
	params,
}: {
	host: PluginTabHostName;
	className?: string;
	params?: Record<string, string>;
}) {
	const { tabs } = usePluginTabs(host);

	if (tabs.length === 0) return null;

	return (
		<>
			{tabs.map((tab) => {
				const value = `${tab.pluginId}:${tab.id}`;

				return (
					<TabsContent key={value} value={value} className={className}>
						<PluginSurface
							pluginId={tab.pluginId}
							tag={tab.page.tag}
							schema={tab.page.schema}
							page={tab.page.id}
							params={params}
							className="min-h-96 w-full"
						/>
					</TabsContent>
				);
			})}
		</>
	);
}

/**
 * Renders tabs contributed by plugins into a named host surface. Renders
 * nothing when no plugin contributes a tab, so mounting it is always safe.
 */
export function PluginTabHost({ host, className, contentClassName, params }: PluginTabHostProps) {
	const { tabs } = usePluginTabs(host);

	if (tabs.length === 0) return null;

	const first = tabs[0];
	if (!first) return null;

	return (
		<Tabs defaultValue={`${first.pluginId}:${first.id}`} className={className}>
			<TabsList className="w-full justify-start overflow-x-auto">
				<PluginTabTriggers host={host} />
			</TabsList>
			<PluginTabContents host={host} className={contentClassName} params={params} />
		</Tabs>
	);
}
