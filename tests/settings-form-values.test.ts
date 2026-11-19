import { describe, expect, it } from "bun:test";
import type { SystemSettingItemView } from "@reelvault/sdk";
import { buildInitial, readItemValue } from "@/pages/admin/settings/components/settings-group-view";

function item(key: string, value: unknown): SystemSettingItemView {
	return { key, group: "resources", type: typeof value, value, default: value, isCustom: false };
}

describe("settings form values", () => {
	it("builds nested values for dotted setting keys", () => {
		const values = buildInitial([item("system.resources.monitoringEnabled", true), item("ffmpeg.crf", 23)]);

		expect(values).toEqual({
			system: { resources: { monitoringEnabled: true } },
			ffmpeg: { crf: 23 },
		});
	});

	it("reads dotted keys from the nested values", () => {
		const values = buildInitial([item("system.resources.monitoringEnabled", true)]);

		expect(readItemValue(values, "system.resources.monitoringEnabled")).toBe(true);
		expect(readItemValue(values, "system.resources.missing")).toBeUndefined();
	});
});
