import { KeyRound } from "lucide-react";
import type { useAdminUserProfiles } from "@/client/hooks/use-admin-user-profiles";
import { useDialogForm } from "@/client/hooks/use-dialog-form";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

export function ChangePasswordDialog({
	open,
	onOpenChange,
	onSubmit,
	isPending,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: ReturnType<typeof useAdminUserProfiles>["setPassword"];
	isPending: boolean;
}) {
	const { formState, setFormState, handleOpenChange } = useDialogForm({
		password: "",
		confirm: "",
		error: undefined as string | undefined,
	});

	const submitChange = () => {
		if (isPending) return;

		if (formState.password.length < 8) {
			setFormState((prev) => ({ ...prev, error: m.app_password_min_length() }));

			return;
		}

		if (formState.password !== formState.confirm) {
			setFormState((prev) => ({ ...prev, error: m.admin_users_passwords_mismatch() }));

			return;
		}

		detach(async () => {
			await onSubmit({ newPassword: formState.password });
			handleOpenChange(false, onOpenChange);
		});
	};

	return (
		<Dialog open={open} onOpenChange={(nextOpen) => handleOpenChange(nextOpen, onOpenChange)}>
			<DialogContent className="gap-6 p-6 sm:max-w-md">
				<DialogHeader className="gap-1.5">
					<DialogTitle className="font-semibold text-xl tracking-tight">{m.admin_users_change_password()}</DialogTitle>
					<DialogDescription className="text-muted-foreground text-sm">{m.admin_users_set_password_desc()}</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						submitChange();
					}}
					className="flex flex-col gap-5"
				>
					<Field className="gap-2">
						<FieldLabel>{m.admin_users_new_password()}</FieldLabel>
						<Input
							name="new-password"
							type="password"
							autoComplete="new-password"
							required
							minLength={8}
							value={formState.password}
							onChange={(event) => {
								setFormState((prev) => ({ ...prev, password: event.target.value, error: undefined }));
							}}
						/>
					</Field>
					<Field className="gap-2">
						<FieldLabel>{m.app_repeat_password()}</FieldLabel>
						<Input
							name="confirm-password"
							type="password"
							autoComplete="new-password"
							required
							minLength={8}
							value={formState.confirm}
							onChange={(event) => {
								setFormState((prev) => ({ ...prev, confirm: event.target.value, error: undefined }));
							}}
						/>
					</Field>
					{formState.error && <p className="text-destructive text-sm">{formState.error}</p>}
					<DialogFooter className="gap-3 border-border/60 border-t pt-4">
						<Button type="button" variant="outline" onClick={() => handleOpenChange(false, onOpenChange)}>
							{m.common_cancel()}
						</Button>
						<AsyncButton type="submit" isPending={isPending} pendingLabel={m.admin_users_changing_password()} className="gap-2">
							<KeyRound className="size-4" />
							{m.admin_users_change_password()}
						</AsyncButton>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
