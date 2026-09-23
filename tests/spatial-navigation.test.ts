import { describe, expect, it } from "bun:test";
import { calculateSpatialScore, findInitialCandidate, isFormElement } from "../src/lib/spatial-navigation";

function makeRect(x: number, y: number, width: number, height: number): DOMRect {
	return {
		x,
		y,
		left: x,
		top: y,
		right: x + width,
		bottom: y + height,
		width,
		height,
		toJSON: () => ({}),
	};
}

describe("spatial navigation scoring", () => {
	it("prefers adjacent element in the same horizontal row when moving right", () => {
		const current = makeRect(100, 200, 150, 220);
		// Card directly to the right in the same row
		const nextInRow = makeRect(270, 200, 150, 220);
		// Card diagonally far down-right
		const farBelowRight = makeRect(200, 700, 150, 220);

		const scoreNext = calculateSpatialScore(current, nextInRow, "right");
		const scoreFar = calculateSpatialScore(current, farBelowRight, "right");

		expect(scoreNext).toBeLessThan(scoreFar);
		expect(scoreNext).toBe(20); // 270 - 250 = 20, cross = 0 because overlap > 0
	});

	it("discards elements outside directional beam (visual cone)", () => {
		const current = makeRect(100, 200, 150, 220);
		// Element barely 10px to the right, but 600px downwards (ratio > 2.5)
		const extremeDiagonal = makeRect(260, 850, 150, 220);

		const score = calculateSpatialScore(current, extremeDiagonal, "right");
		expect(score).toBe(Number.POSITIVE_INFINITY);
	});

	it("discards elements in reverse direction", () => {
		const current = makeRect(300, 200, 150, 220);
		// Element to the left
		const leftElement = makeRect(100, 200, 150, 220);

		expect(calculateSpatialScore(current, leftElement, "right")).toBe(Number.POSITIVE_INFINITY);
		expect(calculateSpatialScore(leftElement, current, "left")).toBe(Number.POSITIVE_INFINITY);
	});

	it("calculates vertical distance when moving down", () => {
		const current = makeRect(100, 100, 150, 100);
		// Element in row below, aligned in column
		const below = makeRect(100, 220, 150, 100);

		const score = calculateSpatialScore(current, below, "down");
		expect(score).toBe(20); // 220 - 200 = 20, cross = 0 because overlap > 0
	});

	it("calculates vertical distance when moving up", () => {
		const current = makeRect(100, 300, 150, 100);
		const above = makeRect(100, 150, 150, 100);

		const score = calculateSpatialScore(current, above, "up");
		expect(score).toBe(50); // 300 - 250 = 50, cross = 0
	});
});

describe("isFormElement", () => {
	// Minimal DOM stand-in: isFormElement reads the effective input type via the
	// type *attribute* (getAttribute), which is how the DOM reflects it.
	const makeElement = (tagName: string, attributes: Record<string, string> = {}): HTMLElement =>
		({
			tagName,
			isContentEditable: false,
			getAttribute: (name: string) => attributes[name] ?? null,
		}) as unknown as HTMLElement;

	it("identifies native form inputs that need native arrow navigation", () => {
		const textInput = makeElement("INPUT", { type: "text" });
		const searchInput = makeElement("INPUT", { type: "search" });
		const implicitTextInput = makeElement("INPUT"); // absent type attribute behaves like "text"
		const textarea = makeElement("TEXTAREA");
		const select = makeElement("SELECT");

		expect(isFormElement(textInput)).toBe(true);
		expect(isFormElement(searchInput)).toBe(true);
		expect(isFormElement(implicitTextInput)).toBe(true);
		expect(isFormElement(textarea)).toBe(true);
		expect(isFormElement(select)).toBe(true);
	});

	it("allows spatial navigation on button and checkbox inputs", () => {
		const btn = makeElement("BUTTON");
		const submitInput = makeElement("INPUT", { type: "submit" });
		const checkbox = makeElement("INPUT", { type: "checkbox" });

		expect(isFormElement(btn)).toBe(false);
		expect(isFormElement(submitInput)).toBe(false);
		expect(isFormElement(checkbox)).toBe(false);
	});
});

describe("findInitialCandidate", () => {
	it("picks candidate in viewport instead of offscreen top candidate", () => {
		// Mock window dimensions
		globalThis.window = {
			innerHeight: 800,
			innerWidth: 1200,
		} as unknown as Window & typeof globalThis;

		const topOffscreenStub = {
			getBoundingClientRect: () => makeRect(50, -500, 100, 40),
		};
		const topOffscreen = topOffscreenStub as HTMLElement;

		const inViewportCardStub = {
			getBoundingClientRect: () => makeRect(200, 300, 200, 300),
		};
		const inViewportCard = inViewportCardStub as HTMLElement;

		const candidates = [topOffscreen, inViewportCard];
		const chosen = findInitialCandidate(candidates, "down");

		expect(chosen).toBe(inViewportCard);
	});
});
