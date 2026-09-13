# UI/UX Enhancement Plan — CTU LMS frontend

Status: **in progress** · Owner: frontend (`lmsfrontend`) · Last updated 2026-09-13

## 0. Progress log

### Done and verified locally (1440 / 768 / 390)
- **F1 fixed — the big payload win.** Tailwind is now a dev dependency built and purged
  locally (`tailwind.config.js`, `postcss.config.js`, `src/assets/styles/app.css` imported
  from `src/main.js`); the CDN `<link>` is gone from `public/index.html`.
  Stylesheet: **2,934,019 B → 31,108 B** uncompressed (**94×**), 255,702 B → 6,912 B gzipped
  (**37×**), and one fewer render-blocking cross-origin request.
  Purge was checked against real usage, not assumed: `grid-cols-3` and `dark:text-gray-300`
  are absent because they appear **0 times** in `src/`, while all sampled classes that *are*
  used (`min-h-screen`, `items-center`, `rounded-md`, `shadow-md`, `bg-blue-50`,
  `text-blue-900`, `h-32`, `sm:block`, `hidden`, `flex`, `justify-between`, `flex-grow`) are present.
- **F2 fixed with one config line.** `darkMode: "class"`. The app already toggled `dark` on
  `<html>` and persisted it in `localStorage` — the CDN build just never emitted any `dark:`
  utilities, so the toggle only moved a couple of JS-driven colours. Measured after clicking it:
  header `rgb(0,0,0)` (was transparent), body `rgb(22,32,44)` (the dark token). No component
  code needed to change.
- **F8 fixed** — `src/assets/styles/app.css` exists, with tokens and a
  `.btn` / `.card` / `.form-field` / `.alert*` / `.empty-state` / `.spinner` / `.skeleton`
  layer. Only the body-level defaults apply so far; views opt in incrementally.
- **F3 fixed** — the login and register seals were moved out of their unanchored `absolute`
  wrappers into normal flow. Measured at 390 and 1440: seal inside the card, centred
  (720 = 720 at desktop), **zero intersections with any input, button, heading or link**.
  The non-existent `size-6` and `sm:h-25` classes were replaced with ones Tailwind 2 has.
- **F7 partly fixed** — `<html lang="en">`; the stray `<meta name="viewport">` removed from
  `HomeComponent`'s header; `autocomplete` added to both auth forms (`email`, `current-password`,
  `name`, `new-password`). Still open: the dark-mode control is a `<div @click>` with no button
  semantics, keyboard access or `aria-pressed`.
- **F4 fixed** — `StudentScores.vue` now has one state at a time: loading (`.spinner`), empty
  (`.empty-state`), error (`.alert-error`) and data. A 404 is the API saying "this student has no
  submissions yet", so it renders "No scores yet / They appear once your teacher publishes
  results." instead of a blank page; only a non-404 failure becomes the error alert (and the
  `console.error` that used to fire on every empty visit is gone). The body cannot be read to tell
  "no submissions" from "no student row" — `EncryptResponse` encrypts the 404 too — so the branch
  is on the status code only; that second case is F6's job. Verified in the browser against the
  real API with a fresh `student` account (register → login → `/student/scores`): real 404 →
  empty state, 200 with `score_data` → the list still renders, 200 with empty `score_data` → empty
  state, 500 → "We couldn't load your scores. Please try again later.". Legible at 390×844 and
  768×1024, no horizontal overflow at 390/768/1440 (`documentElement.scrollWidth` equals the
  viewport at all three). The 1440 screenshots came back blank even for the **unmodified** login
  page, so `screenshot_page` is losing text at that size in this session — the 1440 check is
  DOM-measured, not eyeballed.

### Still open
- **F5 / F6** — error and missing-profile states (Phase 4). Not started.
- **F9** — the dead `dotenv` dependency and the unused `localStorageInterceptor.js`.
- Phase 6 polish, and the accessibility half of Phase 2.
- Not yet done: committing/pushing, and redeploying Vercel with the new build.

## 1. Why — evidence gathered by reading the code

| # | Finding | Evidence | Status |
|---|---------|----------|--------|
| F1 | **Every page ships the whole Tailwind framework from a third-party CDN.** | `public/index.html` links `cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css`. Tailwind is **not** in `package.json`, and there is no `tailwind.config.js`/`postcss.config.js`, so nothing is purged. | Verified |
| F2 | **Dark mode cannot fully work.** `HomeComponent.vue` styles with `dark:bg-black`, `dark:text-gray-300`. Tailwind 2's CDN build uses the default config where `darkMode` is off, so no `dark:` utilities exist — the author had to drive some colours from JS instead. | Verified (files); one click to confirm |
| F3 | **Login/Register logo overlaps the form card on mobile.** The wrapper is `absolute top-24 right-1/3 md:top-5 md:right-32 …` with **no positioned ancestor**, so it lays out against the viewport instead of the card. | Verified: 53 px overlap at 390×844 (logo y 108–236, card top 183) |
| F4 | **Scores page renders blank when there is no data.** `ScoreController::index()` returns `404 {"message":"No submissions found for this student"}`; the view shows only the "Your Scores" heading plus a console error. | Verified in the deployed app | Fixed |
| F5 | **Login failures can't say why.** The 401 body is encrypted; the error path logs ciphertext and the UI falls back to "An error occurred. Please try again." | Verified in the deployed app |
| F6 | **A new account lands on a broken dashboard.** `POST /api/register` writes only `users`; the student dashboard needs a `students` row and 404s without one. | Verified end-to-end |
| F7 | **Markup/a11y defects.** `<html lang="">` is empty; a duplicate `<meta name="viewport">` sits inside `HomeComponent`'s `<header>` (i.e. in the body); the dark-mode control is a `<div @click>` with no button semantics, no keyboard access and no `aria-pressed`; form inputs have no `autocomplete` hints. | Verified (files) |
| F8 | **No local stylesheet exists.** `src/assets/` holds only `favicon.ico` and `img/`; `main.js` imports no global CSS, so every style is a utility class repeated per template. | Verified |
| F9 | `localStorageInterceptor.js` is imported nowhere (`main.js` has it commented out); the axios interceptor attaches the token directly. Dead file. | Verified |

