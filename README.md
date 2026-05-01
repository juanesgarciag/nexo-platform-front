# nexo-platform-front

Local-first dashboard for the NexoBot Polymarket platform. Talks to `nexo-platform-back` (FastAPI) with an HttpOnly session cookie, and integrates MetaMask in **read-only** mode via RainbowKit to display USDC + MATIC balances on Polygon.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- React Query (`@tanstack/react-query`)
- wagmi v2 + viem + RainbowKit v2
- recharts

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local and set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npm run dev
```

Then open http://localhost:3000.

## Environment variables

| Var | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL of `nexo-platform-back` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | — | Required by RainbowKit. Get one free at https://cloud.walletconnect.com |

## Auth

Login uses the credentials configured on the back via `ADMIN_USERNAME` / `ADMIN_PASSWORD`. The backend stores the JWT in an HttpOnly cookie; the frontend only keeps a non-sensitive tab marker in `sessionStorage`.

## Requirements

- `nexo-platform-back` running and reachable at `NEXT_PUBLIC_API_URL`
- A WalletConnect project id (only needed if you want to connect MetaMask)

## Pages

- `/` — Dashboard (PnL summary, recent positions, recent deposits, chart)
- `/positions` — Open / closed / all positions, with manual close
- `/trades` — Trade ledger with filters and CSV export
- `/deposits` — Auto + manual deposits, manual create/delete
- `/control` — Pause/resume + edit bot params
- `/processes` — Bot heartbeats per loop
