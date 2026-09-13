# Running the frontend with Docker

One container: the Vue dev server, with hot reload.

| Service    | What runs                                  | URL (host)            |
| ---------- | ------------------------------------------ | --------------------- |
| `frontend` | `vue-cli-service serve`                    | http://localhost:8080 |

The Laravel API is a separate repository (`lmsbackend`) and a separate compose
project. This container only serves the app — the **browser** is what calls the
API, so nothing is shared between the two stacks except the host's ports.

## Quick start

```bash
docker compose up -d --build
```

Open <http://localhost:8080>. Start the API first if you want to log in.

## Everyday commands

| Task                                            | Command                                        |
| ----------------------------------------------- | ---------------------------------------------- |
| Start (after the first build)                    | `docker compose up -d`                         |
| Stop                                             | `docker compose down`                          |
| Rebuild after `package.json` changes             | `docker compose build`                         |
| Follow logs                                      | `docker compose logs -f frontend`              |
| Add a package                                    | `docker compose exec frontend npm install <pkg>` |
| Production build                                 | `docker compose exec frontend npm run build`   |

## Configuration

Copy `.env.example` to `.env` to override the defaults. Both `docker compose` and
Vue CLI read that file: `VUE_APP_*` variables are injected into the bundle by Vue
CLI *and* passed to the container by compose.

| Variable               | Default                     | Notes                                                                 |
| ---------------------- | --------------------------- | --------------------------------------------------------------------- |
| `VUE_APP_API_BASE_URL` | `http://localhost:8000/api` | Address the **browser** uses to reach the API (see `src/axios.js`). Point it at a server's IP when the API is not on your machine. |
| `FRONTEND_PORT`        | `8080`                      | Host port for the dev server.                                         |
| `WATCHPACK_POLLING`    | `false`                     | Set to `true` on Docker Desktop (Windows/macOS) if hot reload ignores your edits. |

## How the image is built

`Dockerfile` builds `node:22-bookworm-slim` and runs `npm ci`. The repository is
bind-mounted for hot reload, while `node_modules` stays in a named volume so the
container's dependencies never mix with a host-side `node_modules`.

## Troubleshooting

- **Edits do not trigger a reload** — set `WATCHPACK_POLLING=true` in `.env` and
  restart: `docker compose up -d --force-recreate frontend`.
- **Login fails with a decryption error** — the API's `APP_KEY` no longer matches
  the key `src/axios.js` decrypts with. See the backend repo's `DOCKER.md`.
- **Nothing loads on :8080** — the first webpack compile takes a moment; watch it
  with `docker compose logs -f frontend`.
