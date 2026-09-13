# UI/UX task baseline — CTU LMS frontend

Companion to `UI-UX-PLAN.md`. The plan says *what* and *why*; this file is the **executable checklist**:
every finding and every phase is cut into tasks small enough to finish and verify in one sitting.

Status: baseline established 2026-09-13 · verified against the working tree, not against the plan's prose.

---

## 1. Baseline facts (re-verified 2026-09-13)

Evidence column = the command/file that proves it. Anything not listed here is **not** verified.

| # | Fact | Evidence | Plan says | Delta |
|---|------|----------|-----------|-------|
| B1 | Frontend tree is **clean and pushed** (`origin/main` == HEAD: "done with f4") | `git status --short` empty, `git log --oneline -5` | "Not yet done: committing/pushing" | **stale** |
| B2 | Tailwind **2.2.19** is a devDependency, built locally via `tailwind.config.js` + `postcss.config.js`; no CDN `<link>` in `public/index.html` | `package.json`, `tailwind.config.js`, grep for `cdn.jsdelivr` | F1, Phase 5 | done |
| B3 | `<html lang="en">`, `theme-color` meta present, no in-body `<meta name="viewport">`, no `size-6` / `sm:h-25` | `public/index.html`, grep over `src/**` | F7 partly, Phase 3 | done |
| B4 | Auth forms carry `autocomplete` (`email`, `current-password`, `name`, `new-password`) | `LoginComponent.vue`, `RegisterComponent.vue` | F7 partly | done |
| B5 | **`dark:` utilities exist in one file only** (`HomeComponent.vue`: header + footer) | grep `dark:` over `src/**` → 2 hits in 1 file | F2 "fixed" | **narrower than claimed** |
| B6 | `app.css` defines `[data-theme="dark"]` tokens but **nothing ever sets `data-theme`** | grep `data-theme` → `app.css:77` only | Phase 2 prescribes `data-theme` | **dead code / contradiction** |
| B7 | Dark toggle is still `<div @click>` — no `<button>`, no `aria-pressed`, no keyboard path | `HomeComponent.vue:23,30` | F7 "still open" | open |
| B8 | `GET /api/student/stats` returns **404 `{"error":"Student not found"}`** when the user has no `students` row; `loadStatsData()` swallows it → dashboard shows zeros | `StudentDashboardController.php:19-22`, `StudentDashboard.vue:117-139` | F6 "profile lookup 404s" | **mechanism now exact** |
| B9 | Views read `error.response?.data?.message`; the 404 above uses the key **`error`** | grep `error.response` in `src/views/**` | — | **new finding: `message`-only reads show `undefined`** |
| B10 | `StudentDashboard.loadDashboardData()` is a no-op (`this.loading = false` only) | `StudentDashboard.vue:113-120` | — | **new finding: dead code** |
| B11 | Axios error interceptor only `console.error`s a 401; it never decrypts the error body | `axios.js:79-85` | F5 | open, cause confirmed |
| B12 | One `https://via.placeholder.com/50` remains (`AdminSidebar.vue:36`) | grep | Phase 6 "avatars" | open (singular) |
| B13 | `dotenv` is a runtime dependency with **zero imports**; `localStorageInterceptor.js` is imported only as a commented line | grep `dotenv`, `localStorageInterceptor` | F9 | open |
| B14 | **No frontend test runner** — no `test` script, no jest/vitest; lint baseline is **0 errors / ~794 prettier warnings** | `package.json`, `npm run lint` | — | **new finding: shapes how "done" is proven** |

### Consequence of B14

There is no `npm test` to lean on. Every task below therefore names its evidence as one of:

- **M** — a browser measurement (`getBoundingClientRect`, `getComputedStyle`, `documentElement.scrollWidth`) via Playwright
- **B** — a `npm run build` artifact size diff
- **G** — a grep proving presence/absence of a string
- **N** — a network trace / real API status code observed in the browser
- **C** — a click-through in the live app

---

## 2. Plan analysis

### 2.1 Well covered (keep as-is)

- F1/F8/F3 and the Phase 5 payload work: verified done above (B2, B3, B4).
- The three-width verification rule and "measure, do not eyeball" — correct, and it already caught the
  1440 screenshot limitation.
