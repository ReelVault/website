import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import type { PluginArchiveEntry, PluginArchiveSummary } from "@/client/hooks/use-plugin-catalog";
import { PluginUploadProgress } from "@/pages/admin/plugins/components/plugin-upload-progress";
import { overwriteGetLocale } from "@/paraglide/runtime";
import { ensureDom, unregisterDom } from "./register-dom";

overwriteGetLocale(() => "en");
beforeAll(() => ensureDom());
afterEach(() => cleanup());
afterAll(() => unregisterDom());

const CLOSE_LABEL = /close/i;

function entry(id: string, status: PluginArchiveEntry["status"], error?: string): PluginArchiveEntry {
	const file = new File(["archive"], `${id}.zip`, { type: "application/zip" });

	return { id, file, status, uploadedBytes: file.size, totalBytes: file.size, error };
}

function summary(doneCount: number, total: number): PluginArchiveSummary {
	return {
		doneCount,
		total,
		currentEntry: null,
		overallPercent: Math.round((doneCount / total) * 100),
		uploadedBytes: 0,
		totalBytes: 0,
		etaSeconds: null,
	};
}

describe("plugin upload queue", () => {
	test("a refused archive shows its file name, the failed state and the reason it was not installed", () => {
		const reason = 'Not installed: The plugin id "bad id!" contains unsupported characters.';
		const view = render(
			<PluginUploadProgress
				entries={[entry("broken", "failed", reason), entry("good", "installed")]}
				summary={summary(2, 2)}
				onClose={() => undefined}
			/>,
		);

		expect(view.getByText("broken.zip")).toBeTruthy();
		expect(view.getByText("good.zip")).toBeTruthy();
		expect(view.getByText(reason)).toBeTruthy();
		expect(view.getByText("Failed")).toBeTruthy();
		expect(view.getByText("Installed")).toBeTruthy();
	});

	test("the close control hands control back to the page", () => {
		let closed = 0;
		const view = render(
			<PluginUploadProgress
				entries={[entry("broken", "failed", "Not installed: refused")]}
				summary={summary(1, 1)}
				onClose={() => (closed += 1)}
			/>,
		);

		const closeButton = view
			.getAllByRole("button")
			.find((button) => CLOSE_LABEL.test(button.getAttribute("aria-label") ?? button.textContent ?? ""));
		expect(closeButton).toBeDefined();
		if (closeButton) fireEvent.click(closeButton);

		expect(closed).toBe(1);
	});

	test("an empty batch renders nothing", () => {
		const { container } = render(<PluginUploadProgress entries={[]} summary={null} onClose={() => undefined} />);

		expect(container.textContent).toBe("");
	});
});
