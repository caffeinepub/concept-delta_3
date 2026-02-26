# Specification

## Summary
**Goal:** Fix the Admin navigation link not appearing in the Navbar for authenticated admin users.

**Planned changes:**
- Rewrite the Admin link visibility logic in `Navbar.tsx` to use a single unconditional `useGetCallerUserProfile` call whenever the user is authenticated, removing any existing `useIsCallerAdmin`, `useGetCallerRole`, or route-gated checks
- Correctly unwrap the Motoko Option returned by the backend (read index `[0]` to get the profile, then read `profile.isAdmin`) to derive `showAdmin`
- Render the Admin link in both the desktop nav and mobile hamburger menu on all routes (including `/`) whenever `showAdmin === true`
- Ensure the Admin link remains hidden for unauthenticated users and authenticated non-admin users
- Preserve existing Navy Blue (`#0A1F44`) and white theme styling

**User-visible outcome:** Authenticated admin users will see the "Admin" navigation link in both the desktop navbar and mobile hamburger menu on every page, including the Home page.