- Phasing order (Phase 1 cannot break a view) is sound.
- Non-goals (no IA / route / API-contract change) are the right guardrail — **and they decide Section 3's D1**.

### 2.2 Stale or contradictory (must be fixed before more work)

| ID | Problem | Resolution task |
|----|---------|-----------------|
| A1 | Progress log says "not committed/pushed"; the tree is clean and pushed (B1) | T0.4 |
| A2 | F2 is marked **fixed**, but `dark:` exists in one file (B5) and `[data-theme]` is unreachable (B6) | T2.1 |
| A3 | Phase 2 prescribes `data-theme` tokens while the shipped F2 fix used Tailwind's `class` strategy — the two cannot both be the plan | T2.1 |
| A4 | F6 describes "the dashboard's profile lookup" 404ing; the actual call is `/student/stats` and the error key is `error`, not `message` (B8, B9) | T4.2, T4.3 |

### 2.3 Gaps the plan does not mention

| ID | Gap | Why it matters | Task |
|----|-----|----------------|------|
| A5 | No frontend test runner (B14) | "done" must be defined as measurement, not a green suite | T0.2 |
| A6 | Nobody checked whether `dark:` styling is *wanted* on all 25 views | Phase 2 could balloon into a full re-theme | T2.1 |
| A7 | No baseline artifact (bundle size, lint count, route list) captured before the next change | F1's win cannot be protected from regression | T0.1, T0.3 |
| A8 | Error-key normalisation (`message` vs `error`) is unaddressed | F5 can fix decryption and still show `undefined` (B9) | T4.3 |
| A9 | `loadDashboardData()` no-op and swallowed `console.error`s (B10) | F5/F6 partially unfixable without removing them | T4.2 |
| A10 | Vercel redeploy status unknown | Phase 7 claims a deployed-build check nobody has run | T6.3 |

---

## 3. Tasks

Sizing: **S** ≤ 30 min · **M** ≈ 1 h · **L** ≈ 2 h. `→` = depends on. Evidence codes from §1.

### T0 — Baseline harness (do first; everything else compares against it)

| ID | Task | Size | → | Evidence / done-when |
|----|------|------|---|----------------------|
| T0.1 | Capture baseline: `npm run build`, record `dist/css/*.css` and `dist/js/*.js` raw + gzip bytes into `UI-UX-BASELINE.md` | S | — | B: file exists with numbers |
| T0.2 | Capture lint baseline: `npm run lint`, record error/warning counts | S | — | G: recorded (expect 0 errors / ~794 warnings) |
| T0.3 | Capture route inventory from `src/router/index.js` (path → component → needs-auth) as a smoke matrix | M | — | G: matrix in `UI-UX-BASELINE.md` |
| T0.4 | Correct the plan: mark commit/push done, note the Vercel redeploy as the only open deploy step | S | — | G: `UI-UX-PLAN.md` §0 no longer says "not committed" |
| T0.5 | Verify local loop is fast: compose up, `POST /api/login` round trip against `localhost:8000` | S | — | N: login response < 1 s, no cold start |
| T0.6 | Confirm a fresh account reproduces the two empty-state bugs (register → `/student/scores`, `/student/dashboard`) | M | T0.5 | N: 404 on `/student/scores`, and 404 `{"error":"Student not found"}` on `/student/stats` |

### T1 — F1/F8 regression guard (Phase 5 leftovers)

| ID | Task | Size | → | Evidence |
|----|------|------|---|----------|
| T1.1 | Re-run the purge sample check: every class used in `src/**` that Tailwind 2 must emit is present in built CSS; a known-unused class is absent | M | T0.1 | B/G: `grid-cols-3` absent, `min-h-screen` present |
| T1.2 | Add a size budget to `UI-UX-BASELINE.md` (CSS < 60 KB raw, < 12 KB gzip) so a CDN or a purge regression fails loudly | S | T0.1 | G: budget written + current numbers under it |
| T1.3 | Grep the **built** output for `jsdelivr`, `cdn.`, `via.placeholder`, `fonts.googleapis` to catch any third-party runtime fetch | S | T0.1 | G: only `via.placeholder` found, which T6.1 removes |

