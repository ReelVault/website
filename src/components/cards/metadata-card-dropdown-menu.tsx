import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { MoreVertical, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { PluginSlotHost } from "@/plugin-host/slot-host.lazy";
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
			className="cursor-pointer"
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
				render={<Button variant="outline" size="icon" />}
				className="flex items-center justify-center"
			>
				<MoreVertical className="size-4 text-foreground" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="truncate">{state.title}</DropdownMenuLabel>
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
							<DropdownMenuLabel className="flex items-center">
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
