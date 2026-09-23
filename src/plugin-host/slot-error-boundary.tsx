import { Component, type ReactNode } from "react";

interface PluginSlotBoundaryProps {
	pluginId: string;
	children: ReactNode;
}

interface PluginSlotBoundaryState {
	failed: boolean;
}

/**
 * Isolates a single plugin slot contribution. Schema surfaces render inside the
 * host React tree, so an uncaught throw would take down the whole route (and
 * every sibling contribution). Custom elements already fail in isolation; this
 * closes the same gap for host-rendered surfaces.
 */
export class PluginSlotBoundary extends Component<PluginSlotBoundaryProps, PluginSlotBoundaryState> {
	override state: PluginSlotBoundaryState = { failed: false };

	static getDerivedStateFromError(): PluginSlotBoundaryState {
		return { failed: true };
	}

	override componentDidCatch(error: unknown): void {
		console.error(`Plugin slot contribution failed for "${this.props.pluginId}"`, error);
	}

	override render(): ReactNode {
		if (this.state.failed) return null;

		return this.props.children;
	}
}
