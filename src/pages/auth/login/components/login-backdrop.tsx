import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { AuthBackdrop } from "@/pages/auth/components/auth-backdrop";

/** Login page background + logo (login-page only). */
export function LoginBackdrop() {
	return (
		<>
			<AuthBackdrop />

			<Link to="/" className="absolute top-5 left-5 z-10 rounded-md p-1 focus-visible:outline-2">
				<Logo className="w-52" />
			</Link>
		</>
	);
}
