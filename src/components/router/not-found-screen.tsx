import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon, CompassIcon, HomeIcon } from "@/components/router/route-screen-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

export function NotFoundScreen() {
	const router = useRouter();

	return (
		<main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-6 text-foreground">
			{/* Subtle ambient lighting */}
			<div className="pointer-events-none absolute top-1/2 left-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_12%,transparent)_0%,transparent_70%)]" />

			<div className="relative z-10 flex max-w-md flex-col items-center text-center">
				<div className="flex size-20 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 text-primary shadow-2xl shadow-primary/10">
					<CompassIcon className="size-10" />
				</div>

				<span className="mt-6 font-bold font-mono text-primary text-sm uppercase tracking-widest">{m.components_not_found_404()}</span>
				<h1 className="mt-2 font-black text-3xl tracking-tight sm:text-4xl">{m.components_not_found_heading()}</h1>
				<p className="mt-3 text-muted-foreground text-sm leading-relaxed">{m.components_not_found_description()}</p>

				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<Button type="button" variant="outline" onClick={() => router.history.back()} className="gap-2 rounded-xl">
						<ArrowLeftIcon className="size-4" />
						{m.common_back()}
					</Button>
					<Link to="/dashboard" className={buttonVariants({ className: "gap-2 rounded-xl shadow-lg shadow-primary/20" })}>
						<HomeIcon className="size-4" />
						{m.components_go_home()}
					</Link>
				</div>
			</div>
		</main>
	);
}

export default NotFoundScreen;
