import { useNavigate } from "@tanstack/react-router";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { useDeleteProfile } from "@/client/hooks/use-profiles";
import { AppEmptyState, AppLoadingState } from "@/components/app-states";
import { m } from "@/paraglide/messages";
import { UserPageHeader } from "../components/user-ui";
import { DangerZoneSection } from "./sections/danger-zone-section";
import { GeneralPreferencesSection } from "./sections/general-preferences-section";
import { PlaybackPreferencesSection } from "./sections/playback-preferences-section";
import { ProfileInfoSection } from "./sections/profile-info-section";
import { TwoFactorSection } from "./sections/two-factor-section";

export default function UserSettingsPage() {
	const navigate = useNavigate();
	const { user, profile, isLoading } = useCurrentUser();
	const deleteProfile = useDeleteProfile();

	const handleDeleteProfile = async () => {
		if (!profile) return;

		await deleteProfile.mutateAsync(profile.id);
		if (typeof document !== "undefined") {
			// biome-ignore lint/suspicious/noDocumentCookie: synchronous cookie clearing has no platform alternative (cookieStore is async); best-effort profile switch cleanup
			document.cookie = "current_profile_id=; Max-Age=0; path=/;";
		}

		await navigate({ to: "/auth/profiles" });
	};

	if (isLoading) {
		return <AppLoadingState label={m.user_loading_profile_settings()} className="min-h-screen" />;
	}

	if (!profile) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<AppEmptyState title={m.user_no_profile_selected()} description={m.user_select_profile_to_edit()} />
			</div>
		);
	}

	return (
		<div className="relative flex flex-col gap-8">
			<UserPageHeader eyebrow={m.user_settings_eyebrow()} title={m.user_profile_page_title()} description={m.user_tune_profile_hint()} />

			<ProfileInfoSection profile={profile} />

			<GeneralPreferencesSection profileId={profile.id} />

			<PlaybackPreferencesSection profileId={profile.id} />

			<TwoFactorSection twoFactorEnabled={user?.twoFactorEnabled === true} />

			<DangerZoneSection profileName={profile.name} onDelete={handleDeleteProfile} />
		</div>
	);
}
