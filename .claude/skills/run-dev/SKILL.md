---
name: run-dev
description: Start the collectors-crown dev stack locally (Redis via Memurai, Express/Socket.IO server, Vite client). Use when asked to run, start, or launch the app or dev server locally.
---

# Run the dev stack locally

All commands from the repo root. Both servers must run in the background (`run_in_background: true`) — they are watch processes that never exit.

## Steps

1. **Redis (Memurai)** — must be up first; the server needs it on port 6379.
   - Check: `Get-Service Memurai` — if not `Running`, start it: `Start-Service Memurai` (may need elevation; if it fails, tell the user to start the Memurai service manually).
2. **Backend** — `npm run dev:server` in the background. Listens on http://localhost:3001 (tsx watch). Wait for its startup log line before declaring it up.
3. **Frontend** — `npm run dev` in the background. Vite on http://localhost:5173.

## Environment notes

- `client/.env` points at the deployed Render backend. `client/.env.development` overrides `VITE_SERVER_URL` to `http://localhost:3001`, and Vite's dev mode picks it up automatically — do not edit `.env` for local dev.
- Never test local client code against the deployed backend when local server code is newer — it hangs silently (e.g. "Taking your seat…" forever). If the client can't connect, verify the local server is running rather than falling back to the deployed one.
- Postgres/Prisma is not needed for the game loop; don't start or migrate anything Prisma-related just to run the app.

## Verifying it's up

- Backend: the background task logs it is listening on 3001.
- Frontend: fetch http://localhost:5173 returns the SPA shell.
- Full check: open http://localhost:5173 in a browser; the lobby list should load (comes over the socket from the local server).

## Shutdown

Stop the two background tasks. Leave the Memurai service running — it's a Windows service, not session-scoped.
