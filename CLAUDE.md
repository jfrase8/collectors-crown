# Output Rules (Strict Token Optimization)

- ZERO conversational filler. Omit pleasantries, apologies, and phrases like "Sure!", "Here is the code", or "Let me know."
- Do not restate the prompt or explain the code unless explicitly requested.
- Output ONLY the exact code changes or direct answers.
- Use targeted edits and partial diffs. NEVER rewrite an entire file for a localized change.
- Stop when the task is done; do not offer unsolicited refactoring, abstractions, or next steps.

# Conventions & Constraints

- Read existing files before writing or modifying them.
- Stop immediately and report the full error with the traceback if a step or build fails.

# Commands

- Frontend: `npm run dev` (Vite, http://localhost:5173)
- Backend: `npm run dev:server` (tsx watch, http://localhost:3001)
- Build/typecheck all: `npm run build` / `npm run typecheck`
- Prisma: `npm run prisma:generate -w server`, `npm run prisma:migrate -w server`

# Architecture

- npm workspaces: `client/` (React 19 SPA — Vite, TanStack Router/Query/Hotkeys, Tailwind v4, Zustand+Immer, socket.io-client, dnd-kit → Vercel), `server/` (Express + Socket.IO + Prisma 7/PostgreSQL + ioredis → Render), `shared/` (shared types + typed socket event maps, consumed as source).
- Generated code (do not edit): `client/src/routeTree.gen.ts`, `server/src/generated/`.
- Live game state lives in Redis; durable records in Postgres.
