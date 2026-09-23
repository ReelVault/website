// Inline copies of the five lucide icons used by the 404/error screens (same
// paths, same 24x24 stroke defaults). These screens are part of the eager
// startup graph, and importing them from lucide-react pulled the whole icon
// chunk into first paint just for this.
import type { SVGProps } from "react";

function RouteScreenIcon({ children, ...props }: SVGProps<SVGSVGElement>) {
	return (
		// Decorative glyphs — the adjacent controls/labels carry the accessible name.
		<svg
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			{children}
		</svg>
	);
}

export function CompassIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<RouteScreenIcon {...props}>
			<circle cx="12" cy="12" r="10" />
			<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
		</RouteScreenIcon>
	);
}

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<RouteScreenIcon {...props}>
			<path d="m12 19-7-7 7-7" />
			<path d="M19 12H5" />
		</RouteScreenIcon>
	);
}

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<RouteScreenIcon {...props}>
			<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
			<path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
		</RouteScreenIcon>
	);
}

export function AlertTriangleIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<RouteScreenIcon {...props}>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
			<path d="M12 9v4" />
			<path d="M12 17h.01" />
		</RouteScreenIcon>
	);
}

export function RefreshCwIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<RouteScreenIcon {...props}>
			<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
			<path d="M21 3v5h-5" />
			<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
			<path d="M8 16H3v5" />
		</RouteScreenIcon>
	);
}
