import { useNavigate, useParams } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAdminDeleteUser, useAdminUser } from "@/client/hooks/use-admin-user";
import { useAdminUserProfiles } from "@/client/hooks/use-admin-user-profiles";
import { useAdminUserFull } from "@/client/hooks/use-admin-users";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { BanUserDialog } from "../components/ban-user-dialog";
import { ChangePasswordDialog } from "./components/change-password-dialog";
import { CreateProfileDialog } from "./components/create-profile-dialog";
import { ProfileCard } from "./components/profile-card";
import { UserAccountHeader } from "./sections/user-account-header";
import { UserManagementCard } from "./sections/user-management-card";

const SKELETON_KEYS = ["1", "2", "3"] as const;

export default function AdminUserProfilesPage() {
	const params = useParams({ from: "/admin/users/$id" });
	const navigate = useNavigate();
	const fullUserQuery = useAdminUserFull(params.id);
	const {
		profiles: fallbackProfiles,
		error: profilesError,
		refetch: refetchProfiles,
		createProfile,
		updateProfile,
		deleteProfile,
		setPassword,
		isCreating,
		isSaving,
		isDeleting,
		isSettingPassword,
	} = useAdminUserProfiles(params.id);
	const { user: fallbackUser, updateUser, isUpdating } = useAdminUser(params.id);
	const deleteUserMutation = useAdminDeleteUser();
	const [createOpen, setCreateOpen] = useState(false);
	const [passwordOpen, setPasswordOpen] = useState(false);
	const [banOpen, setBanOpen] = useState(false);

	const user = fullUserQuery.data?.user ?? fallbackUser;
	const profiles = fullUserQuery.data?.profiles ?? fallbackProfiles;
	const isLoading = fullUserQuery.isLoading && !user;
	const isUserLoading = isLoading;
	const error = fullUserQuery.error ?? profilesError;
	const refetch = async () => {
		await Promise.all([fullUserQuery.refetch(), refetchProfiles()]);
	};

	const toggleBan = async () => {
		if (!user) return;

		if (user.banned) {
			try {
				await updateUser({ banned: false, banReason: null });
				toast.success(m.admin_users_account_unblocked_named({ name: user.name }));
			} catch (err) {
				toastError(m.admin_users_failed_to_unblock(), err);
			}

			return;
		}

		setBanOpen(true);
	};

	const confirmBan = async (reason: string | null) => {
		if (!user) return;

		try {
			await updateUser({ banned: true, banReason: reason });
			toast.success(m.admin_users_account_blocked_named({ name: user.name }));
			setBanOpen(false);
		} catch (err) {
			toastError(m.admin_users_failed_to_block(), err);
		}
	};

	const toggleRole = async () => {
		if (!user) return;

		try {
			await updateUser({ role: user.role === "admin" ? "user" : "admin" });
			toast.success(user.role === "admin" ? m.admin_users_admin_revoked() : m.admin_users_admin_granted());
		} catch (err) {
			toastError(m.admin_users_failed_to_change_role(), err);
		}
	};

	const removeUser = async () => {
		if (!user) return;

		try {
			await deleteUserMutation.mutateAsync(user.id);
			await navigate({ to: "/admin/users" });
		} catch (err) {
			toastError(m.admin_users_failed_to_delete(), err);
		}
	};

	return (
		<main className="flex flex-col gap-10 text-foreground">
			<UserAccountHeader user={user} />

			<UserManagementCard
				user={user}
				isLoading={isUserLoading}
				isUpdating={isUpdating}
				isDeleting={deleteUserMutation.isPending}
				onToggleRole={() => detach(toggleRole)}
				onToggleBan={() => detach(toggleBan)}
				onOpenPassword={() => setPasswordOpen(true)}
				onRemoveUser={() => detach(removeUser)}
			/>

			{error && <AppErrorState title={m.admin_users_failed_to_fetch_profiles()} error={error} onRetry={() => detach(refetch)} />}

			{isLoading && (
				<div className="flex flex-col gap-4">
					{SKELETON_KEYS.map((key) => (
						<Skeleton key={key} className="h-44 rounded-lg" />
					))}
				</div>
			)}

			{!(isLoading || error) && profiles.length === 0 && (
				<AppEmptyState
					title={m.admin_users_no_profiles()}
					description={m.admin_users_create_first_profile_hint()}
					action={
						<Button onClick={() => setCreateOpen(true)} className="gap-2">
							<Plus className="size-4" aria-hidden="true" /> {m.admin_users_create_profile()}
						</Button>
					}
				/>
			)}

			<div className="flex flex-col gap-5">
				{profiles.length > 0 && (
					<Button onClick={() => setCreateOpen(true)} className="w-fit gap-2">
						<Plus className="size-4" aria-hidden="true" /> {m.admin_users_create_profile()}
					</Button>
				)}
				{profiles.map((profile) => (
					<ProfileCard
						key={profile.id}
						userId={params.id}
						profile={profile}
						onSave={updateProfile}
						onDelete={deleteProfile}
						disabled={isSaving || isDeleting}
						isSaving={isSaving}
					/>
				))}
			</div>

			<CreateProfileDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={createProfile} isCreating={isCreating} />
			<ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} onSubmit={setPassword} isPending={isSettingPassword} />
			<BanUserDialog
				userName={banOpen ? (user?.name ?? null) : null}
				isPending={isUpdating}
				onOpenChange={setBanOpen}
				onConfirm={(reason) => detach(() => confirmBan(reason))}
			/>
		</main>
	);
}
