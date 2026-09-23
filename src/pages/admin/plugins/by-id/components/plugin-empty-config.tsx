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
		<Card className="border-border/80 bg-card/60">
			<CardContent className="flex flex-col items-center justify-center p-8 text-center">
				<div className="rounded-full bg-primary/10 p-3 text-primary">
					<Info className="size-6" />
				</div>
				<h3 className="mt-4 font-bold text-base text-foreground">{m.admin_plugins_no_config_heading()}</h3>
				<p className="mt-1 max-w-md text-muted-foreground text-xs">
					{m.admin_plugins_no_config_desc_1()} <strong className="text-foreground">{pluginName}</strong>{" "}
					{m.admin_plugins_no_config_desc_2()}
				</p>
				<Button variant="outline" size="sm" nativeButton={false} render={<Link to={"/admin/plugins"} />} className="mt-6 text-xs">
					{m.admin_plugins_back()}
				</Button>
			</CardContent>
		</Card>
	);
}
