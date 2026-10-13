import { useReceivedNotificationTypes } from "@/client/hooks/use-notifications";
import { useProfilePreferences } from "@/client/hooks/use-profiles";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

/** Notification types this profile has muted: they stop interrupting and leave the profile's list and badge. */
export function MutedNotificationTypes({ profileId }: { profileId: string }) {
	const { preferences, updatePreferences, isSaving } = useProfilePreferences(profileId);
	const { types, isLoading } = useReceivedNotificationTypes();
	const muted = (preferences?.mutedNotificationTypes ?? "")
		.split(",")
		.map((type) => type.trim())
		.filter((type) => type.length > 0);
	const mutedTypes = new Set(muted);

	const toggle = (type: string, checked: boolean) => {
		const next = checked ? [...muted, type] : muted.filter((item) => item !== type);
		detach(updatePreferences({ mutedNotificationTypes: [...new Set(next)].join(",") }));
	};

	if (!isLoading && types.length === 0) {
		return <p className="text-muted-foreground text-sm">{m.settings_muted_notifications_empty()}</p>;
	}

	return (
		<fieldset className="flex flex-col gap-2">
			<legend className="font-medium text-sm">{m.settings_muted_notifications()}</legend>
			<p className="text-muted-foreground text-xs">{m.settings_muted_notifications_hint()}</p>
			{types.map((type) => (
				<label key={type} className="flex min-h-10 cursor-pointer items-center gap-2 text-sm sm:min-h-0">
					<input
						type="checkbox"
						className="size-4 accent-primary"
						checked={mutedTypes.has(type)}
						disabled={isSaving}
						onChange={(event) => toggle(type, event.currentTarget.checked)}
					/>
					<span className="font-mono text-xs">{type}</span>
				</label>
			))}
		</fieldset>
	);
}
