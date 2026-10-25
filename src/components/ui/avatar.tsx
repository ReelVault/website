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
				"group/avatar after:border-border relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:mix-blend-darken data-[shape=square]:rounded-3xl data-[shape=square]:after:rounded-3xl data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
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
				"bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-sm group-data-[shape=square]/avatar:rounded-3xl group-data-[size=sm]/avatar:text-xs",
				className,
			)}
			{...props}
		/>
	);
}

export { Avatar, AvatarFallback, AvatarImage };
