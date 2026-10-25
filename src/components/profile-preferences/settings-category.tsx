import type { ReactNode } from "react";

/** Uniform category header inside a settings section: title + optional hint + controls. */
export function SettingsCategory({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
	return (
		<section className="flex flex-col gap-5">
			<div>
				<h3 className="text-lg font-semibold">{title}</h3>
				{description ? <p className="text-muted-foreground mt-1 text-sm">{description}</p> : null}
			</div>
			{children}
		</section>
	);
}
