import { describe, expect, it, mock } from "bun:test";
import type { ReactElement } from "react";
import { ContextMenuItem } from "../src/components/ui/context-menu";
import { DropdownMenuItem } from "../src/components/ui/dropdown-menu";

interface MenuItemProps {
	onClick?: (event: object) => void;
}

describe("DropdownMenuItem and ContextMenuItem onSelect forwarding", () => {
	it("forwards onSelect and executes onClick on DropdownMenuItem", () => {
		const onSelect = mock();
		const onClick = mock();
		const element: ReactElement<MenuItemProps> = DropdownMenuItem({
			children: "Test",
			onClick,
			onSelect,
		});

		element.props.onClick?.({});
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledTimes(1);
	});

	it("forwards onSelect when onClick is omitted on ContextMenuItem", () => {
		const onSelect = mock();
		const element: ReactElement<MenuItemProps> = ContextMenuItem({
			children: "Test",
			onSelect,
		});

		element.props.onClick?.({});
		expect(onSelect).toHaveBeenCalledTimes(1);
	});
});
