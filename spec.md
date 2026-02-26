# Specification

## Summary
**Goal:** Pre-load question images before the user sees the first question, and speed up the test submission flow to minimize delays.

**Planned changes:**
- In `TestPage.tsx`, use the browser's `Image` constructor to pre-fetch all question images in the background immediately after the test and question list are fetched from the backend.
- Ensure the first question's image is already cached when the test starts, so no loading placeholder is visible.
- On test submission (manual or timer-based), immediately show a "Submitting…" loading state to give instant visual feedback.
- Remove any unnecessary sequential awaits, redundant refetches, or extra delays between submission confirmation and navigation to the result screen.

**User-visible outcome:** When a test starts, the first question and its image appear instantly. Navigating between questions shows images without delay. Submitting a test transitions to the result screen as fast as the single backend call allows, with no extra waiting.
