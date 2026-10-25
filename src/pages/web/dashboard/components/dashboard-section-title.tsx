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
				<SimpleAnimation className="text-primary/70 absolute -top-6 left-0 flex items-center gap-1.5 text-xs font-bold">
					<Icon className="text-primary size-3.5" />
					<span>{category}</span>
				</SimpleAnimation>
				<h2 className="text-foreground text-3xl font-black tracking-tighter uppercase sm:text-4xl md:text-5xl lg:text-7xl">
					{title} <br />
					<span className="from-primary to-accent bg-linear-to-r bg-clip-text text-transparent">{subtitle}</span>
				</h2>
			</header>
			{children}
		</div>
	);
}
