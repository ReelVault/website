import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";
import { ChevronRightIcon } from "lucide-react";
import type * as React from "react";

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
	return <nav aria-label="breadcrumb" data-slot="breadcrumb" className={cn(className)} {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
	return (
		<ol
			data-slot="breadcrumb-list"
			className={cn("wrap-break-word flex flex-wrap items-center gap-1.5 text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
	return <li data-slot="breadcrumb-item" className={cn("inline-flex items-center gap-1", className)} {...props} />;
}

function BreadcrumbLink({ className, render, ...props }: useRender.ComponentProps<"a">) {
	return useRender({
		defaultTagName: "a",
		props: mergeProps<"a">(
			{
				className: cn("transition-colors hover:text-foreground", className),
			},
			props,
		),
		render,
		state: {
			slot: "breadcrumb-link",
		},
	});
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"a">) {
	return (
		<a
			data-slot="breadcrumb-page"
			role="link"
			aria-disabled="true"
			aria-current="page"
			className={cn("font-normal text-foreground", className)}
			{...props}
		/>
	);
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
	return (
		<li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>
			{children ?? <ChevronRightIcon />}
		</li>
	);
}

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator };
