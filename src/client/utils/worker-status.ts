/**
 * Worker operation states that mean an operation has settled and will never do
 * more work. Shared by the admin-jobs and admin-media pollers so both stop
 * polling on exactly the same condition.
 */
export const TERMINAL_OPERATION_STATUSES = new Set(["completed", "failed", "cancelled"]);
