import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { AppNavbar } from "@/components/navbar/app-navbar";
import { AppFooter } from "@/pages/web/app-footer";

export default function WebLayout({ children }: { children: ReactNode }) {
	return (
		<RequireAuth requireProfile>
			<AppNavbar />
			{children}
			<AppFooter />
		</RequireAuth>
	);
}
