import { useDatabaseMigrations } from "@/client/hooks/use-database-migrations";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

/** Applied and pending schema migrations. Pending ones run the next time the server starts. */
export function DatabaseMigrationsSection() {
	const { data } = useDatabaseMigrations();

	if (!data) return null;

	return (
		<AdminSection title={m.admin_database_migrations_title()} description={m.admin_database_migrations_description()}>
			<p className="text-muted-foreground text-sm">{m.admin_database_migrations_summary({ applied: data.applied, total: data.total })}</p>
			{data.pending > 0 && <p className="text-warning text-sm">{m.admin_database_migrations_pending({ pending: data.pending })}</p>}
		</AdminSection>
	);
}
