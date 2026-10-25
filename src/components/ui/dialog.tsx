import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { usePortalContainer } from "@/components/portal-container";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ container, ...props }: DialogPrimitive.Portal.Props) {
	const portalContainer = usePortalContainer(container);

	return <DialogPrimitive.Portal data-slot="dialog-portal" container={portalContainer} {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
	return (
		<DialogPrimitive.Backdrop
			data-slot="dialog-overlay"
			className={cn(
				"data-open:fade-in-0 data-closed:fade-out-0 data-closed:animate-out data-open:animate-in fixed inset-0 isolate z-50 bg-black/70 duration-100",
				className,
			)}
			{...props}
		/>
	);
}

const DIALOG_SIZE_CLASS = {
	sm: "sm:max-w-sm",
	md: "sm:max-w-md",
	lg: "sm:max-w-lg",
	xl: "sm:max-w-xl",
	"2xl": "sm:max-w-2xl",
	"3xl": "sm:max-w-3xl",
	"4xl": "sm:max-w-4xl",
} as const;

function DialogContent({
	className,
	children,
	showCloseButton = true,
	container,
	size = "sm",
	...props
}: DialogPrimitive.Popup.Props & {
	showCloseButton?: boolean;
	container?: DialogPrimitive.Portal.Props["container"];
	size?: keyof typeof DIALOG_SIZE_CLASS;
}) {
	return (
		<DialogPortal container={container}>
			<DialogOverlay />
			<DialogPrimitive.Popup
				data-slot="dialog-content"
				className={cn(
					"data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 bg-popover text-popover-foreground ring-foreground/10 data-closed:animate-out data-open:animate-in fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl p-4 text-sm ring-1 duration-100 outline-none max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:max-h-[90svh] max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:overflow-y-auto max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:pb-[calc(1rem+env(safe-area-inset-bottom))]",
					DIALOG_SIZE_CLASS[size],
					className,
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogPrimitive.Close
						data-slot="dialog-close"
						render={<Button variant="ghost" className="absolute top-2 right-2" size="icon-sm" />}
					>
						<XIcon />
						<span className="sr-only">{m.common_close()}</span>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Popup>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="dialog-header" className={cn("flex flex-col gap-2", className)} {...props} />;
}

function DialogFooter({
	className,
	showCloseButton = false,
	children,
	...props
}: ComponentProps<"div"> & {
	showCloseButton?: boolean;
}) {
	return (
		<div data-slot="dialog-footer" className={cn("flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end", className)} {...props}>
			{children}
			{showCloseButton && <DialogPrimitive.Close render={<Button variant="outline" />}>{m.common_close()}</DialogPrimitive.Close>}
		</div>
	);
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			className={cn("flex items-center gap-2 text-lg leading-none font-semibold tracking-tight", className)}
			{...props}
		/>
	);
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn("text-muted-foreground *:[a]:hover:text-foreground text-sm *:[a]:underline *:[a]:underline-offset-3", className)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
