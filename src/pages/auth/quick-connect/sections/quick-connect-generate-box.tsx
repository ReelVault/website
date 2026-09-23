import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";
import { getSdkErrorMessage } from "@/client/client";
import { useQuickConnectGenerate } from "@/client/hooks/use-auth";
import { AsyncButton } from "@/components/async-button";
import { QrCode } from "@/components/qr-code";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { toast } from "@/utils/toast-facade";
import { QuickConnectCountdown } from "../components/quick-connect-countdown";

interface GeneratedCodeState {
	code: string;
	expiresAt: number;
}

export function QuickConnectGenerateBox() {
	const generateMutation = useQuickConnectGenerate();
	const [generatedState, setGeneratedState] = useState<GeneratedCodeState | null>(null);
	const { hasCopied, copy, reset } = useCopyToClipboard();

	const handleGenerate = () => {
		if (generateMutation.isPending) return;

		generateMutation.mutate(undefined, {
			onSuccess: (res) => {
				setGeneratedState({
					code: res.code,
					expiresAt: Date.now() + res.expiresIn * 1000,
				});
				reset();
				toast.success(m.auth_login_code_generated());
			},
			onError: (error) => {
				toast.error(getSdkErrorMessage(error));
			},
		});
	};

	const copyCode = async () => {
		if (!generatedState) return;

		try {
			await copy(generatedState.code);
			toast.success(m.auth_code_copied());
		} catch (error) {
			console.error("Clipboard copy failed", error);
		}
	};
	const handleCopy = () => {
		detach(copyCode());
	};

	return (
		<div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm">
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
						<KeyRound className="size-5" aria-hidden="true" />
					</div>
					<div>
						<h3 className="font-bold text-sm">{m.auth_generate_login_code()}</h3>
						<p className="text-muted-foreground text-xs">{m.auth_use_code_hint()}</p>
					</div>
				</div>

				{generatedState ? (
					<div className="flex flex-col items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
						<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.auth_code_valid_for()}</span>
						<div className="flex items-center gap-2 font-black font-mono text-3xl text-primary tracking-widest sm:text-4xl">
							{generatedState.code}
						</div>
						<div className="my-1 flex justify-center">
							<QrCode
								value={`${typeof window !== "undefined" ? window.location.origin : ""}/quick-connect?redeem=${generatedState.code}`}
								size={140}
							/>
						</div>
						<QuickConnectCountdown expiresAt={generatedState.expiresAt} onExpire={() => setGeneratedState(null)} gapClass="gap-1.5" />

						<div className="mt-2 flex w-full gap-2">
							<Button type="button" variant="outline" size="sm" className="flex-1 gap-2" onClick={handleCopy}>
								{hasCopied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
								{hasCopied ? m.auth_copied_word() : m.auth_copy_code()}
							</Button>
							<Button type="button" variant="ghost" size="sm" onClick={handleGenerate} disabled={generateMutation.isPending}>
								{m.auth_new_code()}
							</Button>
						</div>
					</div>
				) : (
					<p className="text-muted-foreground text-sm">{m.auth_quick_connect_explain()}</p>
				)}
			</div>

			{!generatedState && (
				<div className="mt-4">
					<AsyncButton
						type="button"
						variant="outline"
						className="w-full rounded-xl"
						onClick={handleGenerate}
						isPending={generateMutation.isPending}
						pendingLabel={m.auth_generating()}
					>
						<KeyRound className="size-4" aria-hidden="true" />
						{m.auth_generate_quick_code()}
					</AsyncButton>
				</div>
			)}
		</div>
	);
}
