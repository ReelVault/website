import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type { ComponentProps } from "react";
import { Label } from "@/components/ui/label";

function FieldGroup({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="field-group"
			className={cn(
				"group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
				className,
			)}
			{...props}
		/>
	);
}

const fieldVariants = cva("group/field flex w-full gap-2 data-[invalid=true]:text-destructive", {
	variants: {
		orientation: {
			vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
			horizontal:
				"flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
			responsive:
				"@md/field-group:flex-row flex-col @md/field-group:items-center *:w-full @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
		},
	},
	defaultVariants: {
		orientation: "vertical",
	},
});

function Field({ className, orientation = "vertical", ...props }: ComponentProps<"fieldset"> & VariantProps<typeof fieldVariants>) {
	return <fieldset data-slot="field" data-orientation={orientation} className={cn(fieldVariants({ orientation }), className)} {...props} />;
}

function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
	return (
		<Label
			data-slot="field-label"
			className={cn(
				"group/field-label peer/field-label flex w-fit gap-2 leading-snug has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border has-data-checked:border-primary/30 has-data-checked:bg-primary/5 *:data-[slot=field]:p-2.5 group-data-[disabled=true]/field:opacity-50 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
				"has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
				className,
			)}
			{...props}
		/>
	);
}

function FieldDescription({ className, ...props }: ComponentProps<"p">) {
	return (
		<p
			data-slot="field-description"
			className={cn(
				"text-left font-normal text-muted-foreground text-sm leading-normal group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
				"nth-last-2:-mt-1 last:mt-0",
				"[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
				className,
			)}
			{...props}
		/>
	);
}

function FieldError({
	className,
	children,
	errors,
	...props
}: ComponentProps<"div"> & {
	errors?: Array<{ message?: string } | undefined>;
}) {
	const getErrorContent = () => {
		if (children) {
			return children;
		}

		if (!errors?.length) {
			return null;
		}

		if (errors.length === 1) {
			return errors[0]?.message ?? null;
		}

		const seen = new Set<string>();
		const uniqueMessages: string[] = [];
		for (const error of errors) {
			const msg = error?.message;
			if (msg && !seen.has(msg)) {
				seen.add(msg);
				uniqueMessages.push(msg);
			}
		}

		if (uniqueMessages.length === 1) {
			return uniqueMessages[0];
		}

		return (
			<ul className="ml-4 flex list-disc flex-col gap-1">
				{uniqueMessages.map((message) => (
					<li key={message}>{message}</li>
				))}
			</ul>
		);
	};
	const content = getErrorContent();

	if (!content) {
		return null;
	}

	return (
		<div role="alert" data-slot="field-error" className={cn("font-normal text-destructive text-sm", className)} {...props}>
			{content}
		</div>
	);
}

export { Field, FieldDescription, FieldError, FieldGroup, FieldLabel };
