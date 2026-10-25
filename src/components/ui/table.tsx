import { cn } from "cn";
import type { ComponentProps } from "react";

function Table({ className, ...props }: ComponentProps<"table">) {
	return (
		<div data-slot="table-container" className="relative w-full overflow-x-auto">
			<table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} {...props} />
		</div>
	);
}

function TableHeader({ className, ...props }: ComponentProps<"thead">) {
	return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />;
}

function TableBody({ className, ...props }: ComponentProps<"tbody">) {
	return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableRow({ className, ...props }: ComponentProps<"tr">) {
	return (
		<tr
			data-slot="table-row"
			className={cn("hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", className)}
			{...props}
		/>
	);
}

function TableHead({ className, ...props }: ComponentProps<"th">) {
	return (
		<th
			data-slot="table-head"
			className={cn(
				"text-muted-foreground h-10 px-2 text-left align-middle text-xs font-medium whitespace-nowrap has-[[role=checkbox]]:pr-0",
				className,
			)}
			{...props}
		/>
	);
}

function TableCell({
	className,
	size = "default",
	tone = "default",
	...props
}: ComponentProps<"td"> & {
	size?: "default" | "sm";
	tone?: "default" | "muted" | "mono";
}) {
	return (
		<td
			data-slot="table-cell"
			className={cn(
				"p-2 align-middle whitespace-nowrap has-[[role=checkbox]]:pr-0",
				size === "sm" ? "text-xs" : "text-sm",
				tone === "muted" && "text-muted-foreground",
				tone === "mono" && "text-muted-foreground font-mono",
				className,
			)}
			{...props}
		/>
	);
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
