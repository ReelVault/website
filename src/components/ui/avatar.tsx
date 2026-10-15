import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { cn } from "cn";

function Avatar({
	className,
	size = "default",
	shape = "circle",
	...props
}: AvatarPrimitive.Root.Props & {
	size?: "default" | "sm" | "lg";
	shape?: "circle" | "square";
}) {
	return (
		<AvatarPrimitive.Root
			data-slot="avatar"
			data-size={size}
			data-shape={shape}
			className={cn(
				"group/avatar relative flex size-8 shrink-0 select-none rounded-full after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 data-[shape=square]:rounded-3xl data-[shape=square]:after:rounded-3xl dark:after:mix-blend-lighten",
				className,
			)}
			{...props}
		/>
	);
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
	return (
		<AvatarPrimitive.Image
			data-slot="avatar-image"
			className={cn("aspect-square size-full rounded-full object-cover group-data-[shape=square]/avatar:rounded-3xl", className)}
			{...props}
		/>
	);
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
	return (
		<AvatarPrimitive.Fallback
			data-slot="avatar-fallback"
			className={cn(
				"flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground text-sm group-data-[shape=square]/avatar:rounded-3xl group-data-[size=sm]/avatar:text-xs",
				className,
			)}
			{...props}
		/>
	);
}

export { Avatar, AvatarFallback, AvatarImage };
