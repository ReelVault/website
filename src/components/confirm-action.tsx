import type { ReactElement, ReactNode } from "react";
import { startTransition, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { m } from "@/paraglide/messages";

export function ConfirmAction({
	nativeButton,
	trigger,
	title,
	description,
	confirmLabel = m.common_confirm(),
	onConfirm,
	onError,
	className,
	children,
	open: controlledOpen,
	onOpenChange,
}: {
	nativeButton?: boolean;
	trigger?: ReactElement;
	title: string;
	description: ReactNode;
	confirmLabel?: string;
	onConfirm: () => unknown;
	onError?: (error: unknown) => void;
	className?: string;
	children?: ReactNode;
	/** Controlled open state, for a dialog opened from several places (menu items, buttons). */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	const open = controlledOpen ?? uncontrolledOpen;
	const setOpen = (nextOpen: boolean) => {
		setUncontrolledOpen(nextOpen);
		onOpenChange?.(nextOpen);
	};
	const [isPending, setIsPending] = useState(false);

	const handleConfirm = (): void => {
		// Transition consumes the async confirmation without a floating promise.
		startTransition(async () => {
			setIsPending(true);
			try {
				await onConfirm();
				setOpen(false);
			} catch (error) {
				onError?.(error);
			}

			setIsPending(false);
		});
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (!isPending) setOpen(nextOpen);
	};

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			{(trigger !== undefined || children !== undefined) && (
				<AlertDialogTrigger nativeButton={nativeButton} render={trigger} className={className}>
					{children}
				</AlertDialogTrigger>
			)}
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>{m.common_cancel()}</AlertDialogCancel>
					<AlertDialogAction type="button" variant="destructive" disabled={isPending} onClick={handleConfirm}>
						{isPending && <Spinner data-icon="inline-start" aria-hidden="true" />}
						{isPending && m.common_processing()}
						{!isPending && confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
