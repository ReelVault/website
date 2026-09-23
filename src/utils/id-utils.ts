/**
 * UUID v4 generator that also works in **non-secure contexts**.
 *
 * `crypto.randomUUID` is only exposed in secure contexts; the server is
 * explicitly supported over plain-HTTP LAN addresses (`http://<ip>:3030`),
 * where it is `undefined`. `crypto.getRandomValues` remains available there,
 * so fall back to building the v4 UUID by hand.
 */
interface CryptoLike {
	randomUUID?: (() => string) | undefined;
	getRandomValues: <T extends ArrayBufferView | null>(array: T) => T;
}

export function safeUuid(): string {
	const cryptoRef: CryptoLike = globalThis.crypto;
	if (typeof cryptoRef.randomUUID === "function") return cryptoRef.randomUUID();

	const bytes = cryptoRef.getRandomValues(new Uint8Array(16));
	bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40; // version 4
	bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80; // variant 10
	const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
