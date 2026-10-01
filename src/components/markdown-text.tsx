import { cn } from "cn";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";

const remarkPlugins = [remarkGfm, remarkAlert];

const components: Components = {
	a: ({ children, href }) => (
		<a href={href} target="_blank" rel="noreferrer">
			{children}
		</a>
	),
};

const WRAPPER_CLASS = cn(
	"wrap-break-word text-muted-foreground text-sm leading-relaxed",
	"[&>*:not(:first-child)]:mt-2",
	"[&_:is(h1,h2,h3,h4,h5,h6)]:mb-1 [&_:is(h1,h2,h3,h4,h5,h6)]:font-semibold [&_:is(h1,h2,h3,h4,h5,h6)]:text-foreground [&_h1]:text-base",
	"[&_li]:mt-1 [&_li]:marker:text-muted-foreground/60 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
	"[&_a]:text-primary [&_a]:underline-offset-2 [&_a]:hover:underline",
	"[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:text-xs [&_pre_code]:bg-transparent [&_pre_code]:p-0",
	"[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-foreground [&_:not(pre)>code]:text-xs",
	"[&_blockquote]:border-border [&_blockquote]:border-l-2 [&_blockquote]:pl-3",
	"[&_hr]:border-border",
	"[&_table]:w-full [&_table]:text-xs [&_td]:border-border [&_td]:border-b [&_td]:px-2 [&_td]:py-1 [&_th]:border-border [&_th]:border-b [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-medium [&_th]:text-foreground",
	"[&_img]:max-w-full [&_img]:rounded-md",
	"[&_.markdown-alert]:rounded-md [&_.markdown-alert]:border-l-2 [&_.markdown-alert]:py-2 [&_.markdown-alert]:pr-2 [&_.markdown-alert]:pl-3",
	"[&_.markdown-alert-note]:border-info [&_.markdown-alert-note]:bg-info/5 [&_.markdown-alert-note_.markdown-alert-title]:text-info",
	"[&_.markdown-alert-tip]:border-success [&_.markdown-alert-tip]:bg-success/5 [&_.markdown-alert-tip_.markdown-alert-title]:text-success",
	"[&_.markdown-alert-important]:border-primary [&_.markdown-alert-important]:bg-primary/5 [&_.markdown-alert-important_.markdown-alert-title]:text-primary",
	"[&_.markdown-alert-warning]:border-warning [&_.markdown-alert-warning]:bg-warning/5 [&_.markdown-alert-warning_.markdown-alert-title]:text-warning",
	"[&_.markdown-alert-caution]:border-destructive [&_.markdown-alert-caution]:bg-destructive/5 [&_.markdown-alert-caution_.markdown-alert-title]:text-destructive",
	"[&_.markdown-alert-title]:flex [&_.markdown-alert-title]:items-center [&_.markdown-alert-title]:gap-1.5 [&_.markdown-alert-title]:font-semibold [&_.markdown-alert-title]:text-xs [&_.markdown-alert-title_svg]:size-3.5 [&_.markdown-alert-title_svg]:shrink-0",
);

export function MarkdownText({ children, className }: { children: string; className?: string }) {
	return (
		<div className={cn(WRAPPER_CLASS, className)}>
			<Markdown components={components} remarkPlugins={remarkPlugins}>
				{children}
			</Markdown>
		</div>
	);
}
