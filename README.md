# Mavuno — AgriTrans Logistics

Premium fleet management, tracking, and agricultural logistics for Rwanda's transport network. React 19 SPA with Vite, in-memory demo data, and DeepSeek-powered operational audits.

## Prerequisites

- Node.js 20+
- A [DeepSeek API key](https://platform.deepseek.com/) (for audit generation)

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Set `DEEPSEEK_API_KEY` in `.env.local`.

3. Start the Vite client and Express API together:

   ```bash
   npm run dev
   ```

   - App UI: http://localhost:3000
   - API server: http://localhost:3001 (Vite proxies `/api` to it)

   Or run in two terminals: `npm run dev:client` and `npm run dev:server`.

## Routes

| Path | Screen |
|------|--------|
| `/` | Operations dashboard |
| `/users` | Operator registry |
| `/fleet` | Fleet registration |
| `/requests` | Consignment leads |
| `/tracking` | Live dispatch tracking |
| `/reports` | Financial ledger |
| `/settings` | Platform parameters |

## Production build

```bash
npm run build
npm run start
```

`npm run start` serves the built SPA from `dist/` and exposes `/api/ai/audit` on the same port (default 3001). Set `PORT` and `DEEPSEEK_API_KEY` in the environment.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Client + API (concurrently) |
| `npm run dev:client` | Vite only |
| `npm run dev:server` | Express API with watch |
| `npm run build` | Production client bundle |
| `npm run start` | Serve `dist` + API |
| `npm run lint` | TypeScript check |

## AI audit

On the dashboard, **Generate System Audit** sends anonymized platform metrics to `POST /api/ai/audit`. The Express server calls DeepSeek (`deepseek-chat`) and returns a narrative summary. The API key stays server-side only.
