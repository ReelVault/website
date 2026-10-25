import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Suspense, use } from "react";
import { AlertTriangleIcon, HomeIcon, RefreshCwIcon } from "@/components/router/route-screen-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import type { translateError as translateErrorFn } from "@/utils/translate-error";

type TranslateError = typeof translateErrorFn;

let translatorPromise: Promise<TranslateError | null> | undefined;

/**
 * Loaded on demand: the error catalog is ~20 KB br and this screen only renders
 * after a failed route, so it must not sit in the eager graph.
 */
async function loadTranslateErrorModule(): Promise<TranslateError | null> {
	try {
		const mod = await import("@/utils/translate-error");

		return mod.translateError;
	} catch {
		// Do not cache the failure — the next error screen retries the import.
		translatorPromise = undefined;

		return null;
	}
}

function loadTranslateError(): Promise<TranslateError | null> {
	translatorPromise ??= loadTranslateErrorModule();

	return translatorPromise;
}

function ErrorDescription({ error }: { error: unknown }) {
	const translateError = use(loadTranslateError());

	return <>{translateError ? translateError(error, m.components_route_error_description()) : m.components_route_error_description()}</>;
}

export function RouteErrorScreen({ error, reset }: ErrorComponentProps) {
	return (
		<main className="text-foreground relative flex min-h-[60vh] w-full flex-col items-center justify-center p-6">
			<div className="pointer-events-none absolute top-1/2 left-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--destructive)_12%,transparent)_0%,transparent_70%)]" />

			<div className="relative z-10 flex max-w-md flex-col items-center text-center">
				<div className="border-destructive/30 bg-destructive/10 text-destructive shadow-destructive/10 flex size-16 items-center justify-center rounded-2xl border shadow-lg">
					<AlertTriangleIcon className="size-8" />
				</div>

				<h1 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">{m.components_route_error_heading()}</h1>
				<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
					<Suspense fallback={null}>
						<ErrorDescription error={error} />
					</Suspense>
				</p>

				<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
					{
						<Button type="button" onClick={reset}>
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
