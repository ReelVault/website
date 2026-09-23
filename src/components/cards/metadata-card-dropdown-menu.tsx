import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { MoreVertical, Shield } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { m } from "@/paraglide/messages";
import { PluginSlotHost } from "@/plugin-host/slot-host";
import { buildMetadataCardMenuItems, type MetadataCardMenuItem, type MetadataCardMenuState } from "./metadata-card-menu-items";

function DropdownMenuItemRenderer({ item, onAction }: { item: MetadataCardMenuItem; onAction: (item: MetadataCardMenuItem) => void }) {
	return (
		<DropdownMenuItem
			disabled={item.disabled}
			nativeButton={item.link ? false : undefined}
			render={item.link ? <Link to={item.link.to} params={{ id: item.link.id }} /> : undefined}
			onClick={
				item.action
					? (event) => {
							if (item.stopPropagation) event.stopPropagation();

							onAction(item);
						}
					: undefined
			}
			className="cursor-pointer gap-2.5"
		>
			<item.icon className={cn("size-4", item.iconClassName)} />
			<span>{item.label}</span>
		</DropdownMenuItem>
	);
}

function runItemAction(item: MetadataCardMenuItem): void {
	item.action?.();
}

export function MetadataCardDropdownMenu(state: MetadataCardMenuState) {
	const items = buildMetadataCardMenuItems(state);
	const mainItems = items.filter((item) => item.admin !== true);
	const adminItems = items.filter((item) => item.admin === true);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label={m.components_options_for({ title: state.title })}
				className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-background/80 transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-primary"
			>
				<MoreVertical className="size-4 text-foreground" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64 border-border bg-card/95">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="truncate font-bold text-foreground text-xs uppercase tracking-wider">
						{state.title}
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					{mainItems.map((item) => (
						<DropdownMenuItemRenderer key={item.id} item={item} onAction={runItemAction} />
					))}
					<PluginSlotHost name="media-file-card-actions" />
				</DropdownMenuGroup>

				{/* Sekcja Administratora */}
				{state.isAdmin === true && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuLabel className="flex items-center gap-1.5 font-bold text-[10px] text-primary uppercase tracking-widest">
								<Shield className="size-3" />
								{m.common_admin_tools()}
							</DropdownMenuLabel>
							{adminItems.map((item) => (
								<DropdownMenuItemRenderer key={item.id} item={item} onAction={runItemAction} />
							))}
						</DropdownMenuGroup>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
