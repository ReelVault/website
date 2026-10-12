import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { AppLoadingState } from "@/components/app-states";
import { m } from "@/paraglide/messages";
import { UserPageHeader } from "../components/user-ui";
import { PasswordSection } from "./sections/password-section";
import { TwoFactorSection } from "./sections/two-factor-section";

export default function UserSecurityPage() {
	const { user, isLoading } = useCurrentUser();

	if (isLoading) {
		return <AppLoadingState label={m.user_loading_security()} className="min-h-screen" />;
	}

	return (
		<div className="relative flex flex-col gap-8">
			<UserPageHeader eyebrow={m.user_security_eyebrow()} title={m.user_security()} description={m.user_security_description()} />

			<PasswordSection />

			<TwoFactorSection twoFactorEnabled={user?.twoFactorEnabled === true} />
		</div>
	);
}
