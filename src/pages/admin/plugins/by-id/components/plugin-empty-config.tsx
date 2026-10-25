import { Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { m } from "@/paraglide/messages";

interface PluginEmptyConfigProps {
	pluginName: string;
}

export function PluginEmptyConfig({ pluginName }: PluginEmptyConfigProps) {
	return (
		<Card variant="subtle">
			<CardContent className="flex flex-col items-center justify-center text-center">
				<div className="bg-primary/10 text-primary rounded-full p-3">
					<Info className="size-6" />
				</div>
				<h3 className="text-foreground mt-4 text-base font-bold">{m.admin_plugins_no_config_heading()}</h3>
				<p className="text-muted-foreground mt-1 max-w-md text-xs">
					{m.admin_plugins_no_config_desc_1()} <strong className="text-foreground">{pluginName}</strong>{" "}
					{m.admin_plugins_no_config_desc_2()}
				</p>
				<Button variant="outline" size="sm" nativeButton={false} render={<Link to={"/admin/plugins"} />} className="mt-6">
					{m.admin_plugins_back()}
				</Button>
			</CardContent>
		</Card>
	);
}
