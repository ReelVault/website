import { describe, expect, it } from "bun:test";
import { activeStreamsBlocking } from "@/utils/stream-block";

describe("activeStreamsBlocking", () => {
	it("reads the stream count from a server update held back by the stream guard", () => {
		expect(activeStreamsBlocking({ code: "update.blocked_active_streams", params: { activeStreams: 2 } })).toBe(2);
	});

	it("reads the stream count from a database restore held back by the stream guard", () => {
		expect(activeStreamsBlocking({ code: "database.restore_blocked_active_streams", params: { activeStreams: 1 } })).toBe(1);
	});

	it("ignores other errors, including thrown Error instances and empty values", () => {
		expect(activeStreamsBlocking({ code: "update.up_to_date" })).toBeNull();
		expect(activeStreamsBlocking(new Error("network down"))).toBeNull();
		expect(activeStreamsBlocking(null)).toBeNull();
	});
});
