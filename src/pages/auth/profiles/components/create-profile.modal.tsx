import { useState } from "react";
import { getSdkErrorMessage } from "@/client/client";
import { useCreateProfile } from "@/client/hooks/use-profiles";
import { AppErrorState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { AVATAR_SEEDS, AVATAR_STYLES, buildDicebearAvatarUrl } from "./avatar-picker-constants";
import { ProfileAvatarPreview } from "./profile-avatar-preview";
import { ProfileAvatarSelector } from "./profile-avatar-selector";
import { ProfileFormInputs } from "./profile-form-inputs";

interface CreateProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export function CreateProfileModal({ isOpen, onClose, onSuccess }: CreateProfileModalProps) {
	const [name, setName] = useState("");
	const [pin, setPin] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const createProfileMutation = useCreateProfile();

	const [activeStyle, setActiveStyle] = useState(AVATAR_STYLES[0]?.id ?? "adventurer-neutral");
	const [activeSeed, setActiveSeed] = useState(AVATAR_SEEDS[0] ?? "Jameson");

	const selectedAvatar = buildDicebearAvatarUrl(activeStyle, activeSeed);

	const submitProfile = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			await createProfileMutation.mutateAsync({
				name: name.trim(),
				avatarUrl: selectedAvatar,
				pin: pin || undefined,
			});
			onSuccess();
			onClose();
			setName("");
			setPin("");
		} catch (submitError) {
			setError(getSdkErrorMessage(submitError) ?? m.auth_failed_to_create_profile());
		}

		setIsSubmitting(false);
	};

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		if (isSubmitting) return;

		if (!name.trim()) {
			setError(m.auth_profile_name_required());

			return;
		}

		detach(submitProfile());
	};

	const randomizeAvatar = () => {
		setActiveStyle(AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)]?.id ?? "adventurer-neutral");
		setActiveSeed(AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)] ?? "Jameson");
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden rounded-3xl border-border p-0 shadow-2xl md:max-w-4xl">
				<DialogHeader className="border-border border-b bg-linear-to-r from-primary/10 via-transparent to-transparent p-5 sm:p-8">
					<div className="text-left">
						<span className="block font-bold text-[10px] text-primary/70 uppercase tracking-[0.3em]">{m.auth_personalization_label()}</span>
						<DialogTitle className="font-black text-2xl text-foreground uppercase tracking-tight">{m.auth_new_profile()}</DialogTitle>
					</div>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-8 p-5 sm:p-8">
					<div className="flex min-w-0 flex-col gap-8 md:flex-row">
						{/* LEFT SIDE: preview and details */}
						<div className="flex min-w-0 flex-col items-center gap-6 md:w-1/3">
							<ProfileAvatarPreview avatarUrl={selectedAvatar} onRandomize={randomizeAvatar} />
							<ProfileFormInputs
								name={name}
								pin={pin}
								onNameChange={(val) => {
									setName(val);
									setError(null);
								}}
								onPinChange={setPin}
							/>
						</div>

						{/* RIGHT SIDE: style and seed selection */}
						<ProfileAvatarSelector
							activeStyle={activeStyle}
							activeSeed={activeSeed}
							onSelectStyle={setActiveStyle}
							onSelectSeed={setActiveSeed}
						/>
					</div>

					{/* TODO: sort this out */}
					{error && <AppErrorState title={m.auth_failed_to_create_profile_short()} description={error} />}

					<AsyncButton
						type="submit"
						isPending={isSubmitting}
						pendingLabel={m.admin_users_creating_profile()}
						disabled={!name.trim()}
						className="w-full rounded-2xl py-5 font-black uppercase tracking-widest"
					>
						{m.admin_users_save_profile()}
					</AsyncButton>
				</form>
			</DialogContent>
		</Dialog>
	);
}
