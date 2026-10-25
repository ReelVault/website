import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import type { ChangeEvent, ComponentType, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { m } from "@/paraglide/messages";

/** Detail-page admin routes a back link can return to. */
const ADMIN_BACK_LINK_ROUTES = ["/admin/users", "/admin/collections", "/admin/media", "/admin/metadata"] as const;

/** Shared back-navigation affordance for admin detail pages, rendered above the page header. */
export function AdminBackLink({ to, label }: { to: (typeof ADMIN_BACK_LINK_ROUTES)[number]; label: string }) {
	return (
		<Button tone="muted" variant="ghost" size="sm" className="w-fit" nativeButton={false} render={<Link to={to} />}>
			<ArrowLeft className="size-3.5" />
			<span>{label}</span>
		</Button>
	);
}

export function AdminPageHeader({
	icon: Icon,
	eyebrow,
	title,
	description,
	count,
	badge,
	actions,
}: {
	icon?: ComponentType<{ className?: string }>;
	eyebrow: string;
	title: string;
	description?: ReactNode;
	count?: number | string;
	badge?: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<header className="border-border flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
			<div className="flex min-w-0 flex-col gap-1.5">
				<div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
					{Icon !== undefined && <Icon className="text-primary size-4" />}
					<span>{eyebrow}</span>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
					{count !== undefined && (
						<Badge variant="secondary" font="mono">
							{count}
						</Badge>
					)}
					{badge}
				</div>
				{description !== undefined && <div className="text-muted-foreground max-w-3xl text-sm leading-relaxed">{description}</div>}
			</div>
			{actions !== undefined && <div className="flex flex-row flex-wrap items-center gap-2 pt-2 lg:pt-0">{actions}</div>}
		</header>
	);
}

export function AdminSection({
	title,
	description,
	badge,
	actions,
	children,
	className,
	contentClassName,
}: {
	title?: string;
	description?: string;
	badge?: ReactNode;
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
	contentClassName?: string;
}) {
	return (
		<Card variant="subtle" className={className}>
			{(title !== undefined || description !== undefined || actions !== undefined || badge !== undefined) && (
				<CardHeader size="section" className="flex flex-col gap-3 border-b sm:flex-row sm:items-start sm:justify-between">
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2.5">
							{title !== undefined && <CardTitle>{title}</CardTitle>}
							{badge}
						</div>
						{description !== undefined && (
							<CardDescription size="xs" leading="relaxed">
								{description}
							</CardDescription>
						)}
					</div>
					{actions !== undefined && <div className="flex flex-row flex-wrap items-center gap-2">{actions}</div>}
				</CardHeader>
			)}
			<CardContent size="spacious" className={contentClassName}>
				{children}
			</CardContent>
		</Card>
	);
}

export function AdminSearch({
	value,
	onChange,
	placeholder,
	className,
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}) {
	const resolvedPlaceholder = placeholder ?? `${m.common_search()}…`;
	const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);

	return (
		<InputGroup className={cn("w-full sm:max-w-xs", className)}>
			<InputGroupAddon>
				<Search className="text-muted-foreground size-4" aria-hidden="true" />
			</InputGroupAddon>
			<InputGroupInput
				name="search"
				autoComplete="off"
				aria-label={resolvedPlaceholder}
				value={value}
				onChange={handleChange}
				placeholder={resolvedPlaceholder}
			/>
		</InputGroup>
	);
}

export function AdminStatCard({
	label,
	value,
	icon: Icon,
	description,
	trend,
	tone = "default",
	className,
}: {
	label: string;
	value: ReactNode;
	icon?: ComponentType<{ className?: string }>;
	description?: ReactNode;
	trend?: { value: string | number; isPositive?: boolean; label?: string };
	tone?: "default" | "success" | "warning" | "destructive" | "muted";
	className?: string;
}) {
	const toneClasses = {
		default: {
			iconWrapper: "bg-primary/10 text-primary border-primary/20",
			value: "text-foreground",
		},
		success: {
			iconWrapper: "bg-success/10 text-success border-success/20",
			value: "text-foreground",
		},
		warning: {
			iconWrapper: "bg-warning/10 text-warning border-warning/20",
			value: "text-foreground",
		},
		destructive: {
			iconWrapper: "bg-destructive/10 text-destructive border-destructive/20",
			value: "text-foreground",
		},
		muted: {
			iconWrapper: "bg-muted text-muted-foreground border-border/60",
			value: "text-muted-foreground",
		},
	}[tone];

	return (
		<Card variant="subtle" className={className}>
			<CardContent size="comfortable" className="flex flex-col gap-3">
				<div className="flex items-center justify-between gap-2">
					<span className="text-muted-foreground text-xs font-semibold">{label}</span>
					{Icon !== undefined && (
						<div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border", toneClasses.iconWrapper)}>
							<Icon className="size-4" />
						</div>
					)}
				</div>

				<div className="flex items-baseline justify-between gap-2">
					<div className={cn("text-2xl font-bold tracking-tight tabular-nums sm:text-3xl", toneClasses.value)}>{value}</div>
					{trend && (
						<span className={cn("flex items-center gap-0.5 text-xs font-medium", trend.isPositive ? "text-success" : "text-destructive")}>
							{trend.isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
							{trend.value}
							{trend.label && <span className="text-muted-foreground text-xs">{trend.label}</span>}
						</span>
					)}
				</div>

				{description !== undefined && <div className="text-muted-foreground text-xs">{description}</div>}
			</CardContent>
		</Card>
	);
}

export function EditorMessage({ message }: { message: string }) {
	return (
		<div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-3 rounded-xl border p-5 text-sm">
			{message}
		</div>
	);
}
