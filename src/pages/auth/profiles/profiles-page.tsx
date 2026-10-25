import type { Profile } from "@reelvault/sdk";
import { ReelVaultError } from "@reelvault/sdk/client";
import { Link, useSearch, useRouter as useTanStackRouter } from "@tanstack/react-router";
import { Lock, Plus, User } from "lucide-react";
import { useState } from "react";
import { resolveApiAssetUrl } from "@/client/client";
import { useProfiles, useSwitchProfile } from "@/client/hooks/use-profiles";
import { AppErrorState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { SimpleAnimation } from "@/components/simple-animation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/hooks/use-page-title";
import { detach } from "@/lib/detach";
import { useSpatialNavigation } from "@/lib/use-spatial-navigation";
import { m } from "@/paraglide/messages";
import { PinVerificationModal } from "./components/pin-verification.modal";

export default function ProfilesSelectionPage() {
	usePageTitle(m.auth_welcome_back());
	// TV: pick a profile with the remote (D-pad).
	useSpatialNavigation();
	const { redirect } = useSearch({ from: "/auth/profiles" });
	const router = useTanStackRouter();
	const redirectTarget = redirect ?? "/dashboard";
	const { profiles, isLoading: isProfilesLoading, error: profilesError, refetch } = useProfiles();
	const switchProfileMutation = useSwitchProfile();
	const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
	const [isPinModalOpen, setIsPinModalOpen] = useState(false);
	const [switchingProfileId, setSwitchingProfileId] = useState<string>();

	const handleProfileSelect = async (profile: Profile) => {
		setSwitchingProfileId(profile.id);
		try {
			await switchProfileMutation.mutateAsync({ profileId: profile.id });
			router.history.push(redirectTarget);
			await router.invalidate();
		} catch (error) {
			// PIN-protected profiles answer 403 profile.pin_invalid until the modal supplies
			// the PIN — the server never exposes whether a profile has one.
			if (error instanceof ReelVaultError && error.code === "profile.pin_invalid") {
				switchProfileMutation.reset();
				setSelectedProfile(profile);
				setIsPinModalOpen(true);
				setSwitchingProfileId(undefined);

				return;
			}
		}

		setSwitchingProfileId(undefined);
	};

	if (isProfilesLoading) {
		return (
			<div className="bg-background flex min-h-svh items-center justify-center px-6">
				<div className="grid w-full max-w-xl grid-cols-2 gap-8 sm:grid-cols-3">
					{["one", "two", "three"].map((key) => (
						<div key={key} className="flex flex-col items-center gap-5">
							<div className="size-32 overflow-hidden rounded-3xl sm:size-44">
								<Skeleton className="size-full" />
							</div>
							<Skeleton className="h-5 w-24" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (profilesError) {
		return (
			<div className="bg-background flex min-h-svh items-center justify-center px-4">
				<AppErrorState
					title={m.auth_failed_to_fetch_profiles()}
					error={profilesError}
					onRetry={() => detach(refetch())}
					className="max-w-md"
				/>
			</div>
		);
	}

	return (
		<div className="bg-background relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden px-4 py-12">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute top-[-10%] right-[-10%] size-120 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_12%,transparent)_0%,transparent_70%)]" />
				<div className="absolute bottom-[-10%] left-[-10%] size-120 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--secondary)_12%,transparent)_0%,transparent_70%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_90%)]" />
			</div>
			<SimpleAnimation className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-16 px-2 sm:px-6">
				<header className="flex flex-col gap-3 text-center">
					<span className="text-primary text-xs font-bold">{m.auth_welcome_back()}</span>
					<h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
						{m.auth_profiles_heading_prefix()}{" "}
						<span className="from-primary to-secondary bg-linear-to-r bg-clip-text text-transparent">{m.auth_watching_question()}</span>
					</h1>
					<p className="text-muted-foreground text-sm font-medium">{m.auth_select_profile_to_continue()}</p>
				</header>

				{switchProfileMutation.isError && <AppErrorState title={m.auth_failed_to_open_profile()} error={switchProfileMutation.error} />}

				<div className="flex w-full flex-wrap justify-center gap-10 md:gap-16">
					{profiles.map((profile, index) => (
						<SimpleAnimation key={profile.id} delay={100 * (index + 1)} direction="up">
							<AsyncButton
								type="button"
								variant="ghost"
								className="group h-auto w-36 flex-col gap-5 p-2 hover:bg-transparent sm:h-auto sm:w-48"
								isPending={switchingProfileId === profile.id && switchProfileMutation.isPending}
								pendingLabel={m.auth_profile_opening()}
								onClick={() => detach(handleProfileSelect(profile))}
							>
								<div className="relative">
									<Avatar
										size="default"
										shape="square"
										className="group-hover:ring-primary size-32 group-hover:scale-110 group-hover:shadow-xl group-hover:ring-2 after:hidden sm:size-44"
									>
										{profile.avatarUrl && <AvatarImage src={resolveApiAssetUrl(profile.avatarUrl)} alt="" />}
										<AvatarFallback>
											<User className="text-muted-foreground/50 size-10" />
										</AvatarFallback>
									</Avatar>
									{profile.pin && (
										<Badge variant="outline" className="absolute -top-2 -right-2">
											<Lock className="size-3" aria-hidden="true" /> {m.auth_profile_pin_badge()}
										</Badge>
									)}
								</div>
								<span className="text-muted-foreground group-hover:text-foreground max-w-full truncate text-lg font-semibold transition-colors">
									{profile.name}
								</span>
							</AsyncButton>
						</SimpleAnimation>
					))}

					<Button
						size="inline"
						type="button"
						variant="ghost"
						className="group w-36 flex-col sm:w-48"
						nativeButton={false}
						render={<Link to="/auth/create-profile" search={redirect ? { redirect } : {}} />}
					>
						<div className="border-border text-muted-foreground/40 group-hover:border-primary group-hover:bg-primary/5 group-hover:text-primary flex size-32 items-center justify-center rounded-3xl border-2 border-dashed transition-[background-color,border-color,transform,color] duration-500 group-hover:scale-110 sm:size-44">
							<Plus className="size-8" />
						</div>
						<span className="text-muted-foreground group-hover:text-primary text-lg font-semibold transition-colors">
							{m.auth_add_profile()}
						</span>
					</Button>
				</div>
			</SimpleAnimation>

			<PinVerificationModal
				profile={selectedProfile}
				isOpen={isPinModalOpen}
				onClose={() => {
					setIsPinModalOpen(false);
					setSelectedProfile(null);
				}}
				onSuccess={() => {
					router.history.push(redirectTarget);
					detach(router.invalidate());
				}}
			/>
		</div>
	);
}
