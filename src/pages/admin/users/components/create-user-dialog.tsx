import { UserPlus } from "lucide-react";
import { useDialogForm } from "@/client/hooks/use-dialog-form";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

export function CreateUserDialog({
	open,
	onOpenChange,
	onCreate,
	isCreating,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreate: (body: { name: string; email: string; password: string; role: "user" | "admin" }) => Promise<unknown>;
	isCreating: boolean;
}) {
	const { formState, setFormState, handleOpenChange } = useDialogForm<{
		name: string;
		email: string;
		password: string;
		role: "user" | "admin";
	}>({
		name: "",
		email: "",
		password: "",
		role: "user",
	});

	const submitCreate = () => {
		if (isCreating) return;

		if (!(formState.name.trim() && formState.email.trim() && formState.password)) return;

		detach(async () => {
			await onCreate({
				name: formState.name.trim(),
				email: formState.email.trim(),
				password: formState.password,
				role: formState.role,
			});
			handleOpenChange(false, onOpenChange);
		});
	};

	return (
		<Dialog open={open} onOpenChange={(nextOpen) => handleOpenChange(nextOpen, onOpenChange)}>
			<DialogContent className="gap-6 p-6 sm:max-w-md">
				<DialogHeader className="gap-1.5">
					<DialogTitle className="font-semibold text-xl tracking-tight">{m.admin_users_create_account()}</DialogTitle>
					<DialogDescription className="text-muted-foreground text-sm">{m.admin_users_account_signup_desc()}</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						submitCreate();
					}}
					className="flex flex-col gap-5"
				>
					<Field className="gap-2">
						<Label htmlFor="create-user-name">{m.common_name()}</Label>
						<Input
							id="create-user-name"
							name="user-name"
							autoComplete="name"
							required
							value={formState.name}
							onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
							maxLength={100}
						/>
					</Field>
					<Field className="gap-2">
						<Label htmlFor="create-user-email">{m.common_email_label()}</Label>
						<Input
							id="create-user-email"
							name="user-email"
							type="email"
							autoComplete="email"
							required
							value={formState.email}
							onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
						/>
					</Field>
					<Field className="gap-2">
						<Label htmlFor="create-user-password">{m.app_password()}</Label>
						<Input
							id="create-user-password"
							name="user-password"
							type="password"
							autoComplete="new-password"
							required
							minLength={8}
							value={formState.password}
							onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
						/>
					</Field>
					<Field className="gap-2">
						<FieldLabel>{m.admin_users_role_label()}</FieldLabel>
						<Select value={formState.role} onValueChange={(value) => value !== null && setFormState((prev) => ({ ...prev, role: value }))}>
							<SelectTrigger className="h-9 w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="user">{m.admin_users_user_word()}</SelectItem>
									<SelectItem value="admin">{m.admin_users_role_admin()}</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</Field>
					<DialogFooter className="gap-3 border-border/60 border-t pt-4">
						<Button type="button" variant="outline" onClick={() => handleOpenChange(false, onOpenChange)}>
							{m.common_cancel()}
						</Button>
						<AsyncButton
							type="submit"
							isPending={isCreating}
							pendingLabel={m.admin_users_creating_account()}
							disabled={!(formState.name.trim() && formState.email.trim() && formState.password)}
							className="gap-2"
						>
							<UserPlus className="size-4" />
							{m.app_create_account()}
						</AsyncButton>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
