import { Check, Copy } from "lucide-react";

export function CopyIcon({ copied, className = "size-3.5" }: { copied: boolean; className?: string }) {
	return copied ? <Check className={`${className} text-success`} /> : <Copy className={className} />;
}
