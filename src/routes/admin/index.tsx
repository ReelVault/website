import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
	beforeLoad: () => {
		redirect({ to: "/admin/dashboard", throw: true });
	},
});
