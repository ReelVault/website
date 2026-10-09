/** Codes the server answers with when it holds a restart or restore back because streams are playing. */
const STREAM_BLOCK_CODES: ReadonlySet<string> = new Set(["update.blocked_active_streams", "database.restore_blocked_active_streams"]);

/** The number of active streams when the stream guard held a request back, or `null` for any other error. */
export function activeStreamsBlocking(error: unknown): number | null {
	if (!error || typeof error !== "object") return null;

	const { code, params } = error as { code?: unknown; params?: unknown };
	if (typeof code !== "string" || !STREAM_BLOCK_CODES.has(code)) return null;

	const activeStreams = params && typeof params === "object" ? (params as { activeStreams?: unknown }).activeStreams : undefined;

	return typeof activeStreams === "number" ? activeStreams : 0;
}
