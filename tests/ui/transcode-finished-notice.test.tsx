import { afterAll, afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { TranscodeProgressResponse } from "@reelvault/sdk";
import { overwriteGetLocale } from "@/paraglide/runtime";
import { toast } from "@/utils/toast-facade";
import { ensureDom, unregisterDom } from "./register-dom";

/**
 * The player says once when a transcode that was running in it has finished. The notice follows the
 * poll's own stop: a completed encode and a coverage of 99% both end the poll.
 */

// React reads the browser's event support when it loads, so the DOM is installed before Testing Library and the page.
ensureDom();

const { cleanup, render } = await import("@testing-library/react");
const { useTranscodeFinishedNotice } = await import("@/client/hooks/use-player-playback");

overwriteGetLocale(() => "en");

function progress(overrides: Partial<TranscodeProgressResponse> = {}): TranscodeProgressResponse {
	return {
		sessionId: "session-1",
		mediaFileId: "file-1",
		state: "transcoding",
		active: true,
		segmentDuration: 4,
		segments: 10,
		transcodedSeconds: 40,
		transcodedUntil: 40,
		duration: 600,
		remainingSeconds: 560,
		progressPercent: 6.7,
		ranges: [{ startTime: 0, endTime: 40, startSegment: 0, endSegment: 9, segmentCount: 10 }],
		...overrides,
	};
}

const finished = progress({ state: "completed", progressPercent: 100, transcodedUntil: 600, remainingSeconds: 0 });

function Probe({ data }: { data: TranscodeProgressResponse | undefined }) {
	useTranscodeFinishedNotice(data);

	return null;
}

function watchNotices() {
	return spyOn(toast, "success").mockImplementation(() => undefined);
}

afterEach(() => {
	cleanup();
	mock.restore();
});

describe("transcode finished notice", () => {
	test("a transcode that finishes while the player is open says so once", () => {
		const notices = watchNotices();
		const view = render(<Probe data={progress()} />);

		view.rerender(<Probe data={finished} />);
		view.rerender(<Probe data={{ ...finished }} />);

		expect(notices).toHaveBeenCalledTimes(1);
		expect(notices).toHaveBeenCalledWith("Preparation finished successfully");
	});

	test("a title that was already finished when the player opened stays silent", () => {
		const notices = watchNotices();
		const view = render(<Probe data={finished} />);

		view.rerender(<Probe data={{ ...finished }} />);

		expect(notices).not.toHaveBeenCalled();
	});

	test("the poll's 99% stop counts as finished", () => {
		const notices = watchNotices();
		const view = render(<Probe data={progress({ progressPercent: 50 })} />);

		view.rerender(<Probe data={progress({ progressPercent: 99.2, transcodedUntil: 595 })} />);

		expect(notices).toHaveBeenCalledTimes(1);
	});

	test("a seek that restarts the encode announces the finished window as well", () => {
		const notices = watchNotices();
		const view = render(<Probe data={progress({ progressPercent: 50 })} />);

		view.rerender(<Probe data={finished} />);
		// A server seek clears the cached progress to pending; the restarted encode then runs and finishes.
		view.rerender(<Probe data={progress({ state: "pending", active: false, progressPercent: 0, transcodedUntil: 0, ranges: [] })} />);
		view.rerender(<Probe data={progress({ progressPercent: 30 })} />);
		view.rerender(<Probe data={finished} />);

		expect(notices).toHaveBeenCalledTimes(2);
	});

	test("nothing is said while the encode is still running", () => {
		const notices = watchNotices();
		const view = render(<Probe data={undefined} />);

		view.rerender(<Probe data={progress({ state: "pending", active: false, ranges: [] })} />);
		view.rerender(<Probe data={progress({ progressPercent: 40 })} />);

		expect(notices).not.toHaveBeenCalled();
	});
});

afterAll(() => {
	unregisterDom();
});
