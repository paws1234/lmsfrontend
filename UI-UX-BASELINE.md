# Baseline artifacts — CTU LMS frontend

Numbers captured **before** any UI/UX change, so later work can be checked against them instead of
against memory. Every entry names the command that produced it.

Captured: 2026-09-13 · HEAD `8049da6` ("create tasks") · working tree clean.

---

## T0.1 — Production build size

### How to reproduce

`node_modules/` on the host is an **empty directory** (the real dependencies live in the Docker named
volume `lmsfrontend_frontend_node_modules`), so the build must run in the container:

```
docker compose run --rm --no-deps frontend npm run build
```

That runs as root (the image does), which leaves `dist/` root-owned. Hand it back afterwards:

```
docker run --rm -v "$PWD:/app" -w /app -u 0:0 lms-frontend:dev \
  chown -R "$(id -u):$(id -g)" /app/dist
```

Running the build as the host uid instead of root **fails** with
`EACCES: permission denied, open '/app/node_modules/.cache/babel-loader/<hash>.json'` — the
`node_modules` volume is root-owned, so a non-root process cannot create the `.cache` directory
inside it. (Removing the cache does not help: the parent is not writable either.)

`dist/` is gitignored, so building never shows up in `git status`.

### Numbers

Raw bytes are `stat -c %s`; gzip is `gzip -9 -c <file> | wc -c` (level 9, includes the gzip header).
Webpack prints its own gzip figures, which differ slightly — 19 B **larger** than `gzip -9` for the
CSS, 349 B and 133 B **smaller** for the two JS bundles. Neither is "the" number; compare like with
like, and prefer the `gzip -9` column because it is reproducible from the command above.

| Asset | Raw bytes | Raw KiB | gzip -9 bytes | gzip -9 KiB | webpack gzipped |
|-------|-----------|---------|---------------|-------------|-----------------|
| `dist/css/app.de92d8d9.css` | 31 108 | 30.38 | 6 900 | 6.74 | 6.72 KiB |
| `dist/js/app.375724fe.js` | 140 102 | 136.82 | 27 207 | 26.57 | 26.91 KiB |
| `dist/js/chunk-vendors.eecbba7b.js` | 197 811 | 193.17 | 74 168 | 72.43 | 72.56 KiB |
| **all CSS** | **31 108** | 30.38 | **6 883** | 6.72 | — |
| **all JS (excl. maps)** | **337 913** | 330.00 | **101 273** | 98.90 | — |

Build hash `ad1d40c892904497`, 9 329 ms, 2026-09-13T13:06:22Z.

Non-CSS/JS output, for completeness: `index.html` (685 B), `logo.ico`, `test.jpg` (234 KiB),
`ts2.png` (608 KiB), `img/clogo.2b8ba9a4.jpg`. Source maps (`.map`) are emitted but excluded above.

### Build warnings (baseline: "Compiled with 4 warnings")

The build lints as it compiles, so the four warnings are:

1. **`[eslint]` — 859 problems, 0 errors, 859 warnings**; 784 of them auto-fixable. This is the
   `lintOnSave` pass over the files webpack compiles. It is the same shape as the `npm run lint`
   baseline (B14: "0 errors / ~794 warnings") — the count differs because webpack only lints what it
   compiles, so T0.2's figure is the one to quote.
2. **Asset size limit**: `img/clogo.2b8ba9a4.jpg` (558 KiB) and `ts2.png` (608 KiB) each exceed the
   recommended 244 KiB. Both are static images in `public/`, shipped as-is.
3. **Entrypoint size limit**: `app` is **360 KiB** combined (`chunk-vendors` + `app.css` + `app.js`),
   above the recommended 244 KiB.
4. **webpack performance recommendations** — the generic hint emitted alongside 3.

The 360 KiB entrypoint figure is the one to watch: a CDN Tailwind or a purge regression shows up there
long before anyone notices it visually. Items 2 and 3 are consequences of asset weight, not of code.

Raw log for this run: `/tmp/f0-build.log`.

