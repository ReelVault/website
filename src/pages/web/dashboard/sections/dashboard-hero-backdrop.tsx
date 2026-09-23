import { SimpleAnimation } from "@/components/simple-animation";
import { ApiImage } from "@/components/ui/api-image";

export function DashboardHeroBackdrop({
	fileId,
	cacheKey,
	alt,
	isActive,
	priority,
}: {
	fileId: string | undefined;
	cacheKey: string | number | Date | undefined;
	alt: string;
	isActive: boolean;
	priority: boolean;
}) {
	return (
		<SimpleAnimation trigger="mount" direction="scale" duration={700} animate={["transform"]} className="absolute inset-0">
			<div
				className="absolute inset-0 transition-opacity duration-700 ease-out"
				style={{ opacity: isActive ? 1 : 0 }}
				aria-hidden={!isActive}
			>
				<ApiImage fileId={fileId} cacheKey={cacheKey} alt={alt} fill priority={priority} className="size-full object-cover saturate-110" />
			</div>
		</SimpleAnimation>
	);
}
