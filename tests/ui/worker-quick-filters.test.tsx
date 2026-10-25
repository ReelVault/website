import { afterAll, afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import type { WorkerSummary } from "@reelvault/sdk";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { overwriteGetLocale } from "@/paraglide/runtime";
import { ensureDom, unregisterDom } from "./register-dom";

/**
 * The quick filters on the worker page: "Scheduled" keeps the tasks that have a trigger, "Active now"
 * keeps the tasks with a running operation, and "All" keeps every task. Each chip counts what it keeps.
 */

overwriteGetLocale(() => "en");
beforeAll(() => ensureDom());

// The list renders each category group once it scrolls into view; the test renders them all at once.
function LazyRender({ children }: { children: () => unknown }) {
	return children();
}

await mock.module("@/components/lazy-render", () => ({
	LazyRender,
}));

const { ScheduledTasksList } = await import("@/pages/admin/worker/components/scheduled-tasks-list");

function task(id: string, options: { scheduled?: boolean; active?: number }): WorkerSummary {
	return {
		id,
		name: `Task ${id}`,
		category: "library",
		concurrency: 1,
		timeoutMs: 60_000,
		stats: { workerId: id, concurrency: 1, timeoutMs: 60_000, waiting: 0, active: options.active ?? 0, completed: 0, failed: 0 },
		triggers: options.scheduled ? [{ id: `${id}-daily`, type: "daily", timeOfDay: "08:30" }] : [],
		scheduleEnabled: true,
	};
}

const tasks = [task("nightly", { scheduled: true }), task("rescan", { active: 1 }), task("idle", {})];

const noop = () => Promise.resolve();

const SCHEDULED_CHIP = /^Scheduled/;
const ACTIVE_CHIP = /^Active now/;
const ALL_CHIP = /^All/;

function renderList(list: WorkerSummary[] = tasks) {
	return render(
		<ScheduledTasksList
			tasks={list}
			onRunTask={noop}
			onCancelTask={noop}
			onToggleSchedule={noop}
			onRunCategory={noop}
			onUpdateTriggers={noop}
		/>,
	);
}

function chip(view: ReturnType<typeof renderList>, name: RegExp) {
	return view.getByRole("button", { name });
}

function visibleTaskNames(view: ReturnType<typeof renderList>): string[] {
	return tasks.map((item) => item.name).filter((name) => view.queryByText(name) !== null);
}

afterEach(() => cleanup());
afterAll(() => {
	mock.restore();
	unregisterDom();
});

describe("worker page quick filters", () => {
	test("Scheduled keeps only the tasks that have a trigger", () => {
		const view = renderList();

		fireEvent.click(chip(view, SCHEDULED_CHIP));

		expect(visibleTaskNames(view)).toEqual(["Task nightly"]);
	});

	test("Active now keeps only the tasks with a running operation", () => {
		const view = renderList();

		fireEvent.click(chip(view, ACTIVE_CHIP));

		expect(visibleTaskNames(view)).toEqual(["Task rescan"]);
	});

	test("All keeps every task again after a quick filter", () => {
		const view = renderList();

		fireEvent.click(chip(view, ACTIVE_CHIP));
		fireEvent.click(chip(view, ALL_CHIP));

		expect(visibleTaskNames(view)).toEqual(["Task nightly", "Task rescan", "Task idle"]);
	});

	test("each chip counts the tasks it keeps", () => {
		const view = renderList();

		expect(chip(view, SCHEDULED_CHIP).textContent).toContain("1");
		expect(chip(view, ACTIVE_CHIP).textContent).toContain("1");
		expect(chip(view, ALL_CHIP).textContent).toContain("3");
	});

	test("a filter that matches no job says so", () => {
		const view = renderList([task("nightly", { scheduled: true }), task("idle", {})]);

		fireEvent.click(chip(view, ACTIVE_CHIP));

		expect(view.getByText("No jobs match this filter.")).toBeTruthy();
	});
});
