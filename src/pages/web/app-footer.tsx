import { Logo } from "@/components/logo";
import { m } from "@/paraglide/messages";
import { currentYear } from "@/utils/date-utils";

export function AppFooter() {
	const year = currentYear();

	return (
		<footer className="bg-background relative mt-24 overflow-hidden pt-12 pb-24 xl:pb-16">
			{/* --- SUBTELNY DIVIDER --- */}
			<div className="via-primary/20 absolute top-0 left-1/2 h-px w-1/3 -translate-x-1/2 bg-linear-to-r from-transparent to-transparent" />
			<div className="relative z-10 flex flex-col items-center gap-6 px-8">
				{/* Mini / monochrome logo variant */}
				<div className="opacity-20 transition-opacity hover:opacity-50">
					<Logo className="h-6 w-auto grayscale" />
				</div>

				{/* Main text */}
				<div className="flex flex-col items-center gap-2">
					<p className="text-foreground/20 text-xs font-black">{m.web_footer_tagline()}</p>
					<p className="text-foreground/10 text-xs font-bold">{m.web_footer_copyright({ year })}</p>
				</div>
			</div>

			{/* --- WATERMARK (Zredukowany do minimum) --- */}
			<div className="pointer-events-none absolute bottom-0 left-1/2 w-full -translate-x-1/2 text-center">
				<h1 className="text-foreground/5 translate-y-1/2 text-[18vw] leading-none font-black tracking-tighter uppercase select-none">
					{m.web_footer_brand_watermark()}
				</h1>
			</div>
		</footer>
	);
}
