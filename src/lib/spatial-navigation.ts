/**
 * Spatial navigation (D-pad / arrow keys) tuned for TV and keyboard.
 *
 * Oparta o zasady algorytmu W3C CSS Spatial Navigation Level 1:
 * - Edge-to-edge projection instead of center-to-center
 * - Orthogonal overlap band without cross-axis penalties
 * - Directional cone that avoids diagonal jumps
 * - Scoping to the active modal/dialog (focus trap that cannot escape to the background)
 * - Flattening of nested composite cards ([data-spatial])
 * - Smart starting point within the visible viewport (no more jumping to items[0])
 * - Smooth scroll that keeps the target visible under the fixed top navbar
 */

export type SpatialDirection = "up" | "down" | "left" | "right";

const INTERACTIVE_SELECTOR =
	"a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1']), [data-spatial]";

const DIRECTION_KEYS: Record<string, SpatialDirection> = {
	ArrowUp: "up",
	ArrowDown: "down",
	ArrowLeft: "left",
	ArrowRight: "right",
	Up: "up",
	Down: "down",
	Left: "left",
	Right: "right",
};

/**
 * Whether an element is a form field where arrow keys
 * should act natively (text editing, slider value changes, etc.).
 */
export function isFormElement(element: HTMLElement): boolean {
	const tag = element.tagName;
	if (tag === "TEXTAREA" || tag === "SELECT" || element.isContentEditable) return true;

	if (tag === "INPUT") {
		// Reflects the input's effective type; absent attribute behaves like "text".
		const type = element.getAttribute("type")?.toLowerCase() ?? "";

		return type !== "button" && type !== "submit" && type !== "reset" && type !== "checkbox";
	}

	return false;
}

/**
 * Verifies that an element is actually visible and clickable in the DOM.
 * Supports position: fixed elements (AppNavbar) and excludes inert and aria-hidden containers.
 */
export function isElementVisible(element: HTMLElement): boolean {
	if (typeof element.checkVisibility === "function") {
		if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) {
			return false;
		}
	} else if (typeof window !== "undefined") {
		const style = window.getComputedStyle(element);
		if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
			return false;
		}
	}

	if (element.closest("[inert]") || element.closest("[aria-hidden='true']")) {
		return false;
	}

	const rect = element.getBoundingClientRect();

	return rect.width > 0 && rect.height > 0;
}

/**
 * Returns the active candidate search scope.
 * When a modal/dialog/sheet is open, candidates are limited to it.
 */
export function getActiveScope(): HTMLElement | Document {
	const openModals = document.querySelectorAll<HTMLElement>("[role='dialog'], dialog[open], [aria-modal='true']");
	for (let i = openModals.length - 1; i >= 0; i--) {
		const modal = openModals[i];
		if (modal && isElementVisible(modal)) {
			return modal;
		}
	}

	return document;
}

/**
 * Collects navigation candidates.
 * Flattens nested elements inside [data-spatial] cards or other interactive containers.
 */
export function collectCandidates(scope: HTMLElement | Document = getActiveScope()): HTMLElement[] {
	const raw = scope.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR);
	const valid: HTMLElement[] = [];

	for (let i = 0; i < raw.length; i++) {
		const el = raw[i];
		if (!(el && isElementVisible(el)) || el.hasAttribute("disabled")) continue;

		valid.push(el);
	}

	const validSet = new Set(valid);
	const results: HTMLElement[] = [];

	for (const el of valid) {
		let isNested = false;
		let parent = el.parentElement;
		while (parent && parent !== scope) {
			if (parent.hasAttribute("data-spatial") || validSet.has(parent)) {
				isNested = true;
				break;
			}

			parent = parent.parentElement;
		}

		if (!isNested) {
			results.push(el);
		}
	}

	return results;
}

/**
 * Finds the best starting element when nothing has focus.
 * Prefers elements in the current viewport (instead of jumping to the top of the page).
 */
export function findInitialCandidate(candidates: HTMLElement[], direction?: SpatialDirection): HTMLElement | null {
	if (candidates.length === 0) return null;

	const vh = typeof window !== "undefined" ? window.innerHeight : 1080;
	const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
	const inViewport = candidates.filter((el) => {
		const r = el.getBoundingClientRect();

		return r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
	});

	const pool = inViewport.length > 0 ? inViewport : candidates;
	const viewportCenter = { x: vw / 2, y: vh / 2 };

	let best: HTMLElement | null = null;
	let bestScore = Number.POSITIVE_INFINITY;

	for (const candidate of pool) {
		const r = candidate.getBoundingClientRect();
		const center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };

		let score: number;
		if (direction === "down") {
			score = center.y * 2 + center.x;
		} else if (direction === "up") {
			score = (vh - center.y) * 2 + center.x;
		} else if (direction === "right") {
			score = center.x * 2 + center.y;
		} else if (direction === "left") {
			score = (vw - center.x) * 2 + center.y;
		} else {
			const dx = center.x - viewportCenter.x;
			const dy = center.y - viewportCenter.y;
			score = dx * dx + dy * dy;
		}

		if (score < bestScore) {
			bestScore = score;
			best = candidate;
		}
	}

	return best ?? pool[0] ?? null;
}

