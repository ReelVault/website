import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
	// SPA only: next-themes' inline init <script> is never executed on the
	// client, so mark it as a non-JS data block to avoid React 19's
	// "Encountered a script tag while rendering React component" warning while
	// keeping the element intact.
	const scriptProps = typeof window === "undefined" ? props.scriptProps : { ...props.scriptProps, type: "application/json" };

	return (
		<NextThemesProvider {...props} scriptProps={scriptProps}>
			{children}
		</NextThemesProvider>
	);
}
