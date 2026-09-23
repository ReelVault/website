import { useNavigate, useRouter as useTanStackRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useQuickConnectInitiate } from "@/client/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { QuickConnectPairView } from "./quick-connect-pair-view";
import { QuickConnectRedeemForm } from "./quick-connect-redeem-form";

export type QuickConnectSubStep = "redeem" | "pair";

/** "quick-connect" step: redeem a code from another device or pair via QR (TV mode). */
export function LoginQuickConnectStep({
	redirectUrl,
	onSubStepChange,
	onBack,
}: {
	redirectUrl?: string;
	/** Parent tracks the sub-step for the header icon. */
	onSubStepChange: (subStep: QuickConnectSubStep) => void;
	onBack: () => void;
}) {
	const navigate = useNavigate();
	const router = useTanStackRouter();
	const quickConnectInitiateMutation = useQuickConnectInitiate();

	const [qcSubStep, setQcSubStepState] = useState<QuickConnectSubStep>("pair");
	const setQcSubStep = (subStep: QuickConnectSubStep) => {
		setQcSubStepState(subStep);
		onSubStepChange(subStep);
	};

	const navigateToProfiles = () => {
		detach(
			navigate({
				to: "/auth/profiles",
				search: redirectUrl ? { redirect: redirectUrl } : {},
			}),
		);
		detach(router.invalidate());
	};

	return (
		<div className="mt-10 flex flex-col gap-6">
			{qcSubStep === "redeem" ? (
				<QuickConnectRedeemForm
					onSuccess={navigateToProfiles}
					onSwitchToPair={() => setQcSubStep("pair")}
					isInitiatingPair={quickConnectInitiateMutation.isPending}
				/>
			) : (
				<QuickConnectPairView onAuthenticated={navigateToProfiles} onSwitchToRedeem={() => setQcSubStep("redeem")} />
			)}

			<Button type="button" variant="ghost" className="text-muted-foreground" onClick={onBack}>
				<ArrowLeft className="size-4" />
				{m.auth_back_to_password_login()}
			</Button>
		</div>
	);
}
