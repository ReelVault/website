import type { LucideIcon } from "lucide-react";
import { Flame } from "lucide-react";
import type { ReactNode } from "react";
import { SimpleAnimation } from "@/components/simple-animation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function DetailsSection({
	title,
	subtitle,
	action,
	icon = Flame,
	children,
	className,
}: {
	title: string;
	subtitle?: string;
	action?: ReactNode;
	icon?: LucideIcon;
	children: ReactNode;
	className?: string;
}) {
	const Icon = icon;

	return (
		<SimpleAnimation direction="up" duration={280} className={className}>
			<section>
				<div className="mb-8 flex items-center gap-4">
					<div className="flex flex-row items-center gap-4">
						<Badge className="flex size-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-bold text-primary">
							<Icon className="size-5" />
						</Badge>

						{/* Title */}
						<div className="flex flex-col items-start justify-center">
							<h2 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">{title}</h2>
							<h2 className="font-bold text-base text-foreground/45 tracking-tight sm:text-xl">{subtitle}</h2>
						</div>
					</div>

					{/* Decorative Line */}
					<Separator className="ml-4 h-px flex-1 bg-linear-to-r from-border to-transparent" />
					{action && <div>{action}</div>}
				</div>
				{children}
			</section>
		</SimpleAnimation>
	);
}
