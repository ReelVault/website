import { Lock } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
				<label htmlFor="2fa-setup-password" className="text-muted-foreground text-sm font-semibold">
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
					/>
					<Lock className="text-muted-foreground absolute top-3 right-3 size-4" />
				</div>
			</div>
			<div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
				<Button type="button" variant="ghost" onClick={onCancel}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? m.user_2fa_generating() : m.common_next()}
				</Button>
			</div>
		</form>
	);
}
