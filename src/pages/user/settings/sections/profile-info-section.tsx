import { KeyRound, ShieldCheck, User } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useUpdateProfile, useUploadProfileAvatar } from "@/client/hooks/use-profiles";
import { AsyncButton } from "@/components/async-button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { detach } from "@/lib/detach";
import { AvatarPicker } from "@/pages/user/components/user-avatar";
import { m } from "@/paraglide/messages";

interface ProfileInfoSectionProps {
	profile: {
		id: string;
		name: string;
		avatarUrl?: string | null;
	};
}

export function ProfileInfoSection({ profile }: ProfileInfoSectionProps) {
	const updateProfile = useUpdateProfile();
	const uploadAvatar = useUploadProfileAvatar();

	const [name, setName] = useState(profile.name);
	const [pin, setPin] = useState("");

	// Adopt a changed profile name while rendering (React's documented
	// "adjust state when props change" pattern).
	const [lastSyncedName, setLastSyncedName] = useState(profile.name);
	if (profile.name !== lastSyncedName) {
		setLastSyncedName(profile.name);
		setName(profile.name);
	}

	const hasChanges = Boolean(name.trim() && (name.trim() !== profile.name || pin.length === 4));
	// Partial PIN (1–3 digits) would be silently dropped on submit — block the
	// button until the user completes or clears it.
	const hasPartialPin = pin.length > 0 && pin.length < 4;

	const submitProfile = async () => {
		await updateProfile.mutateAsync({
			id: profile.id,
			data: { name: name.trim(), ...(pin.length === 4 ? { pin } : {}) },
		});
		setPin("");
	};

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!hasChanges || updateProfile.isPending) return;

		detach(submitProfile());
	};

	const handleAvatarSave = async (avatarUrl: string) => {
		if (updateProfile.isPending) return;

		await updateProfile.mutateAsync({ id: profile.id, data: { avatarUrl } });
	};

	const handleAvatarUpload = async (file: File) => {
		const result = await uploadAvatar.mutateAsync({ profileId: profile.id, file });

		return result.avatarUrl;
	};

	return (
		<form onSubmit={handleSubmit} className="cinema-surface overflow-hidden p-5 sm:p-8">
			<div className="flex flex-col gap-12">
				<div className="flex flex-col items-center gap-10 sm:flex-row">
					<AvatarPicker currentAvatar={profile.avatarUrl ?? undefined} onSave={handleAvatarSave} onUpload={handleAvatarUpload} />
					<div className="text-center sm:text-left">
						<h1 className="font-bold text-2xl tracking-tight">{profile.name}</h1>
						<p className="mt-2 flex items-center justify-center gap-2 font-medium text-muted-foreground text-xs sm:justify-start">
							<ShieldCheck aria-hidden="true" className="size-4 text-primary" />
							{m.user_active_profile()}
						</p>
						<p className="mt-4 max-w-md text-muted-foreground text-sm leading-relaxed">{m.user_profile_avatar_hint()}</p>
					</div>
				</div>

				<Field className="max-w-xl gap-3">
					<FieldLabel htmlFor="profile-name">{m.user_display_name()}</FieldLabel>
					<InputGroup className="h-11 rounded-xl bg-background/70">
						<InputGroupAddon>
							<User className="size-4" aria-hidden="true" />
						</InputGroupAddon>
						<InputGroupInput
							id="profile-name"
							name="profile-name"
							type="text"
							autoComplete="nickname"
							value={name}
							onChange={(event) => setName(event.target.value)}
							className="h-10 px-2 font-medium"
						/>
					</InputGroup>
				</Field>
				<Field className="max-w-xl gap-3">
					<FieldLabel htmlFor="profile-pin">{m.user_new_pin_optional()}</FieldLabel>
					<InputGroup className="h-11 rounded-xl bg-background/70">
						<InputGroupAddon>
							<KeyRound className="size-4" aria-hidden="true" />
						</InputGroupAddon>
						<InputGroupInput
							id="profile-pin"
							name="profile-pin"
							type="password"
							inputMode="numeric"
							autoComplete="new-password"
							maxLength={4}
							value={pin}
							onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
							placeholder={m.admin_users_pin_keep_empty()}
							className="h-10 px-2 font-medium"
						/>
					</InputGroup>
					<FieldDescription>{m.user_pin_exact_digits()}</FieldDescription>
					{pin.length > 0 && pin.length !== 4 && (
						<p role="alert" aria-live="polite" className="text-destructive text-xs">
							{m.user_pin_4_digits()}
						</p>
					)}
				</Field>
			</div>

			<div className="mt-12 flex items-center justify-end border-border border-t pt-8">
				<AsyncButton
					type="submit"
					disabled={!hasChanges || hasPartialPin}
					isPending={updateProfile.isPending}
					pendingLabel={m.common_saving_dots()}
					className="min-h-11 px-6"
				>
					{m.admin_users_save_profile()}
				</AsyncButton>
			</div>
		</form>
	);
}
