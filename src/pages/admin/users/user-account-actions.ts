import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";

interface AccountUpdate {
	role?: "admin" | "user";
	banned?: boolean;
	banReason?: string | null;
}

/** The account an action applies to, and how to save a change to it. */
interface AccountTarget {
	user: { name: string; role: "admin" | "user" };
	update: (body: AccountUpdate) => Promise<unknown>;
}

/** The users list and a user's page run the same account actions with the same messages. */
export async function unblockAccount({ user, update }: AccountTarget): Promise<void> {
	try {
		await update({ banned: false, banReason: null });
		toast.success(m.admin_users_account_unblocked_named({ name: user.name }));
	} catch (error) {
		toastError(m.admin_users_failed_to_unblock(), error);
	}
}

/** Blocks the account with an undo in the toast; resolves to whether the block was saved. */
export async function blockAccount({ user, update }: AccountTarget, reason: string | null): Promise<boolean> {
	try {
		await update({ banned: true, banReason: reason });
	} catch (error) {
		toastError(m.admin_users_failed_to_block(), error);

		return false;
	}

	toast.success(m.admin_users_account_blocked_named({ name: user.name }), {
		duration: 8000,
		action: {
			label: m.common_undo(),
			onClick: () => {
				detach(async () => {
					try {
						await update({ banned: false, banReason: null });
						toast.success(m.admin_users_block_lifted({ name: user.name }));
					} catch (error) {
						toastError(m.admin_users_failed_to_lift_block(), error);
					}
				});
			},
		},
	});

	return true;
}

export async function toggleAccountRole({ user, update }: AccountTarget): Promise<void> {
	try {
		await update({ role: user.role === "admin" ? "user" : "admin" });
		toast.success(
			user.role === "admin"
				? m.admin_users_admin_revoked_named({ name: user.name })
				: m.admin_users_admin_granted_named({ name: user.name }),
		);
	} catch (error) {
		toastError(m.admin_users_failed_to_change_role(), error);
	}
}