### Size budget (T1.2 — recorded early because the numbers are at hand)

| Asset | Budget (raw) | Budget (gzip) | Now |
|-------|--------------|---------------|-----|
| CSS total | < 60 KB | < 12 KB | 30.38 KB / 6.72 KB ✅ |
| JS total | — (not budgeted yet) | — | 330.00 KB / 98.90 KB |

CSS has ~2× headroom. That headroom is the point: F1's win is only protected if a regression crosses
the line and says so.

---

## T0.2 — Lint baseline

```
docker compose run --rm --no-deps frontend npx vue-cli-service lint --no-fix
```

**`--no-fix` is mandatory.** `vue-cli-service lint` fixes by default: without the flag this command
rewrites every auto-fixable warning (784 of them) and produces a diff touching most of the codebase.
Confirmed after the run: `git status --short` showed only the new `UI-UX-BASELINE.md`, no source file
modified.

### Result: 792 problems — **0 errors**, **792 warnings**

Exit code 0. Breakdown by rule:

| Rule | Count | Fixable by `--fix`? |
|------|-------|---------------------|
| `prettier/prettier` | 722 | yes |
| `vue/first-attribute-linebreak` | 44 | yes |
| `vue/attributes-order` | 25 | yes |
| `vue/no-template-shadow` | 1 | no (needs a manual rename) |
| **total** | **792** | 784 fixable |

29 files carry warnings. Worst offenders: `views/student/StudentTasks.vue` (148),
`views/admin/AdminDashboard.vue` (122), `views/student/StudentList.vue` (65),
`views/teacher/QuestionForm.vue` (60), `views/student/StudentLayout.vue` (60).

**Correction to B14.** The tasks file says "~794 prettier warnings". The real shape is **792 total
warnings, of which 722 are prettier**; the other 70 are Vue template-order rules. The "794" figure
was close on the total but mis-attributed the rules — worth knowing before anyone runs `--fix` and
expects the count to drop to ~70.

### Why the build reports 859 and this reports 792

Both are correct; they measure different things.

- `npm run lint` lints **every** file in `src/` and `tests/` → 792.
- The production build lints **as it compiles** → 859, but over a different set, and with
  `NODE_ENV=production`. That env var matters: `.eslintrc.js` sets
  `"no-console": process.env.NODE_ENV === "production" ? "warn" : "off"`, so the 2 `no-console`
  warnings visible in the build **cannot appear** in a plain `npm run lint` (verified: `grep -c
  no-console` on the lint log → 0).

Quoting one number for the other would be wrong in either direction. For regression checks, use
**792 / 0 errors** from `npm run lint --no-fix`.

### Config note

`.eslintrc.js` is the config that actually applies — it declares `root: true` and extends
`plugin:vue/vue3-recommended` + `@vue/prettier`. `package.json` also carries an `eslintConfig` block
extending `plugin:vue/vue3-essential`, which is **not** in effect.

That is provable from the output rather than from config-resolution rules: the run emits
`vue/attributes-order` (25) and `vue/first-attribute-linebreak` (44), and neither rule exists in the
`essential` tier — both come from the stronger tiers that only `vue3-recommended` enables. If the
`package.json` block were being used, the total would be roughly 70 warnings lower.

So that stale `eslintConfig` block is dead configuration. Left alone here (removing it is a
one-line change with zero behavioural effect); flagged so nobody "fixes" lint output by editing the
wrong file.

---

## T0.3 — Route inventory (smoke matrix)

Source: `src/router/index.js`. **32 leaf routes** across 6 top-level records: 3 single-page routes
(`/`, `/login`, `/register`) and 3 layout parents holding 14 admin, 11 teacher and 4 student children.

### The auth model — read this before using the matrix

There is **no auth enforcement in the router**. Verified by grep over `src/`:
`beforeEach`, `beforeEnter`, `requiresAuth` and `meta:` → **zero matches**. So "needs-auth" below is
*nominal* (which layout owns it), not enforced.

What actually gates anything:

1. `checkAccess()` — a per-view method that reads `localStorage.getItem("token")` in `mounted()` and
   pushes to `/login` if absent. **Only 2 of 38 views define it**: `StudentDashboard.vue` and
   `TeacherDashboard.vue`. Every other route renders unauthenticated; the redirect only follows a
   failing API call.
2. Per-view `catch` blocks that push to `/login` on error (e.g. `TeacherDashboard` on
   `/teacher/dashboard` and `/teacher/stats`).
3. The axios request interceptor attaches `Authorization: Bearer …` when a token exists.

Consequences worth keeping in mind for T6.1: `/admin/**` has **no client-side gate at all**; a
protected page can flash before its redirect; and `checkAccess()` runs *after* mount, so it is a
UX check, not a security boundary.

### Matrix

`Auth gate` = what the frontend does; `T6.1` is left blank for the verification pass.

| # | Path | Name | Component | Auth gate | T6.1 |
|---|------|------|-----------|-----------|------|
| 1 | `/` | Home | `HomeComponent.vue` | public | |
| 2 | `/login` | Login | `LoginComponent.vue` | public | |
| 3 | `/register` | Register | `RegisterComponent.vue` | public | |
| 4 | `/admin/dashboard` | AdminDashboard | `admin/AdminDashboard.vue` | **none** | |
| 5 | `/admin/students` | StudentList | `admin/StudentList.vue` | **none** | |
| 6 | `/admin/students/create` | StudentCreate | `admin/StudentForm.vue` | **none** | |
| 7 | `/admin/students/:id` | StudentShow | `admin/StudentForm.vue` | **none** | |
| 8 | `/admin/students/:id/edit` | StudentEdit | `admin/StudentForm.vue` | **none** | |
| 9 | `/admin/teachers` | TeacherList | `admin/TeacherList.vue` | **none** | |
| 10 | `/admin/teachers/create` | TeacherCreate | `admin/TeacherForm.vue` | **none** | |
| 11 | `/admin/teachers/:id` | TeacherShow | `admin/TeacherUpdate.vue` | **none** | |
| 12 | `/admin/teachers/:id/edit` | TeacherEdit | `admin/TeacherForm.vue` | **none** | |
| 13 | `/admin/courses` | CourseList | `admin/CourseList.vue` | **none** | |
| 14 | `/admin/courses/create` | CourseCreate | `admin/CourseCreate.vue` | **none** | |
| 15 | `/admin/courses/:id/edit` | CourseEdit | `admin/CourseEdit.vue` | **none** | |
| 16 | `/admin/schedules` | ScheduleManager | `admin/ScheduleManager.vue` | **none** | |
| 17 | `/admin/event-handlers` | EventHandlerManager | `admin/EventHandlerManager.vue` | **none** | |
| 18 | `/teacher/dashboard` | TeacherDashboard | `teacher/TeacherDashboard.vue` | `checkAccess()` | |
| 19 | `/teacher/subjects` | SubjectList | `teacher/SubjectList.vue` | redirect on 401 | |
| 20 | `/teacher/subjects/create` | SubjectCreate | `teacher/SubjectCreate.vue` | redirect on 401 | |
| 21 | `/teacher/subjects/:id/edit` | SubjectEdit | `teacher/SubjectEdit.vue` | redirect on 401 | |
| 22 | `/teacher/enrollments` | EnrollmentList | `teacher/EnrollmentList.vue` | redirect on 401 | |
| 23 | `/teacher/enrollments/create` | EnrollmentCreate | `teacher/EnrollmentForm.vue` | redirect on 401 | |
| 24 | `/teacher/todos` | TodoList | `teacher/TodoList.vue` | redirect on 401 | |
| 25 | `/teacher/todos/create` | TodoCreate | `teacher/TodoCreate.vue` | redirect on 401 | |
| 26 | `/teacher/todos/:id/edit` | TodoEdit | `teacher/TodoEdit.vue` | redirect on 401 | |
| 27 | `/teacher/questions/create` | QuestionCreate | `teacher/QuestionForm.vue` | redirect on 401 | |
| 28 | `/teacher/questions/list` | QuestionList | `teacher/QuestionList.vue` | redirect on 401 | |
| 29 | `/student/dashboard` | StudentDashboard | `student/StudentDashboard.vue` | `checkAccess()` | |
| 30 | `/student/tasks` | StudentTasks | `student/StudentTasks.vue` | redirect on 401 | |
| 31 | `/student/scores` | StudentScores | `student/StudentScores.vue` | redirect on 401 | |
| 32 | `/student/studentlists` | StudentListS | `student/StudentList.vue` | redirect on 401 | |