function computeHorizontalScore(currentRect: DOMRect, targetRect: DOMRect, direction: "left" | "right"): number {
	const isRight = direction === "right";
	const alignmentTolerance = 3;

	if (isRight) {
		if (targetRect.right <= currentRect.right + alignmentTolerance) return Number.POSITIVE_INFINITY;
	} else if (targetRect.left >= currentRect.left - alignmentTolerance) {
		return Number.POSITIVE_INFINITY;
	}

	let primary: number;
	if (isRight) {
		primary =
			targetRect.left >= currentRect.right - alignmentTolerance ? targetRect.left - currentRect.right : targetRect.left - currentRect.left;
	} else {
		primary =
			currentRect.left >= targetRect.right - alignmentTolerance
				? currentRect.left - targetRect.right
				: currentRect.right - targetRect.right;
	}

	const overlap = Math.min(currentRect.bottom, targetRect.bottom) - Math.max(currentRect.top, targetRect.top);
	if (overlap > 0) {
		return Math.max(0, primary);
	}

	const cross = targetRect.top > currentRect.bottom ? targetRect.top - currentRect.bottom : currentRect.top - targetRect.bottom;

	if (cross / (primary + 1) > 2.5) return Number.POSITIVE_INFINITY;

	return Math.max(0, primary) + cross * 4;
}

function computeVerticalScore(currentRect: DOMRect, targetRect: DOMRect, direction: "up" | "down"): number {
	const isDown = direction === "down";
	const alignmentTolerance = 3;

	if (isDown) {
		if (targetRect.bottom <= currentRect.bottom + alignmentTolerance) return Number.POSITIVE_INFINITY;
	} else if (targetRect.top >= currentRect.top - alignmentTolerance) {
		return Number.POSITIVE_INFINITY;
	}

	let primary: number;
	if (isDown) {
		primary =
			targetRect.top >= currentRect.bottom - alignmentTolerance ? targetRect.top - currentRect.bottom : targetRect.top - currentRect.top;
	} else {
		primary =
			currentRect.top >= targetRect.bottom - alignmentTolerance
				? currentRect.top - targetRect.bottom
				: currentRect.bottom - targetRect.bottom;
	}

	const overlap = Math.min(currentRect.right, targetRect.right) - Math.max(currentRect.left, targetRect.left);
	if (overlap > 0) {
		return Math.max(0, primary);
	}

	const cross = targetRect.left > currentRect.right ? targetRect.left - currentRect.right : currentRect.left - targetRect.right;

	if (cross / (primary + 1) > 2.5) return Number.POSITIVE_INFINITY;

	return Math.max(0, primary) + cross * 4;
}

/**
 * Computes the W3C directional-distance metric between the current and candidate element.
 * Returns Number.POSITIVE_INFINITY when the candidate is not in the direction of travel.
 */
export function calculateSpatialScore(currentRect: DOMRect, targetRect: DOMRect, direction: SpatialDirection): number {
	const baseScore =
		direction === "left" || direction === "right"
			? computeHorizontalScore(currentRect, targetRect, direction)
			: computeVerticalScore(currentRect, targetRect, direction);

	if (!Number.isFinite(baseScore)) return Number.POSITIVE_INFINITY;

	// Penalize elements far outside the viewport (more than 1.5 screen heights away)
	const vh = typeof window !== "undefined" ? window.innerHeight : 0;
	const viewportPenalty = vh > 0 && (targetRect.top > vh * 1.5 || targetRect.bottom < -vh * 0.5) ? 2000 : 0;

	return baseScore + viewportPenalty;
}

/**
 * Smoothly scrolls the view so the focused element is not hidden
 * behind the fixed navbar at the top of the page.
 */
export function scrollIntoViewWithClearance(element: HTMLElement): void {
	element.scrollIntoView({ block: "nearest", inline: "nearest" });

	requestAnimationFrame(() => {
		const rect = element.getBoundingClientRect();
		const nav = document.querySelector<HTMLElement>("nav.fixed, nav.sticky, header.fixed, header.sticky");
		const navHeight = nav ? nav.getBoundingClientRect().bottom : 56;
		const clearance = 16;

		if (rect.top < navHeight + clearance && rect.top >= 0) {
			const delta = navHeight + clearance - rect.top;
			window.scrollBy({ top: -delta, behavior: "smooth" });
		}
	});
}

/**
 * Main function: move focus in the given direction.
 */
export function moveFocus(direction: SpatialDirection): boolean {
	const candidates = collectCandidates();
	if (candidates.length === 0) return false;

	const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
	const current = active && candidates.includes(active) ? active : (active?.closest<HTMLElement>("[data-spatial]") ?? null);

	if (!(current && candidates.includes(current))) {
		const initial = findInitialCandidate(candidates, direction);
		if (!initial) return false;

		initial.focus();
		scrollIntoViewWithClearance(initial);

		return true;
	}

	const currentRect = current.getBoundingClientRect();
	let best: HTMLElement | null = null;
	let bestScore = Number.POSITIVE_INFINITY;

	for (const candidate of candidates) {
		if (candidate === current) continue;

		const targetRect = candidate.getBoundingClientRect();
		const score = calculateSpatialScore(currentRect, targetRect, direction);

		if (score < bestScore) {
			bestScore = score;
			best = candidate;
		}
	}

	if (!best) return false;

	best.focus();
	scrollIntoViewWithClearance(best);

	return true;
}

export function initSpatialNavigation(): () => void {
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;

		const direction = DIRECTION_KEYS[event.key];
		if (!direction) return;

		const target = event.target;
		if (target instanceof HTMLElement && isFormElement(target)) return;

		if (moveFocus(direction)) {
			event.preventDefault();
		}
	};

	window.addEventListener("keydown", onKeyDown);

	return () => window.removeEventListener("keydown", onKeyDown);
}
