import { Lock } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { m } from "@/paraglide/messages";

interface TwoFactorPasswordStepProps {
	isPending: boolean;
	onSubmit: (password: string) => void;
	onCancel: () => void;
}

export function TwoFactorPasswordStep({ isPending, onSubmit, onCancel }: TwoFactorPasswordStepProps) {
	const [password, setPassword] = useState("");

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		if (!password || isPending) return;

		onSubmit(password);
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
			<div className="flex flex-col gap-2">
				<label htmlFor="2fa-setup-password" className="font-semibold text-muted-foreground text-xs uppercase">
					{m.user_account_password()}
				</label>
				<div className="relative">
					<Input
						id="2fa-setup-password"
						type="password"
						required
						placeholder={m.user_your_password()}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="h-10"
					/>
					<Lock className="absolute top-3 right-3 size-4 text-muted-foreground" />
				</div>
			</div>
			<DialogFooter className="mt-4">
				<Button type="button" variant="ghost" onClick={onCancel}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Generowanie..." : m.common_next()}
				</Button>
			</DialogFooter>
		</form>
	);
}
