import { useState } from "react";

export function useDialogForm<T extends Record<string, unknown>>(defaultState: T) {
	const [formState, setFormState] = useState<T>(defaultState);

	const reset = () => {
		setFormState(defaultState);
	};

	const handleOpenChange = (open: boolean, onOpenChange: (open: boolean) => void) => {
		if (!open) reset();

		onOpenChange(open);
	};

	return { formState, setFormState, reset, handleOpenChange } as const;
}
