import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface QuickConnectHeaderProps {
	hasUser: boolean;
}

export function QuickConnectHeader({ hasUser }: QuickConnectHeaderProps) {
	return (
		<header className="relative z-10 mb-8 flex w-full max-w-2xl items-center justify-between">
			<Link to="/" className="rounded-md p-1 focus-visible:outline-2">
				<Logo className="w-44 sm:w-52" />
			</Link>

			{hasUser ? (
				<Link to="/">
					<Button variant="outline" size="sm" className="gap-2 rounded-xl">
						{m.auth_back_to_home()}
					</Button>
				</Link>
			) : (
				<Link to="/auth/login">
					<Button variant="outline" size="sm" className="gap-2 rounded-xl">
						{m.auth_password_login()}
					</Button>
				</Link>
			)}
		</header>
	);
}
