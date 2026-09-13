# CTU LMS — Frontend (Vue 3)

The single-page app for **CTU LMS**, the school management system for CTU (Cebu
Technological University). One bundle serves three role-based areas — admin,
teacher and student — and talks to the Laravel API in its own repository
(<https://github.com/paws1234/lmsbackend>).

| | |
| --- | --- |
| Framework | Vue 3 (`^3.2`) with Vue Router 4 — no store library |
| Build | Vue CLI 5 (webpack) on Node 22 |
| Styling | Tailwind CSS 2.2, built and purged locally, on top of design tokens in `src/assets/styles/app.css` |
| HTTP | axios instance in `src/axios.js` (encrypted payloads, bearer token) |
| Uploads | Cloudinary, unsigned preset, straight from the browser |
| Lint | ESLint (`vue3-recommended` + Prettier) |

The API runs as a **separate compose project**: this container only serves the
app, and the *browser* is what calls the API. Nothing is shared between the two
stacks except the host's ports.

## Routes

| Area | Path | Views |
| --- | --- | --- |
| Public | `/`, `/login`, `/register` | Home, Login, Register |
| Admin | `/admin/**` | dashboard, students, teachers, courses, schedules, events |
| Teacher | `/teacher/**` | dashboard, subjects, enrolments, todos, questions |
| Student | `/student/**` | dashboard, tasks, scores, classmates |

32 leaf routes in `src/router/index.js`, each area under its own layout
(`AdminLayout`, `TeacherLayout`, `StudentLayout`).

**There is no client-side route guard.** Only `StudentDashboard` and
`TeacherDashboard` call a `checkAccess()` that redirects to `/login` when
`localStorage.token` is missing, and `/admin/**` has none at all. This is not a
security boundary — every endpoint is protected server-side by
`auth:sanctum` + `role:` middleware, so a wrong-role visitor sees a rendered
shell whose API calls all answer `403`.

## Getting started

### Docker

```bash
docker compose up -d --build
```

Open <http://localhost:8080>. Start the API first if you want to log in.
[DOCKER.md](DOCKER.md) covers configuration, the command reference and
troubleshooting.

### Without Docker

```bash
npm install
npm run serve     # dev server with hot reload, http://localhost:8080
npm run build     # production bundle in dist/
npm run lint      # ESLint + Prettier
```

`npm run lint` **rewrites files by default.** To only measure, pass
`--no-fix`: `npm run lint -- --no-fix`. The tree carries a large number of
`prettier/prettier` warnings, so compare counts rather than reading the whole
report.

There is **no test runner** configured. A change is verified by building it and
driving the real app in a browser, not by a green test run.

## Configuration

Copy `.env.example` to `.env`. Both `docker compose` and Vue CLI read that file:
`VUE_APP_*` values are injected into the bundle by Vue CLI *and* passed to the
container by compose.

| Variable | Default | Notes |
| --- | --- | --- |
| `VUE_APP_API_BASE_URL` | `http://localhost:8000/api` | Address the **browser** uses to reach the API (read in `src/axios.js`). Not a compose service name. |
| `FRONTEND_PORT` | `8080` | Host port for the dev server. |
| `WATCHPACK_POLLING` | `false` | `true` on Docker Desktop (Windows/macOS) if hot reload ignores edits. |

### The key the app decrypts with is in the source

`src/axios.js` holds a hard-coded copy of the API's `APP_KEY` in the
`ENCRYPTION_KEY_BASE64` constant, next to the routing base URL.

Every response except `GET /api/lms` is encrypted with that key, so **the API
must encrypt with exactly this key or login fails** — the symptom is a
"Failed to decrypt response body" rejection, not a credentials error. The API
exposes the key it is using at `GET /api/lms`, which is the fastest way to
confirm the two sides agree.

## How the API layer works

Five small modules are worth knowing before touching a view:

**`src/axios.js`** — one axios instance.

- **Requests**: the token from `localStorage.token` is base64-decoded and sent
  as `Authorization: Bearer …`; an object body is base64-encoded before sending,
  because the API decodes non-GET bodies through `DecryptPayload`.
- **Responses**: `decryptPayload()` unwraps `base64(JSON({iv, value}))` with
  AES-256-CBC/PKCS7. It returns `undefined` — not `null` — when the body is not
  a readable envelope, so a payload that legitimately decodes to JSON `null`
  stays distinguishable from a failure.
- **Both interceptors decrypt.** The success path rejects a body it cannot read;
  the error path keeps the raw value, so a view can still show the API's own
  message on a 401 or 404.

**`src/apiError.js`** — `apiErrorMessage(error, fallback)` turns a failed request
into a sentence. It reads `data.message || data.error`, because the API is not
consistent about which key it uses, and returns a network-specific message when
there is no `error.response` at all. Only object bodies are trusted; a string
body is an HTML error page or ciphertext.

**`src/logout.js`** — `performLogout(router)`. Local state is cleared and the
redirect happens **before** the API call, so signing out never blocks on a
sleeping server; the token is captured first and revocation is best-effort.
Note that the API's `POST /logout` deletes **all** of the user's tokens, so
signing out in one browser ends every session for that account.

**`src/cloudinary.js`** — `uploadAttachment(file)` posts to an unsigned
Cloudinary preset and returns `secure_url`. Nothing secret is in the module.

## Theming

Dark mode is one switch: the `dark` class on `<html>`.

- `src/theme.js` resolves *saved choice → system preference* and `main.js` calls
  it before mount, so the preference survives a reload of any route. The storage
  key is `darkMode` (`"true"` / `"false"`).
- `public/index.html` carries a tiny inline copy of the same resolution so the
  class is on the document before the first paint. Keep the two in step.
- Both halves of the styling read that one class: Tailwind's
  `darkMode: "class"` variant and the token block in `app.css`.
- `app.css` maps the everyday light palette (`bg-white`, `text-gray-600`, …)
  onto tokens under `.dark`, so a page built from ordinary utilities themes
  itself. Brand colours on coloured surfaces (`text-white` on the primary
  button) are deliberately **not** remapped.

## Layout and shared UI

- `src/components/AppSidebar.vue` is the single sidebar for all three roles — it
  takes `title`, `subtitle` and an `items` array; each layout owns its own nav
  array and the icons live inside the component (`src/icons.js`).
- The app shell is `.app-layout` / `.app-main` in `app.css`. Below 1024px the
  nav is an off-canvas drawer; above it, a persistent sidebar that collapses to
  an icon rail. The collapse preference is shared across roles
  (`localStorage.sidebarCollapsed`).
- Dashboards compose `StatCard.vue`, `PanelCard.vue` and `EventList.vue` on a
  shared page rhythm (`.page`, `.page__tiles`, `.page__split`).
- The rest of the views use the shared classes in `app.css` — `.card`,
  `.table`, `.form`, `.record-list`, `.badge`, `.tabs`, `.modal`, `.alert` —
  rather than one-off styles.

## Project layout

```
public/index.html        HTML shell + the pre-paint theme script
src/main.js              entry point: stylesheet, theme, mount
src/App.vue              <router-view> only
src/router/index.js      every route
src/views/{admin,teacher,student}/   one file per screen, grouped by area
src/components/          AppSidebar, StatCard, PanelCard, EventList
src/assets/styles/app.css            Tailwind + design tokens + component classes
src/axios.js apiError.js logout.js theme.js cloudinary.js icons.js
```

`src/views/student/QuestionList.vue` is unreferenced — the routed one is
`teacher/QuestionList.vue` — and `src/localStorageInterceptor.js` is only
imported as a commented-out line in `main.js`. Watch the duplicate basenames
(`admin/StudentList.vue` vs `student/StudentList.vue`) when grepping.

## Deployment

The app is deployed to Vercel (`ctu-lms`), with `vercel.json` setting the build
command, the `dist` output directory and a catch-all rewrite to
`/index.html` for client-side routing. `VUE_APP_API_BASE_URL` is set there to
the hosted API, so nothing is hardcoded to a host in `src/**`.

The hosted API sleeps when idle: a first request can take tens of seconds. The
app sets no axios timeout, so a cold login simply spins — warm the API with a
throwaway request before judging anything on the deployed site.

## Related documents

- [DOCKER.md](DOCKER.md) — running the dev server in a container.
- [UI-UX-PLAN.md](UI-UX-PLAN.md) — the design/UX work, what is done and what is open.
- [UI-UX-BASELINE.md](UI-UX-BASELINE.md) — bundle sizes and lint counts to compare against.
- [UI-UX-TASKS.md](UI-UX-TASKS.md) — the task breakdown behind the plan.

## License

Released under the [MIT license](https://opensource.org/licenses/MIT).
