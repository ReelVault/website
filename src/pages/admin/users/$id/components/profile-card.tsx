import { Check, Copy, Key, Lock, Pencil, Trash2, Unlock } from "lucide-react";
import { useState } from "react";
import type { AdminUserProfile } from "@/client/hooks/use-admin-user-profiles";
import { AsyncButton } from "@/components/async-button";
import { ConfirmAction } from "@/components/confirm-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { formatDateTime } from "@/utils/format-utils";
import { ProfilePreferencesEditor } from "./profile-preferences-editor";

interface ProfileCardProps {
	userId: string;
	profile: AdminUserProfile;
	onSave: (input: { profileId: string; body: { name?: string; pin?: string | null } }) => Promise<unknown>;
	onDelete: (profileId: string) => Promise<unknown>;
	disabled: boolean;
	isSaving: boolean;
}

export function ProfileCard({ userId, profile, onSave, onDelete, disabled, isSaving }: ProfileCardProps) {
	// react-doctor-disable-next-line react-doctor/no-derived-useState -- intentional initial state for form editing
	const [name, setName] = useState(profile.name);
	const [pin, setPin] = useState("");
	const [preferencesOpen, setPreferencesOpen] = useState(false);
	const { hasCopied, copy } = useCopyToClipboard();

	const save = () => {
		const body = { ...(name !== profile.name ? { name } : {}), ...(pin ? { pin } : {}) };
		detach(async () => {
			if (Object.keys(body).length > 0) await onSave({ profileId: profile.id, body });

			setPin("");
		});
	};
	const remove = () => onDelete(profile.id);

	return (
		<section className="flex flex-col gap-5 rounded-lg border border-border bg-card p-4 sm:p-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3.5">
					<Avatar className="size-11 border border-border">
						{profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.name} />}
						<AvatarFallback className="font-semibold text-xs uppercase">{profile.name.slice(0, 2)}</AvatarFallback>
					</Avatar>
					<div className="flex flex-col gap-1">
						<div className="flex flex-wrap items-center gap-2">
							<h2 className="font-bold text-xl">{profile.name}</h2>
							<Badge variant="outline" className="gap-1 font-mono text-muted-foreground text-xs">
								<span>{m.common_short_id({ id: profile.id.slice(0, 8) })}</span>
								<button
									type="button"
									onClick={() => detach(() => copy(profile.id, m.admin_users_copy_profile_id()))}
									className="text-muted-foreground hover:text-foreground"
									aria-label={m.admin_users_copy_profile_id()}
								>
									{hasCopied ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
								</button>
							</Badge>
							<Badge variant={profile.hasPin ? "secondary" : "outline"} size="sm" className="gap-1">
								{profile.hasPin ? <Lock className="size-3 text-warning" /> : <Unlock className="size-3 text-muted-foreground" />}
								<span>{profile.hasPin ? m.admin_users_profile_has_pin() : m.admin_users_no_pin()}</span>
							</Badge>
						</div>
						<div className="flex flex-wrap items-center gap-x-2 text-muted-foreground text-xs">
							{profile.createdAt && (
								<span>
									{m.common_created_label()} {formatDateTime(profile.createdAt)}
								</span>
							)}
							{profile.updatedAt && <span>{m.common_updated_with_date({ date: formatDateTime(profile.updatedAt) })}</span>}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button size="sm" variant="outline" onClick={() => setPreferencesOpen((open) => !open)}>
						{m.admin_users_preferences()}
					</Button>
					<ConfirmAction
						trigger={
							<Button variant="destructive" size="sm" disabled={disabled}>
								<Trash2 className="size-4" /> {m.common_delete()}
							</Button>
						}
						title={m.user_delete_profile_confirm({ profileName: profile.name })}
						description={m.admin_users_profile_delete_warning()}
						confirmLabel={m.admin_users_delete_profile()}
						onConfirm={remove}
					/>
				</div>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<Field>
					<Label htmlFor={`profile-name-${profile.id}`}>{m.admin_users_profile_name_label()}</Label>
					<Input
						id={`profile-name-${profile.id}`}
						name="profile-name"
						autoComplete="nickname"
						aria-label={m.admin_users_profile_name_label()}
						value={name}
						onChange={(event) => setName(event.target.value)}
						maxLength={100}
					/>
				</Field>
				<Field>
					<Label htmlFor={`profile-pin-${profile.id}`} className="flex items-center gap-2">
						<Key className="size-3.5" />
						{m.admin_users_new_pin()}
					</Label>
					<Input
						id={`profile-pin-${profile.id}`}
						name="profile-pin"
						aria-label={m.admin_users_new_pin()}
						value={pin}
						onChange={(event) => setPin(event.target.value)}
						type="password"
						inputMode="numeric"
						autoComplete="new-password"
						minLength={4}
						maxLength={32}
						placeholder={m.admin_users_pin_keep_empty()}
					/>
				</Field>
			</div>
			<AsyncButton
				isPending={isSaving}
				disabled={disabled || (name === profile.name && !pin)}
				pendingLabel={m.common_saving_dots()}
				onClick={save}
			>
				<Pencil className="size-4" />
				{m.admin_users_save_profile()}
			</AsyncButton>
			{preferencesOpen && (
				<div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4">
					<h3 className="font-semibold text-sm">{m.admin_users_playback_prefs()}</h3>
					<ProfilePreferencesEditor userId={userId} profileId={profile.id} />
				</div>
			)}
		</section>
	);
}
