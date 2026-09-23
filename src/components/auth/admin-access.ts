interface AdminUserLike {
	role?: string | null;
}

export function isAdminUser(user: AdminUserLike | null | undefined) {
	return user?.role === "admin";
}
