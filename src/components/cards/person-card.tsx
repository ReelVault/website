import { Link } from "@tanstack/react-router";
import { Copy, ImageDown, RefreshCw, Shield, User } from "lucide-react";
import { startTransition } from "react";
import type { MetadataWithRelation, RequireFields } from "reelvault-sdk";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { useRefreshPerson, useRefreshPersonImage } from "@/client/hooks/use-person-data";
import { defineFields } from "@/client/utils/fields";
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
import { m } from "@/paraglide/messages";
import { copyEntityLink, copyToClipboard } from "@/utils/clipboard-utils";
import { ApiImage } from "../ui/api-image";

type Cast = MetadataWithRelation["cast"][number];

export const personCardFields = defineFields<Cast>()("character", "data.id", "data.imageId", "data.name", "data.updatedAt");

export function PersonCard({ person }: { person: RequireFields<Cast, typeof personCardFields> }) {
	const { user } = useCurrentUser();
	const isAdmin = user?.role === "admin";
	const refreshPersonMutation = useRefreshPerson();
	const refreshPersonImageMutation = useRefreshPersonImage();

	if (!person.data?.id) return null;

	const personId = person.data.id;
	const personName = person.data.name || m.components_unknown_person();

	const handleCopyLink = (): void => {
		startTransition(() => copyEntityLink(`/person/${personId}`, m.components_profile_link_word()));
	};

	const handleCopyId = (): void => {
		startTransition(() => copyToClipboard(personId, m.components_person_id()));
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<Link to="/person/$id" params={{ id: personId }} className="block">
					<div className="group relative flex w-36 flex-col sm:w-44">
						{/* Kontener obrazka */}
						<div className="relative overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 group-hover:scale-[1.02] group-hover:border-primary/50 group-hover:shadow-md">
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
							<div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-60" />
						</div>

						{/* Sekcja Tekstowa */}
						<div className="mt-3 flex flex-col gap-0.5 px-1 text-center">
							<p className="truncate font-bold text-foreground text-sm tracking-tight transition-colors duration-200 group-hover:text-primary">
								{personName}
							</p>
							<p className="truncate font-medium text-[11px] text-muted-foreground">
								{person.character ?? m.components_person_role_undefined()}
							</p>
						</div>
					</div>
				</Link>
			</ContextMenuTrigger>

			<ContextMenuContent className="w-64 border-border bg-card/95">
				<ContextMenuGroup>
					<ContextMenuLabel className="truncate font-bold text-foreground text-xs uppercase tracking-wider">{personName}</ContextMenuLabel>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuGroup>
					<ContextMenuItem render={<Link to="/person/$id" params={{ id: personId }} />} className="cursor-pointer gap-2.5">
						<User className="size-4 text-muted-foreground" />
						<span>{m.components_person_view_profile()}</span>
					</ContextMenuItem>
					<ContextMenuItem onClick={handleCopyLink} className="cursor-pointer gap-2.5">
						<Copy className="size-4 text-muted-foreground" />
						<span>{m.components_copy_profile_link()}</span>
					</ContextMenuItem>
				</ContextMenuGroup>

				{isAdmin && (
					<>
						<ContextMenuSeparator />
						<ContextMenuGroup>
							<ContextMenuLabel className="flex items-center gap-1.5 font-bold text-[10px] text-primary uppercase tracking-widest">
								<Shield className="size-3" />
								{m.common_admin_tools()}
							</ContextMenuLabel>
							<ContextMenuItem onClick={() => refreshPersonMutation.mutate(personId)} className="cursor-pointer gap-2.5">
								<RefreshCw className="size-4 text-primary" />
								<span>{m.components_person_refresh_data()}</span>
							</ContextMenuItem>
							<ContextMenuItem onClick={() => refreshPersonImageMutation.mutate(personId)} className="cursor-pointer gap-2.5">
								<ImageDown className="size-4 text-primary" />
								<span>{m.components_person_force_photo()}</span>
							</ContextMenuItem>
							<ContextMenuItem onClick={handleCopyId} className="cursor-pointer gap-2.5">
								<Copy className="size-4 text-muted-foreground" />
								<span>{m.components_copy_person_id()}</span>
							</ContextMenuItem>
						</ContextMenuGroup>
					</>
				)}
			</ContextMenuContent>
		</ContextMenu>
	);
}
