/**
 * Routes reachable without a session. Data hooks that would only produce 401
 * noise there (current user, plugin UI manifest) skip fetching on them.
 */
export function isPublicNoSessionPath(pathname: string): boolean {
	return pathname === "/setup" || pathname === "/auth/login";
}