Note the **duplicate-basename** pair: `admin/StudentList.vue` and `student/StudentList.vue` are
different components on different paths, distinguished only by the route name `StudentList` vs
`StudentListS`. Same with `teacher/QuestionList.vue` / `student/QuestionList.vue` (see below). Any
grep by component name hits both — easy to edit the wrong one.

Also: `/admin/teachers/:id` (`TeacherShow`) maps to `TeacherUpdate.vue`, not `TeacherForm.vue`, while
`/admin/teachers/:id/edit` maps to `TeacherForm.vue` — the show/edit pairing is inverted relative to
every other resource here.

### Views that no route reaches

Of 38 `.vue` files under `src/views/`:

- **`student/QuestionList.vue` — orphaned.** Nothing imports it (`grep -rn "student/QuestionList"
  src/` → no match). The routed `QuestionList` is `teacher/QuestionList.vue`. This is the same class
  of dead code as F9 (`dotenv`, `localStorageInterceptor.js`) — see T5.5/T5.6.
- `LoadingSpinner.vue` — imported only by `LoginComponent.vue`.
- `ModalPopup.vue` — imported by `admin/TeacherList.vue` and `admin/StudentList.vue`.
- `admin/AdminSidebar.vue`, `teacher/TeacherSidebar.vue`, `student/StudentSidebar.vue` — layout
  children, not routes (correct).

### Byproduct worth noting for F5/T4

`TeacherDashboard.logout()` does `console.error("Logout error:", error.response.data.message)` with no
optional chaining. With no `error.response` (server down) that line throws inside the `catch` — the
same `message`-only assumption as B9, and it is in the logout path, so a network blip there surfaces
as an unhandled TypeError rather than a message.

---

## T0.4 — Plan corrections

Done. `UI-UX-PLAN.md` §0 no longer claims committing/pushing is outstanding:
`HEAD` = `origin/main` = `8049da6`, `git rev-list --left-right --count origin/main...HEAD` = `0 0`, and
the tracked tree is clean (only `UI-UX-BASELINE.md` is untracked). The Vercel redeploy is recorded as
the single remaining deploy step, to be settled in T6.3.

---

## T0.5 — Local iteration loop (Supabase backend confirmed intentional)

`POST /api/login` against `localhost:8000`, measured from the host:

| Request | Status | Time |
|---------|--------|------|
| bogus login, attempt 1 | 401 | 1.384 s |
| bogus login, attempt 2 | 401 | 2.325 s |
| bogus login, attempt 3 | 401 | 1.015 s |
| `POST /api/register` | 201 | 2.635 s |
| valid `POST /api/login` | 200 | 1.200 s |

The target was **"login response < 1 s, no cold start"**. Nothing came in under 1 s; a valid login
took 1.20 s and register 2.64 s.

**There is no cold-start signature** — attempt 1 (1.384 s) is not the slowest, and it is slower than
attempt 3. So the plan's "no ~40 s cold starts" goal is met; what remains is a floor of roughly 1–2.3 s
on every request.

### Why it is not the local `db` container — and why that is fine

The API is **not** talking to the local `db` container. `backend/lmsbackend/.env:32` holds an active:

