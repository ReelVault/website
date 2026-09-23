/**
 * TV / set-top-box detection from the user agent. Conservative on purpose —
 * only platforms that consume the standard web build as a TV UI (Tizen, webOS,
 * Android/Google TV, Fire TV and generic HbbTV stacks). Used to enable the
 * spatial (D-pad) navigation mode and the 10-foot styling on `<html data-tv>`.
 */
const TV_UA_PATTERN = /SMART-TV|SMARTTV|Tizen|Web0S|webOS|NetCast|Android TV|GoogleTV|Fire TV|\bAFT[ABMS]|HbbTV|PhilipsTV|Viera|BRAVIA/i;

export function isTvDevice(): boolean {
	if (typeof navigator === "undefined") return false;

	return TV_UA_PATTERN.test(navigator.userAgent);
}
