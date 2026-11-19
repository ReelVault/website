import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SimpleAnimation } from "@/components/simple-animation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function DetailsSection({
	title,
	action,
	icon: Icon,
	children,
}: {
	title: string;
	action?: ReactNode;
	icon: LucideIcon;
	children: ReactNode;
}) {
	return (
		<SimpleAnimation direction="up" duration={280}>
			<section>
				<div className="mb-8 flex items-center gap-4">
					<div className="flex flex-row items-center gap-4">
						<Badge weight="bold" variant="primary" className="flex items-center justify-center">
							<Icon className="size-5" />
						</Badge>

						<h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
					</div>

					<Separator className="ml-4 flex-1" />
					{action && <div>{action}</div>}
				</div>
				{children}
			</section>
		</SimpleAnimation>
	);
}
