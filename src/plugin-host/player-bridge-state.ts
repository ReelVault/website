import type { PluginPlayerState } from "reelvault-sdk/plugin";

/**
 * Latest playback state of the mounted player, exposed to plugin surfaces
 * through the bridge. Written by a tiny sync component inside the player (an
 * external store, so ticks do not re-render the whole plugin host).
 */
export interface PlayerBridgeState extends PluginPlayerState {
	seek?: ((time: number) => void) | undefined;
}

let state: PlayerBridgeState = {};

export function setPlayerBridgeState(next: PlayerBridgeState): void {
	state = next;
}

export function getPlayerBridgeState(): PlayerBridgeState {
	return state;
}
