import { Logo } from "@/components/logo";
import { m } from "@/paraglide/messages";

export function AppFooter() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="relative mt-24 overflow-hidden bg-background pt-12 pb-24 xl:pb-16">
			{/* --- SUBTELNY DIVIDER --- */}
			<div className="absolute top-0 left-1/2 h-px w-1/3 -translate-x-1/2 bg-linear-to-r from-transparent via-primary/20 to-transparent" />
			<div className="relative z-10 flex flex-col items-center gap-6 px-8">
				{/* Mini / monochrome logo variant */}
				<div className="opacity-20 transition-opacity hover:opacity-50">
					<Logo className="h-6 w-auto grayscale" />
				</div>

				{/* Main text */}
				<div className="flex flex-col items-center gap-2">
					<p className="font-black text-[9px] text-foreground/20 uppercase tracking-[0.6em]">{m.web_footer_tagline()}</p>
					<p className="font-bold text-[7px] text-foreground/10 uppercase tracking-[0.4em]">
						{m.web_footer_copyright({ year: currentYear })}
					</p>
				</div>
			</div>

			{/* --- WATERMARK (Zredukowany do minimum) --- */}
			<div className="pointer-events-none absolute bottom-0 left-1/2 w-full -translate-x-1/2 text-center">
				<h1 className="translate-y-1/2 select-none font-black text-[18vw] text-foreground/5 uppercase leading-none tracking-tighter">
					{m.web_footer_brand_watermark()}
				</h1>
			</div>
		</footer>
	);
}
