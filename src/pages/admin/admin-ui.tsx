import { cn } from "cn";
import { ArrowDownRight, ArrowUpRight, Search } from "lucide-react";
import type { ChangeEvent, ComponentType, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { m } from "@/paraglide/messages";

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
	description?: string;
	count?: number | string;
	badge?: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<header className="flex flex-col gap-4 border-border border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
			<div className="flex min-w-0 flex-col gap-1.5">
				<div className="flex items-center gap-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
					{Icon !== undefined && <Icon className="size-4 text-primary" />}
					<span>{eyebrow}</span>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">{title}</h1>
					{count !== undefined && (
						<Badge variant="secondary" className="font-mono text-xs">
							{count}
						</Badge>
					)}
					{badge}
				</div>
				{description !== undefined && <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">{description}</p>}
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
		<Card className={cn("border-border/80 bg-card/60 shadow-none", className)}>
			{(title !== undefined || description !== undefined || actions !== undefined || badge !== undefined) && (
				<CardHeader className="flex flex-col gap-3 border-border/70 border-b p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2.5">
							{title !== undefined && <CardTitle className="font-semibold text-base text-foreground">{title}</CardTitle>}
							{badge}
						</div>
						{description !== undefined && (
							<CardDescription className="text-muted-foreground text-xs leading-relaxed">{description}</CardDescription>
						)}
					</div>
					{actions !== undefined && <div className="flex flex-row flex-wrap items-center gap-2">{actions}</div>}
				</CardHeader>
			)}
			<CardContent className={cn("p-4 sm:p-6", contentClassName)}>{children}</CardContent>
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
				<Search className="size-4 text-muted-foreground" aria-hidden="true" />
			</InputGroupAddon>
			<InputGroupInput
				name="search"
				autoComplete="off"
				aria-label={resolvedPlaceholder}
				value={value}
				onChange={handleChange}
				placeholder={resolvedPlaceholder}
				className="text-xs"
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
		<Card className={cn("border-border/80 bg-card/60 shadow-none transition-colors hover:border-border", className)}>
			<CardContent className="flex flex-col gap-3 p-4 sm:p-5">
				<div className="flex items-center justify-between gap-2">
					<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{label}</span>
					{Icon !== undefined && (
						<div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border", toneClasses.iconWrapper)}>
							<Icon className="size-4" />
						</div>
					)}
				</div>

				<div className="flex items-baseline justify-between gap-2">
					<div className={cn("font-bold text-2xl tabular-nums tracking-tight sm:text-3xl", toneClasses.value)}>{value}</div>
					{trend && (
						<span className={cn("flex items-center gap-0.5 font-medium text-xs", trend.isPositive ? "text-success" : "text-destructive")}>
							{trend.isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
							{trend.value}
							{trend.label && <span className="text-[10px] text-muted-foreground">{trend.label}</span>}
						</span>
					)}
				</div>

				{description !== undefined && <div className="text-muted-foreground text-xs">{description}</div>}
			</CardContent>
		</Card>
	);
}

/** Legacy alias for backward compatibility across existing callsites */
export function AdminStat({
	label,
	value,
	icon: Icon,
	tone = "default",
}: {
	label: string;
	value: ReactNode;
	icon?: ComponentType<{ className?: string }>;
	tone?: "default" | "success" | "warning" | "destructive";
}) {
	return <AdminStatCard label={label} value={value} icon={Icon} tone={tone} />;
}

export function EditorMessage({ message }: { message: string }) {
	return (
		<div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-destructive text-sm">
			{message}
		</div>
	);
}
