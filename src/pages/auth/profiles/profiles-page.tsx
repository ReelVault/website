import { useSearch, useRouter as useTanStackRouter } from "@tanstack/react-router";
import { Lock, Plus, User } from "lucide-react";
import { useState } from "react";
import type { Profile } from "reelvault-sdk";
import { ReelVaultError } from "reelvault-sdk/client";
import { resolveApiAssetUrl } from "@/client/client";
import { useProfiles, useSwitchProfile } from "@/client/hooks/use-profiles";
import { AppErrorState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { SimpleAnimation } from "@/components/simple-animation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { useSpatialNavigation } from "@/lib/use-spatial-navigation";
import { m } from "@/paraglide/messages";
import { CreateProfileModal } from "./components/create-profile.modal";
import { PinVerificationModal } from "./components/pin-verification.modal";

export default function ProfilesSelectionPage() {
	// TV: pick a profile with the remote (D-pad).
	useSpatialNavigation();
	const { redirect } = useSearch({ from: "/auth/profiles" });
	const router = useTanStackRouter();
	const redirectTarget = redirect ?? "/dashboard";
	const { profiles, isLoading: isProfilesLoading, error: profilesError, refetch } = useProfiles();
	const switchProfileMutation = useSwitchProfile();
	const [isCreating, setIsCreating] = useState(false);
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
			<div className="flex min-h-svh items-center justify-center bg-background px-6">
				<div className="grid w-full max-w-xl grid-cols-2 gap-8 sm:grid-cols-3">
					{["one", "two", "three"].map((key) => (
						<div key={key} className="flex flex-col items-center gap-5">
							<Skeleton className="size-32 rounded-3xl sm:size-44" />
							<Skeleton className="h-5 w-24" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (profilesError) {
		return (
			<div className="flex min-h-svh items-center justify-center bg-background px-4">
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
		<div className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute top-[-10%] right-[-10%] size-120 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_12%,transparent)_0%,transparent_70%)]" />
				<div className="absolute bottom-[-10%] left-[-10%] size-120 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--secondary)_12%,transparent)_0%,transparent_70%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_90%)]" />
			</div>
			<SimpleAnimation className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-16 px-6">
				<header className="flex flex-col gap-3 text-center">
					<span className="font-bold text-primary text-xs uppercase tracking-[0.22em]">{m.auth_welcome_back()}</span>
					<h1 className="font-bold text-4xl tracking-tight sm:text-6xl lg:text-7xl">
						{m.auth_profiles_heading_prefix()}{" "}
						<span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">{m.auth_watching_question()}</span>
					</h1>
					<p className="font-medium text-muted-foreground text-sm">{m.auth_select_profile_to_continue()}</p>
				</header>

				{switchProfileMutation.isError && <AppErrorState title={m.auth_failed_to_open_profile()} error={switchProfileMutation.error} />}

				<div className="flex w-full flex-wrap justify-center gap-10 md:gap-16">
					{profiles.map((profile, index) => (
						<SimpleAnimation key={profile.id} delay={100 * (index + 1)} direction="up">
							<AsyncButton
								type="button"
								variant="ghost"
								className="group h-auto w-36 flex-col gap-5 p-2 hover:bg-transparent sm:w-48"
								isPending={switchingProfileId === profile.id && switchProfileMutation.isPending}
								pendingLabel={m.auth_profile_opening()}
								onClick={() => detach(handleProfileSelect(profile))}
							>
								<div className="relative">
									<Avatar
										size="default"
										className="size-32 rounded-3xl border-2 border-border bg-muted transition-[border-color,box-shadow,transform] duration-500 group-hover:scale-110 group-hover:border-primary group-hover:shadow-xl sm:size-44"
									>
										{profile.avatarUrl && <AvatarImage src={resolveApiAssetUrl(profile.avatarUrl)} alt="" className="rounded-lg" />}
										<AvatarFallback className="rounded-3xl">
											<User className="size-10 text-muted-foreground/50" />
										</AvatarFallback>
									</Avatar>
									{profile.pin && (
										<Badge variant="outline" className="absolute -top-2 -right-2 gap-1 rounded-xl bg-card px-2 py-1 shadow-xl">
											<Lock className="size-3" aria-hidden="true" /> {m.auth_profile_pin_badge()}
										</Badge>
									)}
								</div>
								<span className="max-w-full truncate font-black text-lg text-muted-foreground uppercase tracking-widest transition-colors group-hover:text-foreground">
									{profile.name}
								</span>
							</AsyncButton>
						</SimpleAnimation>
					))}

					<Button
						type="button"
						variant="ghost"
						className="group h-auto w-36 flex-col gap-5 p-2 hover:bg-transparent sm:w-48"
						onClick={() => setIsCreating(true)}
					>
						<div className="flex size-32 items-center justify-center rounded-3xl border-2 border-border border-dashed text-muted-foreground/40 transition-[background-color,border-color,transform,color] duration-500 group-hover:scale-110 group-hover:border-primary group-hover:bg-primary/5 group-hover:text-primary sm:size-44">
							<Plus className="size-8" />
						</div>
						<span className="font-black text-lg text-muted-foreground/50 uppercase tracking-wider transition-colors group-hover:text-primary">
							{m.auth_add_profile()}
						</span>
					</Button>
				</div>
			</SimpleAnimation>

			<CreateProfileModal isOpen={isCreating} onClose={() => setIsCreating(false)} onSuccess={() => detach(refetch())} />
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
