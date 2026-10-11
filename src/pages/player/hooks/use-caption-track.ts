import { type RefObject, useEffect } from "react";
import { buildSubtitleVtt } from "../utils/subtitle-track.utils";

/**
 * Loads the active subtitles into a caption `<track>` as a WebVTT blob, so the video
 * element has captions for assistive tech. The track stays hidden: the overlay draws
 * the picture, so the same text is never shown twice. A blob URL is the form the
 * app's `media-src` policy allows; data URLs are blocked.
 */
export function useCaptionTrack(trackRef: RefObject<HTMLTrackElement | null>, content: string | undefined) {
	useEffect(() => {
		const track = trackRef.current;
		const vtt = buildSubtitleVtt(content);
		const url = vtt === undefined ? undefined : URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
		if (track && url) {
			track.src = url;
			track.track.mode = "hidden";
		}

		return () => {
			track?.removeAttribute("src");
			if (url) URL.revokeObjectURL(url);
		};
	}, [trackRef, content]);
}
