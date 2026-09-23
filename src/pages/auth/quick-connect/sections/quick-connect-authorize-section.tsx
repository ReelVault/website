import { Link } from "@tanstack/react-router";
import { CheckCircle2, Sparkles, Tv } from "lucide-react";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface QuickConnectAuthorizeSectionProps {
	user: { name: string };
	profile?: { name: string } | null;
	urlCode: string;
	authorizedSuccess: boolean;
	isPending: boolean;
	onAuthorize: () => void;
}

export function QuickConnectAuthorizeSection({
	user,
	profile,
	urlCode,
	authorizedSuccess,
	isPending,
	onAuthorize,
}: QuickConnectAuthorizeSectionProps) {
	return (
		<section className="relative overflow-hidden rounded-3xl border border-border bg-card/85 p-8 shadow-2xl sm:p-10">
			<div className="flex flex-col items-center gap-6 text-center">
				<div className="flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
					<Tv className="size-8" aria-hidden="true" />
				</div>

				<div>
					<h1 className="font-black text-3xl tracking-tight sm:text-4xl">{m.auth_device_authorization()}</h1>
					<p className="mt-2 text-muted-foreground text-sm">{m.auth_qr_scanned_from_device()}</p>
				</div>

				{authorizedSuccess ? (
					<div className="flex flex-col items-center gap-4 rounded-2xl border border-success/20 bg-success/10 p-6 text-success">
						<CheckCircle2 className="size-12" />
						<div>
							<p className="font-bold text-lg">{m.auth_device_linked()}</p>
							<p className="text-muted-foreground text-xs">{m.auth_second_device_notice()}</p>
						</div>
						<Link to="/" className="mt-2">
							<Button className="rounded-xl">{m.auth_go_to_library()}</Button>
						</Link>
					</div>
				) : (
					<div className="flex w-full flex-col gap-6">
						<div className="flex flex-col items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-6">
							<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.auth_detected_device_code()}</span>
							<span className="font-black font-mono text-4xl text-primary tracking-widest sm:text-5xl">{urlCode}</span>
							<span className="text-muted-foreground text-xs">
								{m.auth_device_logged_in_note()}
								<strong>{user.name}</strong>
								{m.auth_quick_connect_as_profile({ label: m.auth_quick_connect_profile_label(), profile: profile?.name ?? "" })}
							</span>
						</div>

						<AsyncButton
							type="button"
							className="w-full rounded-2xl py-6 font-black uppercase tracking-widest"
							onClick={onAuthorize}
							isPending={isPending}
							pendingLabel="Autoryzacja…"
						>
							<Sparkles className="size-5" />
							{m.auth_authorize_device()}
						</AsyncButton>

						<Link to="/" className="text-muted-foreground text-sm hover:underline">
							{m.auth_cancel_to_library()}
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}
