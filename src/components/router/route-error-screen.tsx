import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AlertTriangleIcon, HomeIcon, RefreshCwIcon } from "@/components/router/route-screen-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

export function RouteErrorScreen({ error, reset }: ErrorComponentProps) {
	const errorMessage = error instanceof Error ? error.message : m.components_route_error_description();

	return (
		<main className="relative flex min-h-[60vh] w-full flex-col items-center justify-center p-6 text-foreground">
			<div className="pointer-events-none absolute top-1/2 left-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--destructive)_12%,transparent)_0%,transparent_70%)]" />

			<div className="relative z-10 flex max-w-md flex-col items-center text-center">
				<div className="flex size-16 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive shadow-destructive/10 shadow-lg">
					<AlertTriangleIcon className="size-8" />
				</div>

				<h1 className="mt-5 font-black text-2xl tracking-tight sm:text-3xl">{m.components_route_error_heading()}</h1>
				<p className="mt-2 text-muted-foreground text-sm leading-relaxed">{errorMessage}</p>

				<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
					{
						<Button type="button" onClick={reset} className="gap-2 rounded-xl">
							<RefreshCwIcon className="size-4" />
							{m.common_try_again()}
						</Button>
					}
					<Link to="/dashboard" className={buttonVariants({ variant: "outline", className: "gap-2 rounded-xl" })}>
						<HomeIcon className="size-4" />
						{m.components_go_home()}
					</Link>
				</div>
			</div>
		</main>
	);
}

export default RouteErrorScreen;
