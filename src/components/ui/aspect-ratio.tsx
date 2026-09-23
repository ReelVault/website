import { cn } from "cn";
import type { ComponentProps, CSSProperties } from "react";

interface RatioStyle extends CSSProperties {
	"--ratio"?: string | number;
}

function AspectRatio({ ratio, className, ...props }: ComponentProps<"div"> & { ratio: number }) {
	const style: RatioStyle = { "--ratio": ratio };

	return <div data-slot="aspect-ratio" style={style} className={cn("relative aspect-(--ratio)", className)} {...props} />;
}

export { AspectRatio };
