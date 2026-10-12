import { Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import type { useAdminPeople } from "@/client/hooks/use-admin-people";
import { PersonContextMenuContent } from "@/components/cards/person-card";
import { ApiImage } from "@/components/ui/api-image";
import { Card, CardContent } from "@/components/ui/card";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { m } from "@/paraglide/messages";

type PersonItem = ReturnType<typeof useAdminPeople>["people"][number];

interface PersonCardProps {
	person: PersonItem;
	selected: boolean;
	onToggleSelect: (id: string) => void;
	onRefresh: (id: string) => void;
	onRefreshImage: (id: string) => void;
}

export function PersonCard({ person, selected, onToggleSelect, onRefresh, onRefreshImage }: PersonCardProps) {
	return (
		<ContextMenu>
			<ContextMenuTrigger>
				{/* The checkbox sits outside the link, so selecting a person does not open the profile. */}
				<div className="relative">
					<label className="absolute top-2 left-2 z-10 flex size-7 cursor-pointer items-center justify-center rounded-md bg-background/85 shadow-xs">
						<input
							type="checkbox"
							className="size-4 accent-primary"
							checked={selected}
							onChange={() => onToggleSelect(person.id)}
							aria-label={m.admin_people_select_person()}
						/>
					</label>
					<Link to="/person/$id" params={{ id: person.id }} className="group block focus:outline-none">
						<Card className="h-full overflow-hidden">
							<div className="relative aspect-2/3 w-full overflow-hidden border-border/60 border-b bg-muted/40">
								{person.imageId ? (
									<ApiImage
										fileId={person.imageId}
										alt={person.name}
										width={220}
										aspectRatio={2 / 3}
										sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
										zoom
										className="w-full object-cover"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
										<User className="size-12" />
									</div>
								)}
							</div>
							<CardContent className="text-center">
								<h3 className="truncate font-semibold text-foreground text-sm tracking-tight group-hover:text-primary" title={person.name}>
									{person.name}
								</h3>
							</CardContent>
						</Card>
					</Link>
				</div>
			</ContextMenuTrigger>
			<PersonContextMenuContent
				personId={person.id}
				personName={person.name}
				isAdmin
				onRefresh={onRefresh}
				onRefreshImage={onRefreshImage}
			/>
		</ContextMenu>
	);
}
