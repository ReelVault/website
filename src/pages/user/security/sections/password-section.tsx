import { KeyRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserSectionTitle, UserSurface } from "@/pages/user/components/user-ui";
import { m } from "@/paraglide/messages";
import { ChangePasswordDialog } from "../components/change-password-dialog";

export function PasswordSection() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<section>
			<UserSectionTitle title={m.user_password_section_heading()} description={m.user_password_section_description()} />
			<UserSurface className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
						<KeyRound className="size-6" />
					</div>
					<p className="text-muted-foreground text-xs">{m.user_change_password_description()}</p>
				</div>
				<Button variant="outline" onClick={() => setIsOpen(true)} className="min-h-10 shrink-0">
					{m.user_change_password()}
				</Button>
			</UserSurface>

			<ChangePasswordDialog open={isOpen} onOpenChange={setIsOpen} />
		</section>
	);
}
