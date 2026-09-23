import { cn } from "cn";
import { CircleAlert, RefreshCw } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { getSdkErrorMessage } from "@/client/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { m } from "@/paraglide/messages";

type StateIcon = ComponentType<{ className?: string }>;

export function AppLoadingState({ label = m.components_states_loading(), className }: { label?: string; className?: string }) {
	return (
		<div className={cn("flex min-h-48 flex-col items-center justify-center gap-3 text-center", className)} aria-busy="true">
			<Spinner aria-label={label} />
			<span className="text-muted-foreground text-sm">{label}</span>
		</div>
	);
}

export function AppErrorState({
	title = m.components_states_failed_to_load(),
	description = m.components_states_try_again_later(),
	error,
	onRetry,
	className,
}: {
	title?: string;
	description?: ReactNode;
	error?: Error | null;
	onRetry?: () => void;
	className?: string;
}) {
	return (
		<Alert variant="destructive" className={cn("flex flex-col items-start gap-2 p-3.5", className)} aria-live="assertive">
			<div className="flex w-full items-start gap-2.5">
				<CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
				<div className="min-w-0 flex-1 space-y-0.5">
					<AlertTitle className="font-semibold text-xs">{title}</AlertTitle>
					<AlertDescription className="text-muted-foreground text-xs">{getSdkErrorMessage(error) ?? description}</AlertDescription>
				</div>
			</div>
			{onRetry !== undefined && (
				<Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-1 h-7 text-xs">
					<RefreshCw className="mr-1 size-3" />
					{m.common_try_again()}
				</Button>
			)}
		</Alert>
	);
}

export function AppEmptyState({
	title,
	description,
	action,
	icon: Icon,
	className,
}: {
	title: string;
	description?: ReactNode;
	action?: ReactNode;
	icon?: StateIcon;
	className?: string;
}) {
	return (
		<Empty className={cn("min-h-48 border", className)}>
			<EmptyHeader>
				{Icon !== undefined && (
					<EmptyMedia variant="icon">
						<Icon aria-hidden="true" />
					</EmptyMedia>
				)}
				<EmptyTitle>{title}</EmptyTitle>
				{description !== undefined && <EmptyDescription>{description}</EmptyDescription>}
			</EmptyHeader>
			{action !== undefined && <EmptyContent>{action}</EmptyContent>}
		</Empty>
	);
}
