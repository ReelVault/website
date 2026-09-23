/** CSS-only cinema backdrop for auth pages — zero external requests. */
export function AuthBackdrop() {
	return (
		<div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-background">
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>
			<div className="absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
			<div className="absolute -bottom-40 -left-24 size-96 rounded-full bg-primary/5 blur-[100px]" />
			<div className="absolute inset-0 bg-linear-to-b from-background/70 via-transparent to-background" />
		</div>
	);
}