### T2 — Dark mode, for real (Phase 2)

| ID | Task | Size | → | Evidence |
|----|------|------|---|----------|
| T2.1 | **Decision task.** Choose one mechanism and write it into the plan: (a) keep Tailwind `darkMode: "class"` and add `dark:` utilities per view over time, or (b) switch to `data-theme` tokens in `app.css` and drop `dark:` entirely. Record scope: which views dark mode must cover for this milestone | M | — | G: plan §Phase 2 states one mechanism + the view list |
| T2.2 | If (b): set `data-theme` on `<html>` at bootstrap from `localStorage.darkMode` + `prefers-color-scheme`, and make `HomeComponent` write both `data-theme` and the legacy key | M | T2.1 | M: `document.documentElement.dataset.theme` flips, reload keeps it |
| T2.3 | If (b): delete or wire up the unreachable `[data-theme="dark"]` block (B6) so no dead CSS ships | S | T2.2 | G: block reachable, or removed |
| T2.4 | Replace the `<div @click>` toggle with `<button type="button" :aria-pressed="darkMode" aria-label="Toggle dark mode">`, keyboard-operable | S | — | M: `Space`/`Enter` toggle it; `aria-pressed` flips; focus ring visible |
| T2.5 | Contrast check on the dark surface for every view in T2.1's scope (token values, not vibes) | M | T2.2 | M: computed foreground/background pairs recorded |
| T2.6 | Respect `prefers-color-scheme` on first visit only (no stored choice) | S | T2.2 | M: emulated dark scheme → dark on first load; stored `"false"` wins after |

### T3 — Phase 3 close-out / F7

| ID | Task | Size | → | Evidence |
|----|------|------|---|----------|
| T3.1 | Verify B3/B4 still hold after every later edit (lang, no stray viewport, autocomplete) | S | — | G: grep clean |
| T3.2 | Audit focus visibility on every interactive control (auth forms, primary buttons, sidebar links) — add `:focus-visible` where missing | M | — | M: each control measured with `getComputedStyle(…, ':focus-visible').outlineWidth` |
| T3.3 | Regression-measure the login/register seals: zero intersections with inputs/buttons/headings/links at 390/768/1440 | M | — | M: `getBoundingClientRect` intersection list empty |

### T4 — Phase 4: error, missing-profile and loading states

| ID | Task | Size | → | Evidence |
|----|------|------|---|----------|
| T4.1 | Decrypt error bodies in `axios.js` (same key/algorithm as the success path), keeping the raw value if decryption fails | M | — | N: 401 body readable as `{message: "Invalid credentials"}` |
| T4.2 | Distinguish network failure (no `error.response`) from rejected credentials; surface the right sentence in `LoginComponent` | S | T4.1 | C: API stopped → "can't reach the server"; wrong password → "Invalid credentials" |
| T4.3 | Normalise error-key reads: `data.message ?? data.error ?? fallback` — the students 404 uses `error` (B9) | S | T4.1 | G: shared helper used; N: 404 renders its real text |
| T4.4 | `StudentDashboard`: on 404 from `/student/stats`, render a "your profile is not set up yet" panel instead of zeros | M | T4.3 | C: fresh account shows the panel; seeded account shows numbers |
| T4.5 | `StudentDashboard`: delete the `loadDashboardData()` no-op (B10); give `loadStatsData()` real loading/error states instead of `console.error` only | S | T4.4 | G: no-op gone; C: spinner → data / error alert |
| T4.6 | `RegisterComponent`: same error treatment as login | S | T4.2 | C: duplicate email and network-down both explain themselves |
| T4.7 | Decide and document F6's fix side: frontend panel (T4.4) **or** backend creating a `students` row on register. Non-goal says no API-contract change → frontend unless the user overrides | S | — | G: decision recorded in plan |
| T4.8 | Inventory which views have loading/empty/error states and which silently blank | M | — | G: table in `UI-UX-BASELINE.md` |
| T4.9 | Add `.spinner` / `.empty-state` / `.alert-error` to the views T4.8 flags — **one task per view**, starting with the student list/tasks/scores trio | M each | T4.8 | C/M: each view shows a state, no blank panel |

