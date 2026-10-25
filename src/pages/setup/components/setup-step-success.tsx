import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

export function SetupStepSuccess() {
	return (
		<div className="flex flex-col items-center gap-4 py-8 text-center">
			<div className="bg-success/10 text-success flex size-12 items-center justify-center rounded-full">
				<Check className="size-6" aria-hidden="true" />
			</div>
			<h2 className="text-xl font-semibold">{m.setup_success_title()}</h2>
			<p className="text-muted-foreground max-w-md text-sm">{m.setup_success_desc()}</p>
			<Button nativeButton={false} render={<Link to="/dashboard" />}>
				{m.setup_go_to_dashboard()}
			</Button>
		</div>
	);
}
