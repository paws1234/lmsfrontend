/**
 * Dark-mode preference — the single source of truth for the whole app.
 *
 * The theme is expressed as the `dark` class on <html>.  That one switch is
 * what both halves of the styling system read: Tailwind's `darkMode: "class"`
 * variant (`dark:` utilities) and the token block in `app.css`.
 *
 * Precedence:
 *   1. An explicit choice the user made with the toggle, stored under the
 *      legacy key `darkMode` as "true" / "false".
 *   2. No stored choice (first visit) -> the operating system preference.
 *      Once the user touches the toggle the stored value wins forever, so a
 *      dark OS never overrides a deliberate "light".
 *
 * `public/index.html` contains a tiny inline copy of this resolution so the
 * class is present before the first paint.  Keep the two in step: storage key,
 * accepted values, class name.
 */

const STORAGE_KEY = "darkMode";
const DARK_CLASS = "dark";

/** The stored preference, or `null` when the user has never chosen one. */
export function readStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === null ? null : value === "true";
  } catch {
    // Storage can be blocked (private mode, cookie policy).  Treat it as
    // "no opinion" rather than failing to start.
    return null;
  }
}

/** Whether the operating system currently asks for a dark UI. */
export function systemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/** Stored choice if there is one, otherwise the system preference. */
export function resolveTheme() {
  const stored = readStoredTheme();
  return stored === null ? systemPrefersDark() : stored;
}

/** Put the theme on <html>.  Safe to call repeatedly. */
export function applyTheme(isDark) {
  document.documentElement.classList.toggle(DARK_CLASS, Boolean(isDark));
}

/** Remember an explicit choice.  A failure here must not break the UI. */
export function saveTheme(isDark) {
  try {
    localStorage.setItem(STORAGE_KEY, String(Boolean(isDark)));
  } catch {
    // Preference simply will not survive the reload; the current page is
    // still themed correctly.
  }
}

/**
 * Apply the resolved preference.  Called once from `main.js` before mount, so
 * every route renders with the right theme instead of only the one that owns
 * the toggle.
 */
export function initTheme() {
  const isDark = resolveTheme();
  applyTheme(isDark);
  return isDark;
}