```
DATABASE_URL=postgresql://postgres.<ref>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

Every request therefore crosses to a Supabase pooler in `ap-northeast-1`. Independent proof beyond
reading the config: the probe user registers and logs in successfully (HTTP 201 / 200), yet

```
select count(*) from users where email = 'baseline-…@example.com';   -- in the LOCAL db container
→ 0
```

so the row that login just matched does not exist in the local database.

### Status: accepted configuration, not a defect

**Confirmed by the owner 2026-09-13: running against Supabase is normal and intended.** So the ~1–2.3 s
floor is the cost of the chosen backend, not something to fix, and the `< 1 s` figure in the task
brief should be read as "no cold start", which is the property that actually matters and which does
hold. Nothing here is blocking.

The one thing that does follow: **every browser measurement in this plan inherits that latency.** Any
UI state that is judged by how quickly it appears will look ~1–2.3 s slower than it is on a warm local
database, so states must be judged on *what* renders rather than on timing.

For the record, if a genuinely local database is ever wanted, it is one commented-out line plus a
recreate (`docker compose up -d --no-deps --force-recreate backend` with `.env:32` disabled) — but it
changes which data the app displays, so it is not a casual switch.

---

## T0.6 — Fresh-account reproduction (premise half stale)

Method: `POST /api/register` → `POST /api/login` against the real API (request bodies are base64 of
JSON; the encrypted replies were decrypted with `node:crypto`, AES-256-CBC against the same key
`src/axios.js` uses), then the token was placed in `localStorage` and both views were read in the
browser at `localhost:8080`.

### API level — fresh `student` account, no `students` row

| Request | Status | Decrypted body |
|---------|--------|----------------|
| `GET /api/student/scores` | **404** | `{"message":"Student not found"}` |
| `GET /api/student/stats` | **404** | `{"error":"Student not found"}` |

Register creates no `students` row — confirmed by query. **The two 404s use different keys**:
`ScoreController::index()` returns `message`, `StudentDashboardController::index()` returns `error`.
That is B9/A8 confirmed with the exact mechanism and both call sites.

### Rendered baseline (browser, logged in as that fresh account)

- `/student/dashboard` — **bug reproduces.** Renders "Subjects Offered **0**", "Tasks Given **0**",
  "No events scheduled.", "No schedules available." Silent zeros; the 404 appears only as
  `Error fetching stats: AxiosError` in the console. This is F6 / T4.4's starting state.
- `/student/scores` — **does *not* reproduce the blank page.** F4's fix is live: it renders the empty
  state "Your Scores / No scores yet / They appear once your teacher publishes results."

So T0.6 as written is half stale: only the dashboard still silently shows zeros. The defect left on
the scores page is the *wording* — it says "no scores yet" when the actual cause is "no student
profile", which is precisely the condition the dashboard fails to explain. Both are
"missing-profile" states wearing a "no data" costume.

### Correction to the plan's F4 note

The plan says the 404 body "cannot be read to tell 'no submissions' from 'no student row' —
`EncryptResponse` encrypts the 404 too". Only the *first half* is about encryption. The body is
unreadable today because the **error** path never decrypts (B11) — the success path already does.
So T4.1 alone would make these bodies readable; but because the two keys differ, **T4.3's
normalisation must land with it**, or one of the two still resolves to `undefined`.

---

## T2.1 — Dark-mode mechanism decided

**Decision: one switch — a `dark` class on `<html>` — driving both the token layer and Tailwind's
`dark:` variant.** Milestone scope: the shell plus the three entry pages, **9 views**
(`HomeComponent`, `LoginComponent`, `RegisterComponent`, the 3 layouts and their 3 sidebars).
Recorded with the evidence table in `UI-UX-PLAN.md` §Phase 2. The user was unavailable, so this was
decided autonomously; the reasoning is written down so it can be reversed cheaply.

### Corrections to the tasks file

- **B6 is wrong.** It says `app.css` defines `[data-theme="dark"]` tokens but "nothing ever sets
  `data-theme`" → dead code. The selector is `[data-theme="dark"], .dark`, so the `.dark` half is
  reached on every toggle. Measured: false → true, body `rgb(244,246,249)` → `rgb(22,32,44)`, text
  `rgb(18,41,74)` → `rgb(232,238,246)`, and it persists across a reload.
- **A2/A3 are wrong.** "The two cannot both be the plan" — they already coexist, sharing one switch.
  Tailwind's `darkMode: "class"` and the token block both read `html.dark`. F2 was not half-done; it
  was simply never *applied* outside one route.
- **Consequence for T2.3:** the unreachable thing is the `[data-theme="dark"],` *selector*, not a
  feature waiting to be wired up. T2.3 becomes "delete the attribute half", not "start setting it".

### The actual defect

`documentElement.classList` is written in exactly **two** places in `src/`, both in
`HomeComponent.vue` (lines 106 and 112), and `darkMode` has **no references outside that file**.
Measured consequence for a user with `localStorage.darkMode = "true"`:

| Route | `html.class` | Body background |
|-------|--------------|-----------------|
| `/` | `dark` | `rgb(22,32,44)` ✅ |
| `/login` | *(empty)* | `rgb(244,246,249)` ❌ |
| `/student/dashboard` | *(empty)* | `rgb(244,246,249)` ❌ |

Dark mode is a property of one page, not of the application. **T2.2 (apply at bootstrap) is therefore
a prerequisite, not a follow-up** — no mechanism choice can fix dark mode while a single component
owns the switch.

### Why not the alternatives

- **Option A (Tailwind `dark:` only)** — deletes a working, measured mechanism to gain nothing, and
  forfeits the free coverage that token-based components already give.
- **Option B (tokens only)** — requires rewriting colour utilities across 32 of 38 views, since only
  **1** view currently uses the token component classes. That is the largest diff in the plan and the
  one most likely to be left half-done; the plan's own risk section favours localised change.
- **Option C (chosen)** — costs nothing, reverts nothing, and keeps both escape hatches open for
  later per-view work.

### Left open for the owner

The only dark-mode control lives on `HomeComponent`. Under this scope an authenticated user in dark
mode must return to the home page to switch back. A toggle in the shell sidebars is new UI that the
plan does not authorise, so it is flagged rather than assumed.

---

## T4.1–T4.5 — Error, missing-profile and loading states

### What changed

| Task | Change |
|------|--------|
| T4.1 | `src/axios.js` — decryption extracted into `decryptPayload()` and now applied on the **error** path as well. It returns `undefined` as the failure sentinel, not `null`, so a payload that legitimately decodes to JSON `null` stays distinguishable from a failure. On failure the raw body is left untouched. The success path keeps its existing reject-on-failure behaviour. |
| T4.2 | `LoginComponent.vue` — rejected credentials and an unreachable server now produce different sentences, via the shared helper. |
| T4.3 | New `src/apiError.js` — `apiErrorMessage(error, fallback)` reads `data.message \|\| data.error`, and returns a network-specific sentence when `error.response` is absent entirely. Only object bodies are trusted: a string body is an unencrypted response, an HTML error page, or ciphertext, and none of those is a message to show a user. |
| T4.4 | `StudentDashboard.vue` — a 404 from `/student/stats` renders a "Your profile is not set up yet" panel instead of zeros. The Schedule card is hidden in that state (and while loading), so exactly one state is on screen — the same rule F4 applied to the scores view. |
| T4.5 | `StudentDashboard.vue` — `loadDashboardData()` deleted; `loadStatsData()` now owns the `loading` flag via `finally` and has explicit `profileMissing` / `loadError` states. The swallowed `console.error` is gone. |

**Extra fix found while doing the above.** `TeacherDashboard.logout()` read `error.response.data.message`
with **no optional chaining**, so an unreachable server threw from *inside its own catch block* — the
token was never cleared and the user was never redirected. It now goes through the helper.

### Evidence

T4.1 + T4.2, in the browser against the real API:

| Action | Rendered |
|--------|----------|
| wrong password | `Invalid credentials` |
| server unreachable (request aborted) | `We can't reach the server. Please check your connection and try again.` |

