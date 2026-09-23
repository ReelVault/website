import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { m } from "@/paraglide/messages";

export function AsyncButton({
	isPending = false,
	pendingLabel = m.common_processing(),
	disabled,
	children,
	...props
}: ComponentProps<typeof Button> & {
	isPending?: boolean;
	pendingLabel?: ReactNode;
}) {
	return (
		<Button {...props} disabled={Boolean(disabled) || isPending}>
			{isPending ? (
				<>
					<Spinner data-icon="inline-start" aria-hidden="true" />
					{pendingLabel}
				</>
			) : (
				children
			)}
		</Button>
	);
}
