import { useTheme } from "next-themes";
import {
	PLUGIN_UI_PROTOCOL_VERSION,
	type PluginUiContext,
	type PluginUiDeviceContext,
	type PluginUiPlayerContext,
} from "reelvault-sdk/plugin";
import { getReelVaultApiUrl } from "@/client/client";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { getAppLocale } from "@/utils/locale";

const BROWSER_TOKENS: ReadonlyArray<readonly [token: string, name: string]> = [
	["Edg/", "Edge"],
	["OPR/", "Opera"],
	["Firefox/", "Firefox"],
	["Chrome/", "Chrome"],
	["Safari/", "Safari"],
];

const OS_TOKENS: ReadonlyArray<readonly [token: string, name: string]> = [
	["Windows", "Windows"],
	["Android", "Android"],
	["iPhone", "iOS"],
	["iPad", "iOS"],
	["Mac OS X", "macOS"],
	["Linux", "Linux"],
];

function matchToken(userAgent: string, tokens: ReadonlyArray<readonly [string, string]>): string | undefined {
	return tokens.find(([token]) => userAgent.includes(token))?.[1];
}

function readDeviceContext(): PluginUiDeviceContext {
	if (typeof navigator === "undefined") return {};

	const userAgent = navigator.userAgent;

	return {
		userAgent,
		language: navigator.language,
		...(typeof window !== "undefined" ? { screenResolution: `${window.screen.width}x${window.screen.height}` } : {}),
		...(matchToken(userAgent, BROWSER_TOKENS) ? { browser: matchToken(userAgent, BROWSER_TOKENS) } : {}),
		...(matchToken(userAgent, OS_TOKENS) ? { os: matchToken(userAgent, OS_TOKENS) } : {}),
	};
}

export interface PluginSurfaceIdentity {
	pluginId: string;
	/** Page id when the surface is a page or tab. */
	page?: string | undefined;
	/** Dialog id when the surface is a dialog. */
	dialog?: string | undefined;
	params?: Record<string, string> | undefined;
	player?: PluginUiPlayerContext | undefined;
}

/** Builds the ambient context shared with a mounted plugin surface. */
export function usePluginUiContext(identity: PluginSurfaceIdentity): PluginUiContext {
	const { user, profile } = useCurrentUser();
	const { resolvedTheme } = useTheme();
	const locale = getAppLocale();
	const device = readDeviceContext();

	return {
		protocolVersion: PLUGIN_UI_PROTOCOL_VERSION,
		pluginId: identity.pluginId,
		...(identity.page ? { page: identity.page } : {}),
		...(identity.dialog ? { dialog: identity.dialog } : {}),
		params: identity.params ?? {},
		locale,
		theme: resolvedTheme === "light" ? "light" : "dark",
		apiBaseUrl: getReelVaultApiUrl(),
		...(typeof window !== "undefined" ? { pageUrl: window.location.href } : {}),
		...(user ? { user: { id: user.id, role: user.role, name: user.name } } : {}),
		...(profile ? { profile: { id: profile.id, name: profile.name } } : {}),
		...(identity.player ? { player: identity.player } : {}),
		device,
	};
}
