import { Logo } from "@/components/logo";

export function LoadingScreen() {
	return (
		<div className="fixed top-0 z-9999 flex h-svh w-full flex-col items-center justify-center overflow-hidden bg-background">
			{/* <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-10 blur-[120px]" />
			<div className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-10 blur-[80px] delay-700" /> */}

			{/* --- GRID EFFECT --- */}
			<div
				className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]"
				style={{
					backgroundImage:
						"linear-gradient(to right, color-mix(in oklab, var(--foreground) 60%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 60%, transparent) 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>

			<div className="relative z-10 flex flex-col items-center gap-8">
				{/* Logo */}
				<Logo className="h-14 w-auto drop-shadow-[0_0_25px_color-mix(in_oklab,var(--primary)_40%,transparent)]" />

				{/* Loading bar (Skeuomorphic/Neon) */}
				<div className="relative h-1 w-48 overflow-hidden rounded-full">
					<div className="absolute h-full w-24 animate-[loading_1.5s_infinite_ease-in-out] rounded-full bg-linear-to-r from-transparent via-primary to-transparent" />
				</div>
			</div>
		</div>
	);
}

export default LoadingScreen;
