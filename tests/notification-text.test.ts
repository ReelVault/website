import { describe, expect, test } from "bun:test";
import type { Notification } from "@reelvault/sdk";
import { getNotificationText } from "@/utils/notification-utils";

function notification(overrides: Partial<Notification>): Notification {
	return {
		id: "n1",
		userId: "admin-1",
		profileId: null,
		type: "resource_alert",
		title: "",
		message: null,
		data: {},
		link: null,
		readAt: null,
		createdAt: new Date("2026-01-01T00:00:00.000Z"),
		updatedAt: new Date("2026-01-01T00:00:00.000Z"),
		...overrides,
	};
}

describe("getNotificationText", () => {
	// The server stores resource alerts with the message key in `title` and the
	// reading in `data.percent`; showing that key verbatim leaked `system.memory_high`
	// into the notification list.
	test.each([
		["system.memory_high", 87.4, "87"],
		["system.memory_critical", 96, "96"],
		["system.disk_low", 91.6, "92"],
	])("translates the %s resource alert", (code, percent, expectedReading) => {
		const { title, body } = getNotificationText(notification({ title: code, data: { percent } }));

		expect(title).not.toContain("system.");
		expect(title).toContain(expectedReading);
		expect(body).toBeNull();
	});

	test("keeps an unknown resource alert code visible instead of hiding it", () => {
		const { title } = getNotificationText(notification({ title: "system.something_new" }));

		expect(title).toBe("system.something_new");
	});

	test("passes human-written titles through unchanged", () => {
		const { title, body } = getNotificationText(
			notification({ type: "bug-report", title: "Playback stutters", message: "Every 30 seconds" }),
		);

		expect(title).toBe("Playback stutters");
		expect(body).toBe("Every 30 seconds");
	});
});
