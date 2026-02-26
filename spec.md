# Specification

## Summary
**Goal:** Replace Google Login with Internet Identity authentication throughout the Concept Delta platform, and ensure the first-time profile setup flow is correctly wired to the Internet Identity auth state.

**Planned changes:**
- Remove all Google Login buttons, OAuth configuration, and any UI copy referencing Google Login from the codebase
- Replace the navbar Login button with an Internet Identity login trigger using the existing `useInternetIdentity` hook
- Verify and fix the integration between Internet Identity auth state and `ProfileSetupModal` so it automatically appears after a first-time login
- Ensure the profile setup modal collects Full Name, Class (11th/12th/Dropper), and Contact Number, calls the backend to persist the profile, and redirects to `/dashboard` on success
- Ensure returning users (with an existing profile) skip the modal entirely

**User-visible outcome:** Users log in exclusively via Internet Identity. First-time users are prompted to set up their profile after authenticating, and are then redirected to the dashboard. Returning users go directly to the dashboard without seeing the profile setup modal.
