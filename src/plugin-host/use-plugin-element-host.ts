import {
	PLUGIN_UI_PROTOCOL_VERSION,
	type PluginUiApi,
	type PluginUiApiCallOptions,
	type PluginUiContext,
	type PluginUiToastLevel,
} from "@reelvault/sdk/plugin";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { reelvault } from "@/client/client";
import { realtimeConnection } from "@/client/hooks/use-realtime";
import { detach } from "@/lib/detach";
import { toast } from "@/utils/toast-facade";
import { getPlayerBridgeState } from "./player-bridge-state";
import { usePluginDialogController } from "./plugin-dialog-context";

interface PluginElementHostOptions {
	pluginId: string;
	context: PluginUiContext;
	onClose?: (() => void) | undefined;
}

type Navigate = ReturnType<typeof useNavigate>;
type OpenDialog = ReturnType<typeof usePluginDialogController>["openDialog"];

interface HostRefs {
	navigate: { current: Navigate };
	openDialog: { current: OpenDialog };
	onClose: { current: (() => void) | undefined };
	context: { current: PluginUiContext };
	listeners: { current: Set<(next: PluginUiContext) => void> };
	/** Teardown callbacks for container/realtime subscriptions opened by the plugin. */
	disposers: { current: Set<() => void> };
}

/**
 * Builds the live `PluginUiHost` handed to a plugin custom element. The object
 * is created once (in an effect) and reads current values through refs — React
 * re-renders never invalidate it, and context updates are pushed via
 * `onContext`. Returns `null` for the first commit, then the stable host.
 */
export function usePluginElementHost({ pluginId, context, onClose }: PluginElementHostOptions) {
	const navigate = useNavigate();
	const { openDialog } = usePluginDialogController();

	const refsRef = useRef<HostRefs>({
		navigate: { current: navigate },
		openDialog: { current: openDialog },
		onClose: { current: onClose },
		context: { current: context },
		listeners: { current: new Set() },
		disposers: { current: new Set() },
	});
	const [host, setHost] = useState<ReturnType<typeof createHost> | null>(null);

	useEffect(() => {
		const refs = refsRef.current;
		refs.navigate.current = navigate;
		refs.openDialog.current = openDialog;
		refs.onClose.current = onClose;
		refs.context.current = context;
		for (const listener of refs.listeners.current) listener(context);
	}, [navigate, openDialog, onClose, context]);

	useEffect(() => {
		const refs = refsRef.current;
		// Capture the sets so the cleanup does not read `ref.current` (react-hooks
		// exhaustive-deps flags ref reads inside cleanup).
		const disposers = refs.disposers.current;
		const listeners = refs.listeners.current;
		setHost(createHost(pluginId, refs));

		// Unmount / plugin change: drop every realtime + context subscription the
		// plugin opened through the host (it may never call the returned unsub).
		return () => {
			for (const dispose of disposers) dispose();

			disposers.clear();
			listeners.clear();
			setHost(null);
		};
	}, [pluginId]);

	return host;
}

function createHost(pluginId: string, refs: HostRefs) {
	const api: PluginUiApi = {
		call: (path: string, callOptions?: PluginUiApiCallOptions) => reelvault.plugins.call(pluginId, path, callOptions),
	};

	return {
		protocolVersion: PLUGIN_UI_PROTOCOL_VERSION,
		pluginId,
		get context() {
			return refs.context.current;
		},
		api,
		navigate(to: string) {
			detach(refs.navigate.current({ href: to }));
		},
		openDialog(dialog: string, params?: Record<string, string>) {
			const current = refs.context.current;
			refs.openDialog.current({ pluginId, dialog, params: { ...current.params, ...params }, player: current.player });
		},
		close() {
			refs.onClose.current?.();
		},
		toast(level: PluginUiToastLevel, message: string) {
			if (level === "error") toast.error(message);
			else if (level === "success") toast.success(message);
			else toast.info(message);
		},
		getPlayerState() {
			const state = getPlayerBridgeState();

			return { currentTime: state.currentTime, duration: state.duration, mediaFileId: state.mediaFileId };
		},
		seek(time: number) {
			getPlayerBridgeState().seek?.(time);
		},
		onContext(listener: (next: PluginUiContext) => void) {
			refs.listeners.current.add(listener);
			const off = () => {
				refs.listeners.current.delete(listener);
			};
			refs.disposers.current.add(off);

			return () => {
				off();
				refs.disposers.current.delete(off);
			};
		},
		onEvent(event: string, listener: (payload: unknown) => void) {
			const off = realtimeConnection.subscribe(event, listener);
			refs.disposers.current.add(off);

			return () => {
				off();
				refs.disposers.current.delete(off);
			};
		},
	};
}
