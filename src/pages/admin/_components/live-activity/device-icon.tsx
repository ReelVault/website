import { Laptop, Monitor, Smartphone, Tv } from "lucide-react";

export function DeviceIcon({ name }: { name: string }) {
	const lower = name.toLowerCase();
	if (lower.includes("tv")) return <Tv className="size-4.5" />;

	if (lower.includes("mobile") || lower.includes("phone") || lower.includes("ios") || lower.includes("android")) {
		return <Smartphone className="size-4.5" />;
	}

	if (lower.includes("mac") || lower.includes("windows") || lower.includes("linux") || lower.includes("laptop")) {
		return <Laptop className="size-4.5" />;
	}

	return <Monitor className="size-4.5" />;
}
