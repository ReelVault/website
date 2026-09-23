import { UserPlus } from "lucide-react";
import type { useAdminUserProfiles } from "@/client/hooks/use-admin-user-profiles";
import { useDialogForm } from "@/client/hooks/use-dialog-form";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

export function CreateProfileDialog({
	open,
	onOpenChange,
	onCreate,
	isCreating,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreate: ReturnType<typeof useAdminUserProfiles>["createProfile"];
	isCreating: boolean;
}) {
	const { formState, setFormState, handleOpenChange } = useDialogForm({ name: "", pin: "" });

	const submitProfile = () => {
		if (!formState.name.trim()) return;

		detach(async () => {
			await onCreate({ name: formState.name.trim(), ...(formState.pin ? { pin: formState.pin } : {}) });
			handleOpenChange(false, onOpenChange);
		});
	};

	return (
		<Dialog open={open} onOpenChange={(nextOpen) => handleOpenChange(nextOpen, onOpenChange)}>
			<DialogContent className="gap-6 p-6 sm:max-w-md">
				<DialogHeader className="gap-1.5">
					<DialogTitle className="font-semibold text-xl tracking-tight">{m.admin_users_create_profile()}</DialogTitle>
					<DialogDescription className="text-muted-foreground text-sm">{m.admin_users_add_profile_desc()}</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						submitProfile();
					}}
					className="flex flex-col gap-5"
				>
					<Field className="gap-2">
						<Label htmlFor="create-profile-name">{m.admin_users_profile_name_label()}</Label>
						<Input
							id="create-profile-name"
							name="profile-name"
							autoComplete="nickname"
							required
							value={formState.name}
							onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
							maxLength={100}
						/>
					</Field>
					<Field className="gap-2">
						<FieldLabel>{m.admin_users_pin_optional_label()}</FieldLabel>
						<Input
							name="profile-pin"
							type="password"
							inputMode="numeric"
							autoComplete="new-password"
							minLength={4}
							maxLength={32}
							value={formState.pin}
							onChange={(event) => setFormState((prev) => ({ ...prev, pin: event.target.value }))}
							placeholder={m.admin_users_pin_optional_hint()}
						/>
					</Field>
					<DialogFooter className="gap-3 border-border/60 border-t pt-4">
						<Button type="button" variant="outline" onClick={() => handleOpenChange(false, onOpenChange)}>
							{m.common_cancel()}
						</Button>
						<AsyncButton
							type="submit"
							isPending={isCreating}
							pendingLabel={m.admin_users_creating_profile()}
							disabled={!formState.name.trim()}
							className="gap-2"
						>
							<UserPlus className="size-4" />
							{m.admin_users_create_profile()}
						</AsyncButton>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
