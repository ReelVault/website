import { m } from "@/paraglide/messages";

interface SetupStepSummaryProps {
	showToken: boolean;
	setupToken: string;
	name: string;
	email: string;
}

export function SetupStepSummary({ showToken, setupToken, name, email }: SetupStepSummaryProps) {
	return (
		<div className="flex flex-col gap-3 rounded-md border border-border bg-muted/20 p-4 text-sm">
			{showToken && (
				<p>
					<span className="text-muted-foreground">{m.setup_token_field_label()}</span>{" "}
					<span className="font-mono">{m.setup_token_masked({ token: setupToken.slice(0, 4) })}</span>
				</p>
			)}
			<p>
				<span className="text-muted-foreground">{m.setup_administrator_label()}</span> {name}
			</p>
			<p>
				<span className="text-muted-foreground">{m.setup_email_label()}</span> {email}
			</p>
			<p className="text-muted-foreground text-xs">{m.setup_admin_account_desc()}</p>
		</div>
	);
}
