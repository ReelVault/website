import { useNavigate, useSearch, useRouter as useTanStackRouter } from "@tanstack/react-router";
import { Tv } from "lucide-react";
import { useState } from "react";
import { useQuickConnectAuthorize, useQuickConnectRedeem } from "@/client/hooks/use-auth";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { getSdkErrorMessage } from "@/client/sdk-error-message";
import { SimpleAnimation } from "@/components/simple-animation";
import { detach } from "@/lib/detach";
import { useSpatialNavigation } from "@/lib/use-spatial-navigation";
import { AuthBackdrop } from "@/pages/auth/components/auth-backdrop";
import { QuickConnectCard } from "@/pages/auth/quick-connect/quick-connect-card";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { QuickConnectHeader } from "./components/quick-connect-header";
import { useQuickConnectPairing } from "./hooks/use-quick-connect-pairing";
import { QuickConnectAuthorizeSection } from "./sections/quick-connect-authorize-section";
import { QuickConnectPairSection } from "./sections/quick-connect-pair-section";
import { QuickConnectRedeemSection } from "./sections/quick-connect-redeem-section";

export default function QuickConnectPage() {
	useSpatialNavigation();
	const navigate = useNavigate();
	const router = useTanStackRouter();
	const { user, profile, isLoading: isUserLoading } = useCurrentUser();

	const search = useSearch({ from: "/quick-connect" });
	const urlCode = search.code?.trim() ?? "";
	const urlRedeem = search.redeem?.trim() ?? "";

	const authorizeMutation = useQuickConnectAuthorize();
	const redeemMutation = useQuickConnectRedeem();

	const [unauthMode, setUnauthMode] = useState<"pair" | "redeem">(urlRedeem ? "redeem" : "pair");
	const [authorizedSuccess, setAuthorizedSuccess] = useState(false);

	const origin = typeof window !== "undefined" ? window.location.origin : "";

	const {
		pairCode,
		pairExpiresAt,
		isExpired: isPairingExpired,
		isPending: isPairingPending,
		error: pairingError,
		startPairing,
	} = useQuickConnectPairing({
		enabled: unauthMode === "pair",
		isUserLoading,
		hasUser: Boolean(user),
		urlRedeem,
		onSuccess: () => {
			detach(navigate({ to: "/auth/profiles" }));
			detach(router.invalidate());
		},
	});

	const handleAuthorizeScannedCode = () => {
		if (!urlCode || authorizeMutation.isPending) return;

		authorizeMutation.mutate(urlCode, {
			onSuccess: () => {
				setAuthorizedSuccess(true);
				toast.success(m.auth_device_linked_success());
			},
			onError: (error) => {
				toast.error(getSdkErrorMessage(error));
			},
		});
	};

	const handleManualRedeem = async (code: string) => {
		try {
			await redeemMutation.mutateAsync(code);
			toast.success(m.auth_logged_in_successfully());
			await navigate({ to: "/auth/profiles" });
			await router.invalidate();
		} catch (error) {
			toast.error(getSdkErrorMessage(error));
		}
	};

	const qrUrl = pairCode ? `${origin}/quick-connect?code=${pairCode}` : "";

	const renderQuickConnectArea = () => {
		if (user && urlCode) {
			return (
				<QuickConnectAuthorizeSection
					user={user}
					profile={profile}
					urlCode={urlCode}
					authorizedSuccess={authorizedSuccess}
					isPending={authorizeMutation.isPending}
					onAuthorize={handleAuthorizeScannedCode}
				/>
			);
		}

		if (user) {
			return (
				<section className="border-border bg-card/85 relative overflow-hidden rounded-3xl border p-6 shadow-2xl sm:p-8">
					<div className="border-border/60 mb-6 flex items-center gap-3 border-b pb-4">
						<div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
							<Tv className="size-5" />
						</div>
						<div>
							<h1 className="text-lg font-bold">{m.auth_quick_connect_hub()}</h1>
							<p className="text-muted-foreground text-xs">{m.auth_connect_tv_note()}</p>
						</div>
					</div>

					<QuickConnectCard />
				</section>
			);
		}

		if (unauthMode === "pair") {
			return (
				<QuickConnectPairSection
					pairCode={pairCode}
					pairExpiresAt={pairExpiresAt}
					isExpired={isPairingExpired}
					qrUrl={qrUrl}
					isPending={isPairingPending}
					error={pairingError}
					onStartPairing={startPairing}
					onSwitchToRedeem={() => setUnauthMode("redeem")}
				/>
			);
		}

		return (
			<QuickConnectRedeemSection
				initialCode={urlRedeem}
				onRedeem={handleManualRedeem}
				isPending={redeemMutation.isPending}
				error={redeemMutation.error}
				onSwitchToPair={() => setUnauthMode("pair")}
			/>
		);
	};

	return (
		<div className="bg-background relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden p-4 sm:p-6">
			<AuthBackdrop />

			<QuickConnectHeader hasUser={Boolean(user)} />

			<main className="relative z-10 w-full max-w-2xl">
				<SimpleAnimation direction="up" duration={260}>
					{renderQuickConnectArea()}
				</SimpleAnimation>
			</main>
		</div>
	);
}
