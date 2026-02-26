# Specification

## Summary
**Goal:** Fix the transparent background issue on the "Submit Test?" confirmation dialog in the Test Page so it is fully readable.

**Planned changes:**
- Update the confirmation dialog overlay in `TestPage.tsx` to use a solid dark background (e.g. `rgba(0,0,0,0.85)`) so underlying page content is not visible through it.
- Update the dialog card to use a solid white (`#FFFFFF`) background, removing any transparency or translucency.
- Ensure all dialog text ("Submit Test?", unanswered question warning) is displayed in navy (`#0A1F44`) on the white card for clear readability.
- Ensure the "Submit Now" button has a solid navy (`#0A1F44`) background with white text.
- Ensure the "Continue Test" button has appropriate solid styling.
- Verify the fix works on both mobile and desktop viewports.

**User-visible outcome:** When a user clicks "Submit Test", the confirmation dialog appears with a solid dark overlay and a solid white card, making all text and buttons clearly readable without the underlying question content showing through.
