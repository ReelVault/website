import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon, CompassIcon, HomeIcon } from "@/components/router/route-screen-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

export function NotFoundScreen() {
	const router = useRouter();

	return (
		<main className="bg-background text-foreground relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6">
			{/* Subtle ambient lighting */}
			<div className="pointer-events-none absolute top-1/2 left-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_12%,transparent)_0%,transparent_70%)]" />

			<div className="relative z-10 flex max-w-md flex-col items-center text-center">
				<div className="border-primary/20 bg-primary/10 text-primary shadow-primary/10 flex size-20 items-center justify-center rounded-3xl border shadow-2xl">
					<CompassIcon className="size-10" />
				</div>

				<span className="text-primary mt-6 font-mono text-sm font-bold">{m.components_not_found_404()}</span>
				<h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{m.components_not_found_heading()}</h1>
				<p className="text-muted-foreground mt-3 text-sm leading-relaxed">{m.components_not_found_description()}</p>

				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<Button type="button" variant="outline" onClick={() => router.history.back()}>
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
