import { createContext, useContext } from "react";
import type { PluginUiPlayerContext } from "reelvault-sdk/plugin";

export interface PluginDialogRequest {
	pluginId: string;
	dialog: string;
	params?: Record<string, string> | undefined;
	player?: PluginUiPlayerContext | undefined;
}

export interface PluginDialogController {
	openDialog: (request: PluginDialogRequest) => void;
	closeDialog: () => void;
}

export const PluginDialogContext = createContext<PluginDialogController | null>(null);

export function usePluginDialogController(): PluginDialogController {
	const controller = useContext(PluginDialogContext);
	if (!controller) throw new Error("usePluginDialogController must be used within a PluginDialogProvider");

	return controller;
}
