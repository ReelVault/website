import { Check, Copy } from "lucide-react";

export function CopyIcon({
	copied,
	className = "size-3.5",
	copiedClassName = "text-success",
}: {
	copied: boolean;
	className?: string;
	copiedClassName?: string;
}) {
	return copied ? <Check className={`${className} ${copiedClassName}`} /> : <Copy className={className} />;
}
