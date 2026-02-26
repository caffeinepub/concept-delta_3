# Specification

## Summary
**Goal:** Update the Navbar to display conditional navigation links based on authentication and admin status.

**Planned changes:**
- When unauthenticated, the navbar shows no navigation links (Home, Dashboard, Admin).
- When authenticated as a non-admin user, the navbar shows "Home" and "Dashboard" links only.
- When authenticated as an admin user (`isAdmin = true`), the navbar shows "Home", "Dashboard", and "Admin" links.
- "Home" links to `/`, "Dashboard" to `/dashboard`, and "Admin" to `/admin`.
- All nav links use white text on the `#0A1F44` navy background, consistent with the existing theme.
- The mobile hamburger menu respects the same visibility rules.
- No other navbar behaviour (logo, login/logout button, sticky positioning) is changed.

**User-visible outcome:** Authenticated users see Home and Dashboard links in the navbar; admin users additionally see the Admin link. Unauthenticated visitors see no navigation links.
