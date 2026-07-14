# Collectors Crown

Online multiplayer board game. Real-time, turn-based (one player at a time).

## Structure

npm workspaces monorepo:

- `client/` — React 19 SPA. Vite, TanStack Router (file-based routes) / Query / Hotkeys, Tailwind v4, Zustand + Immer, socket.io-client, dnd-kit. Deployed to **Vercel**.
- `server/` — Node + Express + Socket.IO. Prisma 7 + PostgreSQL (durable data), Redis via ioredis (live game state). Deployed to **Render** (see `render.yaml`).
- `shared/` — TypeScript types shared by both, including typed Socket.IO event maps (`ClientToServerEvents` / `ServerToClientEvents`). Consumed as source; no build step.

## Development

```sh
npm install
npm run dev          # client → http://localhost:5173
npm run dev:server   # server → http://localhost:3001
```

Server expects PostgreSQL and Redis (see `server/.env.example`; copy to `server/.env`). It boots without Redis, with a warning.

Prisma (run from repo root):

```sh
npm run prisma:generate -w server   # regenerate client after schema changes
npm run prisma:migrate -w server    # create/apply dev migration
```

Generated Prisma client lives in `server/src/generated/` (gitignored, regenerated on build). The client's `src/routeTree.gen.ts` is also generated (by the Vite plugin on dev/build).

## Deployment

- **Vercel (client):** set the project Root Directory to `client/`. SPA rewrites are in `client/vercel.json`. Set `VITE_SERVER_URL` to the Render URL.
- **Render (server):** `render.yaml` at the repo root defines the web service, PostgreSQL, and Redis (Key Value). Set `CLIENT_ORIGIN` to the Vercel URL. Run `npm run prisma:deploy -w server` for migrations (add it to the build command once migrations exist).

## Verify

```sh
npm run build       # builds + typechecks all workspaces
npm run typecheck
```
