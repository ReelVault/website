import { cn } from "cn";
import type { HTMLAttributes, ReactNode } from "react";

export function UserPageHeader({
	eyebrow,
	title,
	description,
	action,
}: {
	eyebrow: string;
	title: string;
	description?: string;
	action?: ReactNode;
}) {
	return (
		<header className="flex flex-col gap-6 border-border/60 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
			<div className="min-w-0">
				<p className="cinema-kicker">{eyebrow}</p>
				<h1 className="mt-3 font-black text-4xl tracking-[-0.055em] sm:text-5xl">{title}</h1>
				{description && <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">{description}</p>}
			</div>
			{action && <div className="shrink-0">{action}</div>}
		</header>
	);
}

export function UserSurface({ children, className, ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
	return (
		<section className={cn("cinema-surface p-5 sm:p-7", className)} {...props}>
			{children}
		</section>
	);
}

export function UserSectionTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
	return (
		<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div className="cinema-section-heading">
				<h2>{title}</h2>
				{description && <p>{description}</p>}
			</div>
			{action}
		</div>
	);
}
