# Specification

## Summary
**Goal:** Fix the ProfileSetupModal so its overlay and card have solid, opaque backgrounds, making all form fields and labels clearly readable.

**Planned changes:**
- Update the modal overlay in `ProfileSetupModal.tsx` to use a fully opaque dark background (e.g. `rgba(0,0,0,0.85)`) so no underlying page content shows through
- Update the modal card to use a solid white (`#FFFFFF`) background, removing any transparency or blur effects
- Ensure all form labels, input fields, validation messages, and the Save & Continue button are clearly readable with navy (`#0A1F44`) text on the white card

**User-visible outcome:** The ProfileSetupModal displays with a solid dark overlay and a solid white card, so the form (Full Name, Class, Contact Number) is fully readable without the home page content bleeding through.
