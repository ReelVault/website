import { cn } from "cn";
import { Loader2Icon } from "lucide-react";
import type { ComponentProps } from "react";

const SPINNER_SIZE = {
	xs: "size-3",
	sm: "size-3.5",
	default: "size-4",
	lg: "size-5",
	xl: "size-8",
} as const;

function Spinner({ className, size = "default", ...props }: ComponentProps<"svg"> & { size?: keyof typeof SPINNER_SIZE }) {
	return (
		<Loader2Icon
			data-slot="spinner"
			role="status"
			aria-label="Loading"
			className={cn("animate-spin", SPINNER_SIZE[size], className)}
			{...props}
		/>
	);
}

export { Spinner };
