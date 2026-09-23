import { m } from "@/paraglide/messages";
import { UserSectionTitle } from "../../user/components/user-ui";
import { QuickConnectAuthorizeBox } from "./sections/quick-connect-authorize-box";
import { QuickConnectGenerateBox } from "./sections/quick-connect-generate-box";

export function QuickConnectCard({ onSessionChange, initialCode }: { onSessionChange?: () => void; initialCode?: string }) {
	return (
		<section className="flex flex-col gap-5">
			<UserSectionTitle title={m.auth_device_quick_connect()} description={m.auth_connect_tv_hint()} />

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<QuickConnectAuthorizeBox initialCode={initialCode} onSessionChange={onSessionChange} />
				<QuickConnectGenerateBox />
			</div>
		</section>
	);
}
