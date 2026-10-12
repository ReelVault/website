import { useEffect, useState } from "react";
import { useAdminUserProfilePreferences } from "@/client/hooks/use-admin-user-profiles";
import { AsyncButton } from "@/components/async-button";
import { GeneralPreferencesGrid } from "@/components/profile-preferences/general-preferences-grid";
import { ProfilePreferenceFields } from "@/components/profile-preferences/profile-preference-fields";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { diffPreferences, EMPTY_PREFERENCES, type ProfilePreferencesState, toPreferencesState } from "@/types/profile-preferences";

export function ProfilePreferencesEditor({ userId, profileId }: { userId: string; profileId: string }) {
	const { preferences, isLoading, updatePreferences, isSaving, resetPreferences, isResetting } = useAdminUserProfilePreferences(
		userId,
		profileId,
	);
	const [state, setState] = useState<ProfilePreferencesState>(EMPTY_PREFERENCES);

	useEffect(() => {
		if (!preferences) return;

		setState(toPreferencesState(preferences));
	}, [preferences]);

	const updateState = (patch: Partial<ProfilePreferencesState>) => {
		setState((current) => ({ ...current, ...patch }));
	};

	// Delta-only save: values the profile did not override keep inheriting the
	// admin-configured defaults.
	const handleSubmit = async () => {
		if (!preferences) return;

		await updatePreferences(diffPreferences(state, preferences));
	};

	const handleReset = async () => {
		await resetPreferences();
	};

	if (isLoading) {
		return <p className="text-muted-foreground text-sm">{m.admin_users_loading_prefs()}</p>;
	}

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				detach(handleSubmit);
			}}
			className="flex flex-col gap-6"
		>
			<GeneralPreferencesGrid preferences={state} onChange={updateState} />
			<ProfilePreferenceFields preferences={state} onChange={updateState} />
			<div className="flex gap-2">
				<AsyncButton type="submit" isPending={isSaving} pendingLabel={m.user_saving_prefs()} className="min-h-10 w-fit gap-2">
					{m.admin_users_save_prefs()}
				</AsyncButton>
				<AsyncButton
					type="button"
					isPending={isResetting}
					pendingLabel={m.common_restoring()}
					onClick={() => detach(handleReset)}
					variant="outline"
					className="min-h-10 w-fit gap-2"
				>
					{m.admin_settings_restore_default()}
				</AsyncButton>
			</div>
		</form>
	);
}