## 2. Goals

1. **Fast loading** — one blocking third-party stylesheet replaced by a small, purged, self-hosted one.
2. **One visual language** — colour, type scale, spacing, focus states, buttons and cards defined once.
3. **Dark mode that actually works**, independent of the Tailwind version.
4. **Real states** — loading, empty and error, instead of blank panels.
5. **Local-first iteration** — dev server against the local API, so no ~40 s cold starts.

## 3. Non-goals

- No change to information architecture, routes or the API contract.
- No new features, no component library, no framework change (stays Vue 3 + Vue CLI).
- No change to what the dashboards display — same data, presented better.

## 4. Phases

Each phase is independently shippable and independently verifiable.

### Phase 0 — Local speed (first; it makes every later phase fast)
- Frontend: `VUE_APP_API_BASE_URL=http://localhost:8000/api` (already the compose default and the `axios.js` fallback).
- `npm run serve` on :8080 against the local backend on :8000 — no Render cold start.
- Verify: a login round-trip completes in well under a second.

### Phase 1 — Design tokens and a base stylesheet
- New `src/assets/styles/tokens.css`: CSS custom properties for the CTU palette, spacing, radii, shadows, a type scale, and light/dark value pairs; base rules for `box-sizing`, focus-visible rings, and `.btn` / `.btn-primary` / `.card` / `.field` / `.alert` / `.spinner` / `.empty-state`; honours `prefers-reduced-motion`.
- Import once in `src/main.js`. Purely additive — nothing changes until a view opts in.
- Verify: the app renders identically when no new class is used.

### Phase 2 — Dark mode that works
- Driven by `data-theme="dark"` on `<html>` plus the Phase 1 tokens — **not** Tailwind's `dark:` variant, which the CDN cannot provide.
- Persist the choice in `localStorage`; respect `prefers-color-scheme` on first visit.
- Replace the `<div @click>` toggle with `<button type="button" aria-pressed="…" aria-label="Toggle dark mode">` and a real focus ring.
- Verify: the toggle changes the page background and survives a reload.

### Phase 3 — Fix the verified defects
- **F3** — remove the unanchored `absolute` wrapper so the logo sits in the flow above the card. Same pattern in `RegisterComponent.vue`, which also uses `sm:h-25`, a class that does not exist in Tailwind 2.
- **F7** — `<html lang="en">`; delete the stray `<meta name="viewport">` from the header markup; add `autocomplete` hints to the auth forms.
- Verify: `getBoundingClientRect` shows no intersection at 390 / 768 / 1440 — measured, not eyeballed.

### Phase 4 — Loading, empty and error states
- **F4** — Scores renders an `.empty-state` card ("No scores yet — they appear once your teacher publishes results") on a 404 instead of a blank page.
- **F5** — read/decrypt the error body so "Invalid credentials" reaches the user, and distinguish a network failure from rejected credentials.
- **F6** — when the dashboard's profile lookup 404s, show a clear "your profile is not set up yet" panel rather than zeros.
- Skeletons/spinners while the API responds.
- Verify: with an empty database every page explains itself; with data it renders it.

### Phase 5 — Performance: self-hosted, purged Tailwind
- Add Tailwind as a dev dependency with `tailwind.config.js` (content globs over `src/**/*.vue`), `postcss.config.js` and `src/assets/styles/tailwind.css`; remove the jsDelivr `<link>`.
- **Pin Tailwind 2.x** — 3.x renamed utilities (`flex-grow`, `transform`, …) and would silently drop styling across many views.
- Verify: compare built CSS size before/after; confirm the rendered result is equivalent at three widths. This is the biggest "fast loading" win.

### Phase 6 — Polish
- Consistent page headers, padding rhythm and card radii across the admin/teacher/student layouts.
- Replace the `https://via.placeholder.com` avatars in `AdminSidebar.vue` with inline initials — a third-party request per render that is often blocked.
- Delete the dead `dotenv` dependency and `localStorageInterceptor.js`.

### Phase 7 — Verification pass
- Per the `visual-testing` skill: desktop 1440×900, tablet 768×1024, mobile 390×844; re-shoot after the last change; close the page when done.
- Functional pass over login, register, each dashboard, each list page and each empty state.
- Confirm the deployed Vercel build still works (the API URL stays an env var).

## 5. Order of work

Phase 0 → 1 → 3 → 4 → 2 → 5 → 6 → 7

Phase 1 adds classes only, so it cannot break a view. Phase 3 and 4 fix things a user has already hit. Phase 5 is the biggest payload win but the largest diff.

## 6. Risks

- **Tailwind version drift** — pin 2.x; see Phase 5.
- **Refactor surface** — views are migrated one at a time so a mistake stays local.
- **Two deployment targets** — keep `VUE_APP_API_BASE_URL` as the single switch; never hardcode the Render URL in a component.
- **Unverified changes** — anything not confirmed in the browser at three widths is reported as unverified, not done.