### T5 — Phase 6 polish

| ID | Task | Size | → | Evidence |
|----|------|------|---|----------|
| T5.1 | Replace `via.placeholder.com/50` in `AdminSidebar.vue` with inline initials | S | — | G: no third-party avatar URL; M: same box size, no layout shift |
| T5.2 | Unify page headers/padding/card radii across the admin layout | M | — | M: same padding rhythm + radius tokens on each page |
| T5.3 | Same for the teacher layout | M | T5.2 | M: as above |
| T5.4 | Same for the student layout | M | T5.2 | M: as above |
| T5.5 | Remove `dotenv` from dependencies, reinstall, rebuild | S | T0.1 | G: gone from `package.json`; B: build succeeds |
| T5.6 | Delete `src/localStorageInterceptor.js` and the stale comment in `main.js` | S | — | G: file gone, zero references |
| T5.7 | Confirm the token flow still works after T5.6 (login → authenticated request) | S | T5.6 | C: `/student/stats` returns 200, not 401 |

### T6 — Phase 7 verification pass

| ID | Task | Size | → | Evidence |
|----|------|------|---|----------|
| T6.1 | Functional pass over the T0.3 matrix: login, register, each dashboard, each list, each empty state | L | all T1–T5 | C: every row pass/fail recorded |
| T6.2 | Visual pass at 1440×900 / 768×1024 / 390×844; judge 1440 by measurement, not screenshot | M | T6.1 | M: `scrollWidth` == viewport, no overlap |
| T6.3 | Check the deployed Vercel build still works and that `VUE_APP_API_BASE_URL` is the only endpoint switch (grep for hardcoded hosts) | M | T6.1 | G: no hardcoded Render/API host in `src/**`; C: deployed login works |
| T6.4 | Update `UI-UX-PLAN.md` §0 with verified results, fix A1–A4, and close the browser pages / delete temp files | S | T6.1 | G: plan matches the tree |

---

## 4. Coverage check

Every finding and every phase maps to at least one task, and every task has a named evidence type.

| Plan item | Covered by |
|-----------|-----------|
| F1 (CDN Tailwind) | T0.1, T1.1, T1.2, T1.3 |
| F2 (dark mode) | T2.1–T2.6 (+ plan correction T0.4) |
| F3 (logo overlap) | T3.3 |
| F4 (blank scores) | T0.6, T4.8, T4.9 |
| F5 (opaque login errors) | T4.1, T4.2, T4.3, T4.6 |
| F6 (broken dashboard) | T0.6, T4.4, T4.5, T4.7 |
| F7 (markup/a11y) | T2.4, T3.1, T3.2 |
| F8 (no stylesheet) | T1.1, T1.2 (verified present) |
| F9 (dead code) | T5.5, T5.6, T5.7 |
| Phase 0 (local speed) | T0.5 |
| Phase 1 (tokens) | present in `app.css`; T1.2 guards the build, T2.3 removes the dead block |
| Phase 2 (dark mode) | T2.1–T2.6 |
| Phase 3 (verified defects) | T2.4, T3.1, T3.2, T3.3 |
| Phase 4 (states) | T4.1–T4.9 |
| Phase 5 (purged Tailwind) | T0.1, T1.1, T1.2, T1.3 |
| Phase 6 (polish) | T5.1–T5.7 |
| Phase 7 (verification) | T0.1–T0.3, T6.1–T6.4 |
| Plan's own accuracy | T0.4, T2.1, T4.7, T6.4 |

No finding or phase is left without an owner task; tasks A1–A10 from §2 are all mapped (A1→T0.4, A2/A3→T2.1,
A4→T4.2/T4.3, A5→T0.2, A6→T2.1, A7→T0.1/T0.3, A8→T4.3, A9→T4.5, A10→T6.3).

## 5. Suggested order

T0 (all) → T2.1 (unblocks dark mode) → T4.1–T4.7 (user-visible bugs) → T3 → T2.2–T2.6 → T4.8–T4.9 →
T5 → T1 recurring → T6. T1/T3.1 run again after any change that touches the build or auth markup.
