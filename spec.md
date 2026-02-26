# Specification

## Summary
**Goal:** Restrict the Admin Panel so it is only accessible on the admin user's very first visit, redirecting all subsequent attempts to the dashboard.

**Planned changes:**
- Add a `hasVisitedAdmin` boolean field (default `false`) to the User record in the backend.
- Add a `markAdminVisited()` update function in the backend that sets the flag to `true` for the calling admin principal.
- Add a `hasAdminBeenVisited()` query function in the backend that returns the flag value for the caller.
- Both new backend functions are guarded to allow only users with `isAdmin = true`.
- Update the frontend `AdminRoute` guard to check `hasAdminBeenVisited()` before rendering the admin page.
- On first visit to `/admin`, render the admin page normally and call `markAdminVisited()`.
- On subsequent visits to `/admin` where `hasAdminBeenVisited()` returns `true`, redirect the user to `/dashboard` and show a toast or inline message explaining the panel is only accessible on first login.

**User-visible outcome:** An admin user can access the Admin Panel only once (first login). Any subsequent navigation to `/admin` automatically redirects them to the dashboard with an explanatory message.
