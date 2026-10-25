import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Copy, TriangleAlert, XCircle } from "lucide-react";
import { reelvault } from "@/client/client";
import { adminKeys } from "@/client/utils/query-keys";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { copyToClipboard } from "@/utils/clipboard-utils";
import { translateByKey } from "@/utils/translate-error";

function CopyBlock({ label, text }: { label: string; text: string }) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between">
				<p className="text-xs font-medium">{label}</p>
				<Button variant="ghost" size="sm" onClick={() => detach(copyToClipboard(text, label))}>
					<Copy className="size-3.5" aria-hidden="true" /> {m.common_copy()}
				</Button>
			</div>
			<pre className="border-border bg-background max-h-48 overflow-auto rounded-lg border p-3 font-mono text-xs leading-relaxed">
				{text}
			</pre>
		</div>
	);
}

function CheckIcon({ ok }: { ok: boolean | null }) {
	if (ok === true) return <CheckCircle2 className="text-success size-4 shrink-0" aria-hidden="true" />;

	if (ok === false) return <XCircle className="text-destructive size-4 shrink-0" aria-hidden="true" />;

	return <TriangleAlert className="text-warning size-4 shrink-0" aria-hidden="true" />;
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
			<div className="border-border bg-card text-muted-foreground rounded-xl border p-4 text-sm" aria-busy="true">
				{m.admin_settings_checking_remote_config()}
			</div>
		);
	}

	if (diagnosticsQuery.isError) {
		return (
			<div className="border-destructive/30 bg-destructive/10 rounded-xl border p-4 text-sm">
				{m.admin_settings_remote_diagnostics_failed()}
				<Button variant="ghost" size="sm" onClick={() => detach(diagnosticsQuery.refetch())}>
					{m.common_try_again()}
				</Button>
			</div>
		);
	}

	const { checks, generated, publicUrl, bindHost } = diagnosticsQuery.data;

	return (
		<div className="border-border bg-card space-y-4 rounded-xl border p-4">
			<div className="space-y-2">
				{checks.map((check) => (
					<div key={check.id} className="flex items-start gap-2.5">
						<CheckIcon ok={check.ok} />
						<p className="text-foreground min-w-0 text-sm font-medium">{translateByKey(check.code, check.params)}</p>
					</div>
				))}
			</div>

			<div className="border-border/60 bg-background/60 space-y-1 rounded-lg border p-3 text-xs">
				<div className="flex justify-between gap-2">
					<span className="text-muted-foreground">{m.admin_settings_remote_public_url()}</span>
					<span className="text-foreground truncate font-mono">{publicUrl ?? "—"}</span>
				</div>
				<div className="flex justify-between gap-2">
					<span className="text-muted-foreground">{m.admin_settings_remote_bind_host()}</span>
					<span className="text-foreground truncate font-mono">{bindHost}</span>
				</div>
			</div>

			<div className="border-border/60 space-y-3 border-t pt-3">
				<CopyBlock label={m.admin_settings_caddy_recommended()} text={generated.caddy} />
				<CopyBlock label="nginx" text={generated.nginx} />
				<CopyBlock label=".env" text={generated.env} />
			</div>
		</div>
	);
}
