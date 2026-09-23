import type { AsyncRouteComponent } from "@tanstack/react-router";
import { createElement, type FunctionComponent, type ReactNode, use } from "react";

function getModuleNotFoundMessage(error: Error): string | null {
	const { message } = error;
	if (
		message.startsWith("Failed to fetch dynamically imported module") ||
		message.startsWith("error loading dynamically imported module") ||
		message.startsWith("Importing a module script failed")
	) {
		return message;
	}

	return null;
}

function markReloadAttempt(message: string): boolean {
	const storageKey = `tanstack_router_reload:${message}`;
	try {
		if (sessionStorage.getItem(storageKey)) return false;

		sessionStorage.setItem(storageKey, "1");

		return true;
	} catch {
		return true;
	}
}

const neverSettles = <T>(): Promise<T> =>
	new Promise<T>(() => {
		// Intentionally left pending while the document reloads.
	});

/**
 * Local replacement for `@tanstack/react-router`'s `lazyRouteComponent`.
 *
 * Upstream only calls `use()` while the module is still loading and skips it
 * once the component is cached, which React 19 flags as conditional `use()`.
 * Here the same promise is always passed to `use()`, as React requires.
 */
export function lazyRouteComponent<TProps extends object = Record<string, unknown>>(
	importer: () => Promise<{ default: FunctionComponent<TProps> }>,
): AsyncRouteComponent<TProps> {
	let loadPromise: Promise<FunctionComponent<TProps>> | undefined;

	const loadModule = async (): Promise<FunctionComponent<TProps>> => {
		try {
			const module = await importer();

			return module.default;
		} catch (caught) {
			const error = caught instanceof Error ? caught : new Error("Failed to load route module");
			const notFoundMessage = getModuleNotFoundMessage(error);
			if (notFoundMessage !== null && markReloadAttempt(notFoundMessage)) {
				window.location.reload();

				return neverSettles<FunctionComponent<TProps>>();
			}

			throw error;
		}
	};

	const load = (): Promise<FunctionComponent<TProps>> => {
		loadPromise ??= loadModule();

		return loadPromise;
	};

	const preload = async (): Promise<void> => {
		await load();
	};

	const Lazy = (props: TProps): ReactNode => {
		const Component = use(load());

		return createElement<TProps>(Component, props);
	};

	return Object.assign(Lazy, { preload });
}
