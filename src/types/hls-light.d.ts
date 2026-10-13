// hls.js/light ships no declaration entry. It is the same API minus the features the player never
// uses (alternate audio, subtitle tracks, EME, CMCD, interstitials), so the full typings apply.
declare module "hls.js/light" {
	import Hls from "hls.js";

	export default Hls;
}
