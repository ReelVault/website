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
	cancelLabel = m.common_cancel(),
	onConfirm,
	onError,
	className,
	children,
}: {
	nativeButton?: boolean;
	trigger?: ReactElement;
	title: string;
	description: ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => unknown;
	onError?: (error: unknown) => void;
	className?: string;
	children?: ReactNode;
}) {
	const [open, setOpen] = useState(false);
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
			<AlertDialogTrigger nativeButton={nativeButton} render={trigger} className={className}>
				{children}
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
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
