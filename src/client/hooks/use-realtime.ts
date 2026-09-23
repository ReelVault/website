import type { PlaybackCommand, RealtimeEventMap, RealtimeEventMessage } from "@reelvault/sdk";
import { useEffect, useRef } from "react";
import { safeUuid } from "@/utils/id-utils";
import { reelvault } from "../client";

type EventCallback<T = unknown> = (data: T, event: RealtimeEventMessage<T>) => void;

export type RealtimeStatus = "idle" | "connecting" | "open" | "reconnecting";

// Listeners are stored under their event-type key, so the registry can only
// hand out callbacks that accept the narrowest payload — dispatch re-checks the
// message shape before invoking them.
type StoredEventCallback = EventCallback<never>;

function isRealtimeEventMessage(value: unknown): value is RealtimeEventMessage<never> {
	return (
		typeof value === "object" &&
		value !== null &&
		"type" in value &&
		"payload" in value &&
		"occurredAt" in value &&
		typeof value.type === "string" &&
		typeof value.occurredAt === "string"
	);
}

function parseRealtimeEventMessage(raw: unknown): RealtimeEventMessage<never> | null {
	if (typeof raw !== "string") return null;

	try {
		const parsed: unknown = JSON.parse(raw);

		return isRealtimeEventMessage(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

function isPongMessage(value: unknown): boolean {
	return typeof value === "object" && value !== null && "type" in value && value.type === "pong";
}

function parseJsonLoose(raw: unknown): unknown {
	if (typeof raw !== "string") return null;

	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function isControlFrame(value: unknown): value is Record<string, unknown> & { type: string } {
	return typeof value === "object" && value !== null && "type" in value && typeof value.type === "string";
}

// Must stay below the server's 60 s stale-connection timeout so an idle-but-
// healthy socket is never reaped.
const PING_INTERVAL_MS = 25_000;
// Reset the reconnect backoff only after the socket has stayed up this long — a
// server that accepts then immediately closes must not cause a 1 s retry loop.
const STABLE_CONNECTION_MS = 5_000;
const COMMAND_ACK_TIMEOUT_MS = 2_000;
// WebSocket close codes that mean "retrying cannot succeed" (auth rejected).
const AUTH_CLOSE_CODES = new Set([4001, 4401, 4403]);

// Module-level external store so any component (e.g. navbar indicator) can
// observe connection health without plumbing through the providers.
let realtimeStatus: RealtimeStatus = "idle";
const statusListeners = new Set<() => void>();

function setRealtimeStatus(next: RealtimeStatus): void {
	if (realtimeStatus === next) return;

	realtimeStatus = next;
	for (const listener of statusListeners) listener();
}

export function getRealtimeStatus(): RealtimeStatus {
	return realtimeStatus;
}

export function subscribeRealtimeStatus(listener: () => void): () => void {
	statusListeners.add(listener);

	return () => statusListeners.delete(listener);
}

// Auth gate: without a session every connect attempt is a guaranteed 401
// handshake (public pages like /setup subscribe through hooks mounted above the
// session provider), so connections and reconnect loops stay disabled until the
// session provider confirms an authenticated user.
let connectionAllowed = false;

class RealtimeConnection {
	private socket: WebSocket | null = null;
	private readonly listeners = new Map<string, Set<StoredEventCallback>>();
	private readonly sessionSubscriptions = new Set<string>();
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	private reconnectAttempts = 0;
	private isConnecting = false;
	private currentProfileId: string | null = null;
	private pingTimer: ReturnType<typeof setInterval> | null = null;
	private lastPongAt = 0;
	private stableTimer: ReturnType<typeof setTimeout> | null = null;
	private readonly pendingCommands = new Map<string, { resolve: (delivered: boolean) => void; timer: ReturnType<typeof setTimeout> }>();

	constructor() {
		// While the tab/app is hidden (phone in pocket, background tab) a dead
		// socket must not trigger endless reconnect attempts; we resume eagerly
		// when the page becomes visible again.
		if (typeof document !== "undefined") {
			document.addEventListener("visibilitychange", this.handleVisibilityChange);
		}
	}

	private readonly handleVisibilityChange = (): void => {
		if (typeof document === "undefined") return;

		if (document.visibilityState !== "visible") return;

		if (!(this.socket || this.isConnecting)) {
			if (this.reconnectTimer) {
				clearTimeout(this.reconnectTimer);
				this.reconnectTimer = null;
			}

			this.connect();
		}
	};

	private readonly handleOpen = (): void => {
		this.isConnecting = false;
		setRealtimeStatus("open");
		this.lastPongAt = Date.now();
		this.startHeartbeat();
		// Delay the backoff reset until the socket proves stable.
		if (this.stableTimer) clearTimeout(this.stableTimer);

		this.stableTimer = setTimeout(() => {
			this.stableTimer = null;
			this.reconnectAttempts = 0;
		}, STABLE_CONNECTION_MS);
		// Re-attach HLS session subscriptions after (re)connect — playback
		// command delivery is routed by subscribed session id.
		for (const sessionId of this.sessionSubscriptions) {
			this.sendSubscribeSession(sessionId);
		}
	};

	private startHeartbeat(): void {
		this.stopHeartbeat();
		this.pingTimer = setInterval(() => {
			if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

			// A missed pong means the socket is half-open (server writing into a
			// dead peer); close so the normal reconnect path takes over.
			if (this.lastPongAt < Date.now() - PING_INTERVAL_MS * 2) {
				this.socket.close();

				return;
			}

			this.socket.send(JSON.stringify({ type: "ping" }));
		}, PING_INTERVAL_MS);
	}

	private stopHeartbeat(): void {
		if (this.pingTimer) {
			clearInterval(this.pingTimer);
			this.pingTimer = null;
		}
	}

	private readonly handleMessage = (event: MessageEvent): void => {
		// Ignore non-JSON messages (e.g. heartbeat pong) — parse returns null.
		const message = parseRealtimeEventMessage(event.data);
		if (!message) {
			const control = parseJsonLoose(event.data);
			if (isPongMessage(control)) {
				this.lastPongAt = Date.now();
			} else {
				this.handleControlFrame(control);
			}

			return;
		}

		const handlers = this.listeners.get(message.type);
		if (handlers) {
			for (const handler of handlers) {
				// One throwing listener must not stop the others for this event.
				try {
					handler(message.payload, message);
				} catch (error) {
					console.error("Realtime event handler failed", error, { type: message.type });
				}
			}
		}

		// Wildcard listeners
		const allHandlers = this.listeners.get("*");
		if (allHandlers) {
			for (const handler of allHandlers) {
				try {
					handler(message.payload, message);
				} catch (error) {
					console.error("Realtime wildcard handler failed", error, { type: message.type });
				}
			}
		}
	};

	/** Control frames are not `RealtimeEventMessage`s: they carry no payload/occurredAt. */
	private handleControlFrame(value: unknown): void {
		if (!isControlFrame(value)) return;

		if (value.type === "session:subscribe:denied" && typeof value.sessionId === "string") {
			// Over the per-connection cap (or ownership denied) — stop resending it.
			this.sessionSubscriptions.delete(value.sessionId);

			return;
		}

		if (value.type === "playback_command_ack") {
			const requestId = typeof value.requestId === "string" ? value.requestId : undefined;
			if (requestId) this.resolvePendingCommand(requestId, value.delivered === true);

			return;
		}

		if (value.type === "playback_command_error") {
			const requestId = typeof value.requestId === "string" ? value.requestId : undefined;
			if (requestId) this.resolvePendingCommand(requestId, false);
		}
	}

	private readonly handleClose = (event: CloseEvent): void => {
		const wasOpen = this.socket !== null;
		this.cleanup();
		this.resolveAllPendingCommands(false);
		// Auth rejection: retrying the same socket cannot succeed; the next API
		// 401 drives the re-authentication redirect instead.
		if (AUTH_CLOSE_CODES.has(event.code)) {
			setRealtimeStatus("idle");

			return;
		}

		setRealtimeStatus(wasOpen || realtimeStatus === "open" ? "reconnecting" : "idle");
		this.scheduleReconnect();
	};

	private readonly handleError = (): void => {
		this.cleanup();
		this.resolveAllPendingCommands(false);
		setRealtimeStatus(realtimeStatus === "idle" ? "idle" : "reconnecting");
		this.scheduleReconnect();
	};

	setProfileId(profileId: string | null | undefined): void {
		const nextProfileId = profileId ?? null;
		if (this.currentProfileId === nextProfileId) return;

		this.currentProfileId = nextProfileId;
		if (this.socket || this.isConnecting) {
			this.disconnect();
			this.connect();
		}
	}

	connect(): void {
		if (typeof window === "undefined" || !connectionAllowed || this.socket || this.isConnecting) return;

		this.isConnecting = true;
		setRealtimeStatus(this.reconnectAttempts > 0 ? "reconnecting" : "connecting");

		try {
			const url = reelvault.events.getWebSocketUrl(this.currentProfileId ? { profileId: this.currentProfileId } : undefined);
			const ws = new WebSocket(url);
			this.socket = ws;
			ws.addEventListener("open", this.handleOpen);
			ws.addEventListener("message", this.handleMessage);
			ws.addEventListener("close", this.handleClose);
			ws.addEventListener("error", this.handleError);
		} catch {
			this.cleanup();
			setRealtimeStatus("reconnecting");
			this.scheduleReconnect();
		}
	}

	subscribe(eventType: string, callback: StoredEventCallback): () => void {
		let handlers = this.listeners.get(eventType);
		if (!handlers) {
			handlers = new Set();
			this.listeners.set(eventType, handlers);
		}

		handlers.add(callback);

		if (!(this.socket || this.isConnecting)) {
			this.connect();
		}

		return () => {
			handlers.delete(callback);
			if (handlers.size === 0) {
				this.listeners.delete(eventType);
			}
		};
	}

	/**
	 * Subscribes this WS connection to an HLS playback session so server-sent
	 * `playback:command` events reach this client. Re-sent automatically after
	 * every (re)connect until `unsubscribeFromSession` is called.
	 */
	subscribeToSession(sessionId: string): void {
		if (!sessionId) return;

		const wasAlreadyAdded = this.sessionSubscriptions.has(sessionId);
		this.sessionSubscriptions.add(sessionId);
		if (!(this.socket || this.isConnecting)) {
			this.connect();
		}

		if (!wasAlreadyAdded || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
			this.sendSubscribeSession(sessionId);
		}
	}

	unsubscribeFromSession(sessionId: string): void {
		if (!sessionId) return;

		this.sessionSubscriptions.delete(sessionId);
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify({ type: "unsubscribe_session", sessionId }));
		}
	}

	/**
	 * Sends a playback command and waits for the server's ack, so the remote can
	 * tell "delivered to a player" from "nobody is subscribed". Returns `null`
	 * when no socket is open (caller should fall back to HTTP); `false` on an
	 * explicit not-delivered ack or when the ack does not arrive in time.
	 */
	async sendCommandWithAck(sessionId: string, command: PlaybackCommand, timeoutMs = COMMAND_ACK_TIMEOUT_MS): Promise<boolean | null> {
		const socket = this.socket;
		if (!socket || socket.readyState !== WebSocket.OPEN) return null;

		const requestId = safeUuid();
		const delivered = await new Promise<boolean>((resolve) => {
			const timer = setTimeout(() => {
				if (this.pendingCommands.delete(requestId)) resolve(false);
			}, timeoutMs);
			this.pendingCommands.set(requestId, {
				resolve: (value) => {
					clearTimeout(timer);
					resolve(value);
				},
				timer,
			});
			socket.send(JSON.stringify({ type: "playback_command", sessionId, command, requestId }));
		});

		return delivered;
	}

	private resolvePendingCommand(requestId: string, delivered: boolean): void {
		const entry = this.pendingCommands.get(requestId);
		if (!entry) return;

		this.pendingCommands.delete(requestId);
		entry.resolve(delivered);
	}

	private resolveAllPendingCommands(delivered: boolean): void {
		for (const [requestId, entry] of this.pendingCommands) {
			clearTimeout(entry.timer);
			entry.resolve(delivered);
			this.pendingCommands.delete(requestId);
		}
	}

	disconnect(): void {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		// Explicit teardown (logout / profile switch) must drop playback
		// subscriptions too, otherwise the next session replays another
		// user/profile's session ids into `subscribe_session`.
		this.sessionSubscriptions.clear();
		this.cleanup();
		setRealtimeStatus("idle");
	}

	private sendSubscribeSession(sessionId: string): void {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify({ type: "subscribe_session", sessionId }));
		}
	}

	private cleanup(): void {
		this.isConnecting = false;
		this.stopHeartbeat();
		if (this.stableTimer) {
			clearTimeout(this.stableTimer);
			this.stableTimer = null;
		}

		if (this.socket) {
			const ws = this.socket;
			ws.removeEventListener("open", this.handleOpen);
			ws.removeEventListener("message", this.handleMessage);
			ws.removeEventListener("close", this.handleClose);
			ws.removeEventListener("error", this.handleError);
			try {
				ws.close();
			} catch {
				// Ignore close error
			}

			this.socket = null;
		}
	}

	private scheduleReconnect(): void {
		if (this.reconnectTimer) return;

		// No session: retrying cannot succeed until the provider re-enables it.
		if (!connectionAllowed) return;

		// Hidden page: skip scheduling entirely — handleVisibilityChange reconnects
		// as soon as the page is visible again.
		if (typeof document === "undefined") return;

		if (document.visibilityState === "hidden") return;

		const base = Math.min(10_000, 1000 * 2 ** this.reconnectAttempts);
		// Jitter the backoff (50-100% of base) so a server restart does not make
		// every client retry on the same schedule (thundering herd).
		const delay = Math.round(base * (0.5 + Math.random() * 0.5));
		this.reconnectAttempts++;
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null;
			this.connect();
		}, delay);
	}
}

export const realtimeConnection = new RealtimeConnection();

export function setRealtimeConnectionAllowed(allowed: boolean): void {
	connectionAllowed = allowed;
	if (!allowed) realtimeConnection.disconnect();
}

export function useRealtimeEvent<T = undefined, E extends string = string>(
	eventType: E,
	callback: EventCallback<[T] extends [undefined] ? (E extends keyof RealtimeEventMap ? RealtimeEventMap[E] : unknown) : T>,
): void {
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	});

	useEffect(() => {
		const unsubscribe = realtimeConnection.subscribe(eventType, (data, event) => {
			callbackRef.current(data, event);
		});

		return unsubscribe;
	}, [eventType]);
}