Before T4.1 the 401 body was ciphertext, so the first row could only ever have shown the generic
fallback. The console now logs `data: Object` — a decrypted body.

T4.3 — all seven branches run against the real `src/apiError.js` (no test runner exists, so the module
is evaluated directly and each branch asserted):

| Input | Result |
|-------|--------|
| `{error:"Student not found"}` | `Student not found` |
| `{message:"Invalid credentials"}` | `Invalid credentials` |
| `{message:"", error:"From error"}` | `From error` |
| string body (ciphertext / HTML) | fallback |
| `{foo:1}` | fallback |
| no `response` at all | network sentence |
| `undefined` | network sentence |

T4.4 — both paths, using real accounts:

| Account | Rendered |
|---------|----------|
| registered, **no** `students` row | `Your profile is not set up yet …` and **no** Schedule card |
| registered **with** a `students` row | `Subjects Offered 0 / Tasks Given 0` + the Upcoming Events entry + the Schedule card |

The second row is the regression check that matters: the happy path still renders real data.

T4.5 — the non-404 branch, with `/student/stats` stubbed to HTTP 500 carrying `{"error":"internal"}`:
the alert renders **`internal`**. That is the API's own text, read from the `error` key rather than
`message` — T4.3's normalisation proven through the real UI, not by inspection.

