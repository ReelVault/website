import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { getSdkErrorMessage } from "@/client/client";
import { useCreateProfile, useProfiles } from "@/client/hooks/use-profiles";
import { AppErrorState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageTitle } from "@/hooks/use-page-title";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { AVATAR_SEEDS, AVATAR_STYLES, buildDicebearAvatarUrl } from "../profiles/components/avatar-picker-constants";
import { ProfileAvatarPreview } from "../profiles/components/profile-avatar-preview";
import { ProfileAvatarSelector } from "../profiles/components/profile-avatar-selector";
import { ProfileFormInputs } from "../profiles/components/profile-form-inputs";

export default function CreateProfilePage() {
	usePageTitle(m.auth_new_profile());
	const { redirect } = useSearch({ from: "/auth/create-profile" });
	const navigate = useNavigate();
	const profilesSearch = redirect ? { redirect } : {};

	const [name, setName] = useState("");
	const [pin, setPin] = useState("");
	const [error, setError] = useState<string | null>(null);

	const createProfileMutation = useCreateProfile();
	const { profiles } = useProfiles();
	const [copyFromProfileId, setCopyFromProfileId] = useState<string | null>(null);

	const [activeStyle, setActiveStyle] = useState(AVATAR_STYLES[0]?.id ?? "adventurer-neutral");
	const [activeSeed, setActiveSeed] = useState(AVATAR_SEEDS[0] ?? "Jameson");

	const selectedAvatar = buildDicebearAvatarUrl(activeStyle, activeSeed);

	const submitProfile = async () => {
		setError(null);

		try {
			await createProfileMutation.mutateAsync({
				name: name.trim(),
				avatarUrl: selectedAvatar,
				pin: pin || undefined,
				copyPreferencesFromProfileId: copyFromProfileId ?? undefined,
			});
			await navigate({ to: "/auth/profiles", search: profilesSearch });
		} catch (submitError) {
			setError(getSdkErrorMessage(submitError) ?? m.auth_failed_to_create_profile());
		}
	};

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		if (createProfileMutation.isPending) return;

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
		<main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
			<Link
				to="/auth/profiles"
				search={profilesSearch}
				className="inline-flex min-h-11 w-fit items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				{m.common_back()}
			</Link>

			<header className="flex flex-col gap-3">
				<p className="cinema-kicker">{m.auth_personalization_label()}</p>
				<h1 className="font-extrabold font-heading text-3xl tracking-tight sm:text-4xl">{m.auth_new_profile()}</h1>
			</header>

			<form onSubmit={handleSubmit} className="flex flex-col gap-8">
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

				{profiles.length > 0 && (
					<div className="flex flex-col gap-2">
						<span className="font-semibold text-muted-foreground text-sm">{m.profile_copy_from_profile()}</span>
						<Select value={copyFromProfileId} onValueChange={(value) => setCopyFromProfileId(value)}>
							<SelectTrigger aria-label={m.profile_copy_from_profile()} className="w-full sm:w-72">
								<SelectValue placeholder={m.profile_copy_none()} />
							</SelectTrigger>
							<SelectContent>
								{profiles.map((profile) => (
									<SelectItem key={profile.id} value={profile.id}>
										{profile.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{error && <AppErrorState title={m.auth_failed_to_create_profile_short()} description={error} />}

				<AsyncButton
					type="submit"
					isPending={createProfileMutation.isPending}
					pendingLabel={m.admin_users_creating_profile()}
					disabled={!name.trim()}
					className="h-12 w-full rounded-xl font-semibold text-base sm:w-auto sm:self-end sm:px-8"
				>
					{m.admin_users_save_profile()}
				</AsyncButton>
			</form>
		</main>
	);
}
