import { Link } from "@tanstack/react-router";
import { House, LogOut, RotateCcw, UserRound } from "lucide-react";
import { resolveApiAssetUrl } from "@/client/client";
import { ConfirmAction } from "@/components/confirm-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";

interface UserSidebarMobileSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	account?: { email?: string | null } | null;
	profile?: { name?: string | null; avatarUrl?: string | null } | null;
	isLoading: boolean;
	onLogout: () => Promise<void>;
}

export function UserSidebarMobileSheet({ open, onOpenChange, account, profile, isLoading, onLogout }: UserSidebarMobileSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetTrigger
				render={
					<button
						type="button"
						className="flex min-h-12 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground lg:hidden"
						aria-label={m.user_profile_and_account()}
						onClick={() => onOpenChange(true)}
					/>
				}
			>
				<UserRound className="size-4.5" aria-hidden="true" />
				<span>{m.user_profile_page_title()}</span>
			</SheetTrigger>
			<SheetContent side="bottom" className="rounded-t-2xl">
				<SheetHeader>
					<SheetTitle>{m.user_profile_and_account()}</SheetTitle>
					<SheetDescription>{account?.email ?? m.user_active_profile()}</SheetDescription>
				</SheetHeader>
				<div className="flex flex-col gap-1 px-4 pb-6">
					{isLoading ? (
						<Skeleton className="h-14 rounded-xl" />
					) : (
						<div className="mb-2 flex items-center gap-3 rounded-xl border border-border/60 p-3">
							<Avatar className="size-10 shrink-0 rounded-xl">
								<AvatarImage src={resolveApiAssetUrl(profile?.avatarUrl)} alt="" />
								<AvatarFallback className="rounded-xl bg-primary/10 text-primary">
									<UserRound aria-hidden="true" />
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<p className="truncate font-semibold text-sm">{profile?.name ?? m.user_your_profile()}</p>
								<p className="truncate text-muted-foreground text-xs">{account?.email ?? m.user_active_profile()}</p>
							</div>
						</div>
					)}
					<SheetClose render={<Link to="/auth/profiles" />}>
						<span className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-muted-foreground text-sm hover:bg-muted/60 hover:text-foreground">
							<RotateCcw className="size-4.5" />
							{m.user_switch_profile()}
						</span>
					</SheetClose>
					<SheetClose render={<Link to="/" />}>
						<span className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-muted-foreground text-sm hover:bg-muted/60 hover:text-foreground">
							<House className="size-4.5" />
							{m.user_back_to_service()}
						</span>
					</SheetClose>
					<ConfirmAction
						title={m.user_logout_profile()}
						description={m.user_current_session_terminated()}
						confirmLabel={m.components_navbar_log_out()}
						onConfirm={onLogout}
						onError={() => toast.error(m.components_navbar_logout_failed())}
						className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground text-sm transition-colors hover:bg-destructive/30 hover:text-destructive"
					>
						<LogOut className="size-4.5" />
						{m.components_navbar_log_out()}
					</ConfirmAction>
				</div>
			</SheetContent>
		</Sheet>
	);
}
