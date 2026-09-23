import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Copy, TriangleAlert, XCircle } from "lucide-react";
import { reelvault } from "@/client/client";
import { adminKeys } from "@/client/utils/query-keys";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { copyToClipboard } from "@/utils/clipboard-utils";

function CopyBlock({ label, text }: { label: string; text: string }) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between">
				<p className="font-medium text-xs">{label}</p>
				<Button variant="ghost" size="sm" onClick={() => detach(copyToClipboard(text, label))}>
					<Copy className="size-3.5" aria-hidden="true" /> {m.common_copy()}
				</Button>
			</div>
			<pre className="max-h-48 overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-[11px] leading-relaxed">
				{text}
			</pre>
		</div>
	);
}

function CheckIcon({ ok }: { ok: boolean | null }) {
	if (ok === true) return <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />;

	if (ok === false) return <XCircle className="size-4 shrink-0 text-destructive" aria-hidden="true" />;

	return <TriangleAlert className="size-4 shrink-0 text-warning" aria-hidden="true" />;
}

/** Remote-access wizard: checks + ready-to-paste reverse-proxy configs. */
export function RemoteAccessCard() {
	const diagnosticsQuery = useQuery({
		queryKey: adminKeys.remoteAccessDiagnostics(),
		queryFn: () => reelvault.admin.getRemoteAccessDiagnostics(),
		staleTime: 30_000,
	});

	if (diagnosticsQuery.isPending) {
		return (
			<div className="rounded-xl border border-border bg-card p-4 text-muted-foreground text-sm" aria-busy="true">
				{m.admin_settings_checking_remote_config()}
			</div>
		);
	}

	if (diagnosticsQuery.isError) {
		return (
			<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
				{m.admin_settings_remote_diagnostics_failed()}
				<Button variant="ghost" size="sm" onClick={() => detach(diagnosticsQuery.refetch())}>
					{m.common_try_again()}
				</Button>
			</div>
		);
	}

	const { checks, generated, publicUrl, bindHost } = diagnosticsQuery.data;

	return (
		<div className="space-y-4 rounded-xl border border-border bg-card p-4">
			<div className="space-y-2">
				{checks.map((check) => (
					<div key={check.id} className="flex items-start gap-2.5">
						<CheckIcon ok={check.ok} />
						<div className="min-w-0">
							<p className="font-medium text-foreground text-sm">{check.title}</p>
							<p className="text-muted-foreground text-xs">{check.detail}</p>
						</div>
					</div>
				))}
			</div>

			<div className="space-y-1 rounded-lg border border-border/60 bg-background/60 p-3 text-xs">
				<div className="flex justify-between gap-2">
					<span className="text-muted-foreground">{m.admin_settings_remote_public_url()}</span>
					<span className="truncate font-mono text-foreground">{publicUrl ?? "—"}</span>
				</div>
				<div className="flex justify-between gap-2">
					<span className="text-muted-foreground">{m.admin_settings_remote_bind_host()}</span>
					<span className="truncate font-mono text-foreground">{bindHost}</span>
				</div>
			</div>

			<div className="space-y-3 border-border/60 border-t pt-3">
				<CopyBlock label={m.admin_settings_caddy_recommended()} text={generated.caddy} />
				<CopyBlock label="nginx" text={generated.nginx} />
				<CopyBlock label=".env" text={generated.env} />
			</div>
		</div>
	);
}
