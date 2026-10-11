import type { Profile } from "@reelvault/sdk";
import { cn } from "cn";
import { Lock, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getSdkErrorMessage, resolveApiAssetUrl } from "@/client/client";
import { useSwitchProfile } from "@/client/hooks/use-profiles";
import { AppErrorState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

export function PinVerificationModal({
	profile,
	isOpen,
	onClose,
	onSuccess,
}: {
	profile: Profile | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}) {
	const [pin, setPin] = useState("");
	const [error, setError] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const switchProfileMutation = useSwitchProfile();

	// Clean up on close — Base UI calls onOpenChange(false) on every dismiss.
	const handleClose = () => {
		setPin("");
		setError("");
		onClose();
	};

	useEffect(() => {
		const timeout = isOpen ? window.setTimeout(() => inputRef.current?.focus(), 100) : undefined;

		return () => {
			if (timeout !== undefined) window.clearTimeout(timeout);
		};
	}, [isOpen]);

	const submitPin = async () => {
		if (!profile || pin.length < 4 || pin.length > 8) {
			setError(m.auth_enter_pin_range());

			return;
		}

		try {
			await switchProfileMutation.mutateAsync({ profileId: profile.id, pin });
			onSuccess();
			handleClose();
		} catch (switchError) {
			setError(getSdkErrorMessage(switchError) ?? m.auth_invalid_pin());
			setPin("");
		}
	};

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (switchProfileMutation.isPending) return;

		detach(submitPin());
	};

	if (!profile) return null;

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent size="md" className="overflow-hidden p-0">
				<DialogHeader className="border-b">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
							<Lock className="size-5" aria-hidden="true" />
						</div>
						<DialogTitle>{m.auth_profile_protected()}</DialogTitle>
					</div>
					<DialogDescription className="sr-only">{m.auth_enter_pin_to_switch({ profileName: profile.name })}</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="flex flex-col gap-8 p-5 sm:p-8">
					<div className="flex flex-col items-center gap-4 text-center">
						<Avatar size="lg" className="size-24 after:hidden">
							{profile.avatarUrl && <AvatarImage src={resolveApiAssetUrl(profile.avatarUrl)} alt="" />}
							<AvatarFallback>
								<User className="size-8 text-muted-foreground/40" />
							</AvatarFallback>
						</Avatar>
						<div>
							<h3 className="font-bold text-lg">{profile.name}</h3>
							<p className="font-medium text-muted-foreground text-xs">{m.auth_enter_pin()}</p>
						</div>
					</div>

					<Field data-invalid={Boolean(error)}>
						<Label className="sr-only" htmlFor="profile-pin-verification">
							{m.auth_pin_code()}
						</Label>
						<Button
							size="inline"
							type="button"
							variant="ghost"
							className="w-full justify-center sm:min-h-8"
							onClick={() => inputRef.current?.focus()}
						>
							{Array.from({ length: Math.min(Math.max(pin.length, 4), 8) }, (_unused, slot) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: static decorative PIN slots
									key={slot}
									className={cn(
										"flex size-8 items-center justify-center rounded-xl border-2 transition-[background-color,border-color,transform] duration-300 sm:size-14 sm:rounded-2xl",
										{
											"border-primary bg-primary/10 shadow-lg shadow-primary/20": pin.length > slot,
											"border-border": pin.length <= slot,
										},
									)}
								>
									{pin[slot] && <span className="size-3 rounded-full bg-primary" />}
								</span>
							))}
						</Button>
						<Input
							ref={inputRef}
							id="profile-pin-verification"
							name="profile-pin"
							type="password"
							inputMode="numeric"
							autoComplete="one-time-code"
							value={pin}
							maxLength={8}
							aria-invalid={Boolean(error)}
							className="sr-only"
							onChange={(event) => {
								setPin(event.target.value.replace(/\D/g, ""));
								setError("");
							}}
						/>
						{error && <AppErrorState title={error} className="mt-2" />}
					</Field>

					<AsyncButton
						type="submit"
						className="w-full rounded-2xl py-5 font-black uppercase tracking-widest"
						isPending={switchProfileMutation.isPending}
						pendingLabel={m.auth_verifying()}
					>
						{m.auth_unlock()}
					</AsyncButton>
				</form>
			</DialogContent>
		</Dialog>
	);
}
