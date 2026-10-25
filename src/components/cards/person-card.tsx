import type { MetadataWithRelation, RequireFields } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { Copy, ImageDown, RefreshCw, Shield, User } from "lucide-react";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { useRefreshPerson, useRefreshPersonImage } from "@/client/hooks/use-person-data";
import { defineFields } from "@/client/utils/fields";
import { isAdminUser } from "@/components/auth/admin-access";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { copyEntityLink, copyToClipboard } from "@/utils/clipboard-utils";
import { ApiImage } from "../ui/api-image";

type Cast = MetadataWithRelation["cast"][number];

export const personCardFields = defineFields<Cast>()("character", "data.id", "data.imageId", "data.name", "data.updatedAt");

/** Person context menu shared by the details cast and the admin people grid; admin tools render only when `isAdmin`. */
export function PersonContextMenuContent({
	personId,
	personName,
	isAdmin,
	onRefresh,
	onRefreshImage,
}: {
	personId: string;
	personName: string;
	isAdmin: boolean;
	onRefresh: (id: string) => void;
	onRefreshImage: (id: string) => void;
}) {
	return (
		<ContextMenuContent className="w-64">
			<ContextMenuGroup>
				<ContextMenuLabel className="truncate">{personName}</ContextMenuLabel>
			</ContextMenuGroup>
			<ContextMenuSeparator />
			<ContextMenuGroup>
				<ContextMenuItem render={<Link to="/person/$id" params={{ id: personId }} />} className="cursor-pointer">
					<User className="text-muted-foreground size-4" />
					<span>{m.components_person_view_profile()}</span>
				</ContextMenuItem>
				<ContextMenuItem
					onClick={() => detach(copyEntityLink(`/person/${personId}`, m.components_profile_link_word()))}
					className="cursor-pointer"
				>
					<Copy className="text-muted-foreground size-4" />
					<span>{m.components_copy_profile_link()}</span>
				</ContextMenuItem>
			</ContextMenuGroup>

			{isAdmin && (
				<>
					<ContextMenuSeparator />
					<ContextMenuGroup>
						<ContextMenuLabel className="flex items-center">
							<Shield className="size-3" />
							{m.common_admin_tools()}
						</ContextMenuLabel>
						<ContextMenuItem onClick={() => onRefresh(personId)} className="cursor-pointer">
							<RefreshCw className="text-primary size-4" />
							<span>{m.components_person_refresh_data()}</span>
						</ContextMenuItem>
						<ContextMenuItem onClick={() => onRefreshImage(personId)} className="cursor-pointer">
							<ImageDown className="text-primary size-4" />
							<span>{m.components_person_force_photo()}</span>
						</ContextMenuItem>
						<ContextMenuItem onClick={() => detach(copyToClipboard(personId, m.components_person_id()))} className="cursor-pointer">
							<Copy className="text-muted-foreground size-4" />
							<span>{m.components_copy_person_id()}</span>
						</ContextMenuItem>
					</ContextMenuGroup>
				</>
			)}
		</ContextMenuContent>
	);
}

export function PersonCard({ person }: { person: RequireFields<Cast, typeof personCardFields> }) {
	const { user } = useCurrentUser();
	const refreshPersonMutation = useRefreshPerson();
	const refreshPersonImageMutation = useRefreshPersonImage();

	if (!person.data?.id) return null;

	const personId = person.data.id;
	const personName = person.data.name || m.components_unknown_person();

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<Link to="/person/$id" params={{ id: personId }} className="block">
					<div className="group relative flex w-36 flex-col sm:w-44">
						{/* Kontener obrazka */}
						<div className="border-border/70 bg-card group-hover:border-primary/50 relative overflow-hidden rounded-xl border shadow-sm transition-[border-color,box-shadow,transform] duration-200 group-hover:scale-[1.02] group-hover:shadow-md">
							<AspectRatio ratio={2 / 3}>
								<ApiImage
									fileId={person.data.imageId}
									cacheKey={person.data.updatedAt}
									alt={personName}
									width={200}
									aspectRatio={2 / 3}
									className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
								/>
							</AspectRatio>

							{/* Overlay */}
							<div className="from-background/90 absolute inset-0 bg-linear-to-t via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-60" />
						</div>

						{/* Sekcja Tekstowa */}
						<div className="mt-3 flex flex-col gap-0.5 px-1 text-center">
							<p className="text-foreground group-hover:text-primary truncate text-sm font-bold tracking-tight transition-colors duration-200">
								{personName}
							</p>
							<p className="text-muted-foreground truncate text-xs font-medium">
								{person.character ?? m.components_person_role_undefined()}
							</p>
						</div>
					</div>
				</Link>
			</ContextMenuTrigger>

			<PersonContextMenuContent
				personId={personId}
				personName={personName}
				isAdmin={isAdminUser(user)}
				onRefresh={(id) => refreshPersonMutation.mutate(id)}
				onRefreshImage={(id) => refreshPersonImageMutation.mutate(id)}
			/>
		</ContextMenu>
	);
}