### Regression checks after the change

- **Lint 791 warnings / 0 errors** (baseline was 792). Per file: `axios.js` 16→15,
  `LoginComponent.vue` 6→5, `StudentDashboard.vue` 32→31, new `apiError.js` **0**,
  `TeacherDashboard.vue` unchanged at 39. Three Prettier trailing-comma warnings introduced while
  writing the new calls were fixed rather than left in.
- **`npm run build` succeeds**, still "Compiled with 4 warnings". CSS **31 135 B raw / 6 904 B gzip**
  (was 31 108 / 6 900) — inside the 60 KB / 12 KB budget. `app.js` 140 102 → 141 304 B;
  `chunk-vendors` unchanged at 197 811 B.
- All test accounts deleted from the remote database afterwards: 2 users, 2 Sanctum tokens. The
  `students` row went with its user via `ON DELETE CASCADE`, so nothing was left behind.

---

## T4.6 — Register form

`RegisterComponent.vue`'s catch block did nothing but `console.error(error)`, so a duplicate email or
an unreachable server left the form completely silent — the button appeared to do nothing at all. It
now carries an `errorMessage` state, rendered as `class="alert alert-error"` and filled by the shared
helper.

Verified in the browser:

| Action | Rendered |
|--------|----------|
| registered an email that already exists | `The email has already been taken.` |
| register request aborted | `We can't reach the server. Please check your connection and try again.` |

The first row is a 422 whose body carries Laravel's validation message — previously invisible to the
user. (**Not** verified: the `< 8` character password case, which produces the same 422 shape.)

## T4.7 — F6 fix side decided

**Frontend, not the API.** `POST /api/register` writes a `users` row and no `students` row. Having the
backend create the `students` row as well was rejected: it changes what a registration means and how
the API behaves, which §3 rules out ("no change to … the API contract"). Recorded in the plan's
Phase 4.

What the decision does **not** settle, and should not be read as settling: registration still produces
an account that cannot use the student area until an administrator enrols it. The panel makes that
legible; it does not make the account usable. If self-provisioning is the intended behaviour, that is a
backend change and needs an explicit override of §3.

## Regression state after T4.1–T4.7

- Lint **791 warnings / 0 errors** — one better than the 792 baseline. `RegisterComponent.vue`
  unchanged at its 1 pre-existing warning; `StudentDashboard.vue` 32 → 31.
- `npm run build` succeeds, still 4 warnings. CSS **31 135 B raw / 6 904 B gzip**, inside the budget.
- **Watch out:** an external reformat of `StudentDashboard.vue` collapsed the Schedule `v-if` onto two
  lines and added **3** lint warnings (791 → 794). Restoring the multi-line attribute form the file
  already used brought it back to 791. If an editor is formatting on save in this workspace, it is not
  using the project's Prettier settings.
