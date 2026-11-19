import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Shield } from "lucide-react";
import type { ComponentType, ReactElement, ReactNode } from "react";
import { m } from "@/paraglide/messages";
import { buildMetadataCardMenuItems, type MetadataCardMenuItem, type MetadataCardMenuState } from "./metadata-card-menu-items";

interface MenuItemProps {
	disabled?: boolean | undefined;
	nativeButton?: boolean | undefined;
	render?: ReactElement | undefined;
	onClick?: ((event: { stopPropagation: () => void }) => void) | undefined;
	className?: string;
	children?: ReactNode;
}

/** The menu primitives one menu flavour (context menu, dropdown) renders the sections with. */
export interface MenuParts {
	Group: ComponentType<{ children?: ReactNode }>;
	Item: ComponentType<MenuItemProps>;
	Label: ComponentType<{ className?: string; children?: ReactNode }>;
	Separator: ComponentType;
	/** Trailing hint on items that open the title (the context menu shows "Enter"). */
	shortcut?: ReactNode;
}

function MenuItem({ item, parts }: { item: MetadataCardMenuItem; parts: MenuParts }) {
	const { Item } = parts;

	return (
		<Item
			disabled={item.disabled}
			nativeButton={item.link ? false : undefined}
			render={item.link ? <Link to={item.link.to} params={{ id: item.link.id }} /> : undefined}
			onClick={
				item.action
					? (event) => {
							if (item.stopPropagation) event.stopPropagation();

							item.action?.();
						}
					: undefined
			}
			className="cursor-pointer"
		>
			<item.icon className={cn("size-4", item.iconClassName)} />
			<span>{item.label}</span>
			{item.showShortcut && parts.shortcut}
		</Item>
	);
}

/** Title, main actions and (for admins) the admin tools of a title card menu, in either menu flavour. */
export function MetadataCardMenuSections({ state, parts }: { state: MetadataCardMenuState; parts: MenuParts }) {
	const { Group, Label, Separator } = parts;
	const items = buildMetadataCardMenuItems(state);
	const mainItems = items.filter((item) => item.admin !== true);
	const adminItems = items.filter((item) => item.admin === true);

	return (
		<>
			<Group>
				<Label className="truncate">{state.title}</Label>
			</Group>
			<Separator />
			<Group>
				{mainItems.map((item) => (
					<MenuItem key={item.id} item={item} parts={parts} />
				))}
			</Group>
			{state.isAdmin === true && (
				<>
					<Separator />
					<Group>
						<Label className="flex items-center">
							<Shield className="size-3" />
							{m.common_admin_tools()}
						</Label>
						{adminItems.map((item) => (
							<MenuItem key={item.id} item={item} parts={parts} />
						))}
					</Group>
				</>
			)}
		</>
	);
}
