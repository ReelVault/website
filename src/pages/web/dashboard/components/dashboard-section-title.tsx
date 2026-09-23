import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SimpleAnimation } from "@/components/simple-animation";

export default function DashboardSectionTitle({
	icon,
	category,
	title,
	subtitle,
	children,
}: {
	icon: LucideIcon;
	category: string;
	title: string;
	subtitle: string;
	children?: ReactNode;
}) {
	const Icon = icon;

	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<header className="relative">
				<SimpleAnimation className="absolute -top-6 left-0 flex items-center gap-1.5 font-bold text-primary/70 text-xs uppercase tracking-[0.3em]">
					<Icon className="size-3.5 text-primary" />
					<span>{category}</span>
				</SimpleAnimation>
				<h2 className="font-black text-3xl text-foreground uppercase tracking-tighter sm:text-4xl md:text-5xl lg:text-7xl">
					{title} <br />
					<span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">{subtitle}</span>
				</h2>
			</header>
			{children}
		</div>
	);
}
