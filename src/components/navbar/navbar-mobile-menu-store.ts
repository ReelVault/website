import { useSyncExternalStore } from "react";

/**
 * External store for the mobile nav menu open state — NavbarBottomBar
 * and NavbarMobileSheet subscribe directly; AppNavbar holds no state and does not
 * re-render when the sheet opens or closes.
 */
let isOpen = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}

function emit() {
	for (const listener of listeners) listener();
}

export function useNavbarMobileMenu(): boolean {
	return useSyncExternalStore(
		subscribe,
		() => isOpen,
		() => false,
	);
}

export function setNavbarMobileMenuOpen(next: boolean) {
	if (next === isOpen) return;

	isOpen = next;
	emit();
}
