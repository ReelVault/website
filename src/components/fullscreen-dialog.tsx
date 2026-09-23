import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { usePortalContainer } from "@/components/portal-container";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

function FullscreenDialog({ ...props }: DialogPrimitive.Root.Props) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function FullscreenDialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function FullscreenDialogPortal({ container, ...props }: DialogPrimitive.Portal.Props) {
	const portalContainer = usePortalContainer(container);

	return <DialogPrimitive.Portal data-slot="dialog-portal" container={portalContainer} {...props} />;
}

function FullscreenDialogClose({ ...props }: DialogPrimitive.Close.Props) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function FullscreenDialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
	return (
		<DialogPrimitive.Backdrop
			data-slot="dialog-overlay"
			className={cn(
				"data-open:fade-in-0 data-closed:fade-out-0 fixed inset-0 isolate z-50 bg-black/70 duration-100 data-closed:animate-out data-open:animate-in",
				className,
			)}
			{...props}
		/>
	);
}

function FullscreenDialogContent({
	className,
	children,
	showCloseButton = true,
	container,
	...props
}: DialogPrimitive.Popup.Props & {
	showCloseButton?: boolean;
	container?: DialogPrimitive.Portal.Props["container"];
}) {
	return (
		<FullscreenDialogPortal container={container}>
			<FullscreenDialogOverlay />
			<DialogPrimitive.Popup
				data-slot="dialog-content"
				className={cn(
					"data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-popover-foreground text-sm outline-none ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in",
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
		</FullscreenDialogPortal>
	);
}

function FullscreenDialogHeader({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="dialog-header" className={cn("flex flex-col gap-2", className)} {...props} />;
}

function FullscreenDialogFooter({
	className,
	showCloseButton = false,
	children,
	...props
}: ComponentProps<"div"> & {
	showCloseButton?: boolean;
}) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn("-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end", className)}
			{...props}
		>
			{children}
			{showCloseButton && <DialogPrimitive.Close render={<Button variant="outline" />}>{m.common_close()}</DialogPrimitive.Close>}
		</div>
	);
}

function FullscreenDialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			className={cn("font-heading font-medium text-base leading-none", className)}
			{...props}
		/>
	);
}

function FullscreenDialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn("text-muted-foreground text-sm *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground", className)}
			{...props}
		/>
	);
}

export {
	FullscreenDialog,
	FullscreenDialogClose,
	FullscreenDialogContent,
	FullscreenDialogDescription,
	FullscreenDialogFooter,
	FullscreenDialogHeader,
	FullscreenDialogOverlay,
	FullscreenDialogPortal,
	FullscreenDialogTitle,
	FullscreenDialogTrigger,
};
