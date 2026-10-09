import { useState } from "react";
import { useCopyProfilePreferences, useProfiles } from "@/client/hooks/use-profiles";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

interface CopyPreferencesDialogProps {
	profileId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/** Replaces this profile's settings with the settings of another profile of the same account. */
export function CopyPreferencesDialog({ profileId, open, onOpenChange }: CopyPreferencesDialogProps) {
	const { profiles } = useProfiles();
	const copyPreferences = useCopyProfilePreferences(profileId);
	const [sourceId, setSourceId] = useState<string | null>(null);
	const sources = profiles.filter((profile) => profile.id !== profileId);

	const submit = async () => {
		if (!sourceId) return;

		try {
			await copyPreferences.mutateAsync(sourceId);
			onOpenChange(false);
		} catch {
			// Toast is handled by hook
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{m.profile_copy_preferences_title()}</DialogTitle>
					<DialogDescription>{m.profile_copy_preferences_description()}</DialogDescription>
				</DialogHeader>

				<Select value={sourceId} onValueChange={(value) => setSourceId(value)}>
					<SelectTrigger aria-label={m.profile_copy_preferences_source()}>
						<SelectValue placeholder={m.profile_copy_preferences_source()} />
					</SelectTrigger>
					<SelectContent>
						{sources.map((profile) => (
							<SelectItem key={profile.id} value={profile.id}>
								{profile.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{m.common_cancel()}
					</Button>
					<Button disabled={!sourceId || copyPreferences.isPending} onClick={() => detach(submit())}>
						{m.profile_copy_preferences_submit()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
