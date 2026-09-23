import { Link } from "@tanstack/react-router";
import { Copy, ImageDown, RefreshCw, Shield, User } from "lucide-react";
import type { useAdminPeople } from "@/client/hooks/use-admin-people";
import { ApiImage } from "@/components/ui/api-image";
import { Card, CardContent } from "@/components/ui/card";
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
import { copyToClipboard } from "@/utils/clipboard-utils";

type PersonItem = ReturnType<typeof useAdminPeople>["people"][number];

interface PersonCardProps {
	person: PersonItem;
	onRefresh: (id: string) => void;
	onRefreshImage: (id: string) => void;
}

export function PersonCard({ person, onRefresh, onRefreshImage }: PersonCardProps) {
	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<Link to="/person/$id" params={{ id: person.id }} className="group block focus:outline-none">
					<Card className="h-full overflow-hidden border-border/80 bg-card transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-primary/40 hover:bg-muted/20 hover:shadow-xs">
						<div className="relative aspect-2/3 w-full overflow-hidden border-border/60 border-b bg-muted/40">
							{person.imageId ? (
								<ApiImage
									fileId={person.imageId}
									alt={person.name}
									width={220}
									aspectRatio={2 / 3}
									sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
									className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
									<User className="size-12" />
								</div>
							)}
						</div>
						<CardContent className="p-3 text-center">
							<h3 className="truncate font-semibold text-foreground text-sm tracking-tight group-hover:text-primary" title={person.name}>
								{person.name}
							</h3>
						</CardContent>
					</Card>
				</Link>
			</ContextMenuTrigger>
			<ContextMenuContent className="w-64 border-border bg-popover shadow-xl">
				<ContextMenuGroup>
					<ContextMenuLabel className="truncate font-bold text-foreground text-xs uppercase tracking-wider">{person.name}</ContextMenuLabel>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuGroup>
					<ContextMenuItem render={<Link to="/person/$id" params={{ id: person.id }} />} className="cursor-pointer gap-2.5">
						<User className="size-4 text-muted-foreground" />
						<span>{m.components_person_view_profile()}</span>
					</ContextMenuItem>
					<ContextMenuItem
						onClick={() => {
							detach(copyToClipboard(`${window.location.origin}/person/${person.id}`, m.components_profile_link_word()));
						}}
						className="cursor-pointer gap-2.5"
					>
						<Copy className="size-4 text-muted-foreground" />
						<span>{m.components_copy_profile_link()}</span>
					</ContextMenuItem>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuGroup>
					<ContextMenuLabel className="flex items-center gap-1.5 font-bold text-[10px] text-primary uppercase tracking-widest">
						<Shield className="size-3" />
						{m.common_admin_tools()}
					</ContextMenuLabel>
					<ContextMenuItem onClick={() => onRefresh(person.id)} className="cursor-pointer gap-2.5">
						<RefreshCw className="size-4 text-primary" />
						<span>{m.components_person_refresh_data()}</span>
					</ContextMenuItem>
					<ContextMenuItem onClick={() => onRefreshImage(person.id)} className="cursor-pointer gap-2.5">
						<ImageDown className="size-4 text-primary" />
						<span>{m.components_person_force_photo()}</span>
					</ContextMenuItem>
					<ContextMenuItem
						onClick={() => {
							detach(copyToClipboard(person.id, m.components_person_id()));
						}}
						className="cursor-pointer gap-2.5"
					>
						<Copy className="size-4 text-muted-foreground" />
						<span>{m.components_copy_person_id()}</span>
					</ContextMenuItem>
				</ContextMenuGroup>
			</ContextMenuContent>
		</ContextMenu>
	);
}
