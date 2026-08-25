# Morsh CRM — Frontend

Next.js client for the [Morsh CRM multi-tenant API](https://github.com/NITRO-COL/mern-multi-tenant-crm-backend).

Responsive dashboard, leads and customers modules, role-aware UI, light/dark themes.

---

## Quick start

The API must be running first — see the
[backend repository](https://github.com/NITRO-COL/mern-multi-tenant-crm-backend) for setup
and seeding.

```bash
git clone https://github.com/NITRO-COL/mern-multi-tenant-crm-frontend.git
cd mern-multi-tenant-crm-frontend
npm install
cp .env.example .env.local     # defaults to http://localhost:5000
npm run dev                    # http://localhost:3000
```

### Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | no | `http://localhost:5000` | API base URL — no trailing slash, no `/api` suffix |

---

## Test credentials

The login screen has a one-click **Demo accounts** panel containing all of these.
Sign in as Acme, then as Globex, and confirm neither can see the other's records.

| Organization | Role | Email | Password |
|---|---|---|---|
| Acme Corporation | ADMIN | `admin@acme.com` | `Admin@123` |
| Acme Corporation | SALES | `sales@acme.com` | `Sales@123` |
| Globex Industries | ADMIN | `admin@globex.com` | `Admin@123` |
| Globex Industries | SALES | `sales@globex.com` | `Sales@123` |

Signed in as a **SALES** user, delete actions disappear from the row menus — and the API
rejects them with `403` even if the request is replayed by hand.

---

## Pages

| Route | Contents |
|---|---|
| `/login` | Email + password, inline validation, demo-account picker |
| `/dashboard` | KPI tiles, pipeline and source charts, 30-day trend, recent leads |
| `/leads` | Searchable / filterable / sortable table with paging and add-edit forms |
| `/customers` | Customer list with the same table treatment |

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 |
| Styling | Tailwind CSS v4 — CSS custom properties, no JS config |
| Server state | TanStack Query |
| Forms | React Hook Form + Zod |
| HTTP | Axios with request/response interceptors |
| Charts | Recharts |
| Icons | lucide-react |
| Toasts | sonner |

---

## Architecture

```
app/
├── (auth)/login/            public route group
└── (dashboard)/             shared shell + client-side route guard
    ├── dashboard/ · leads/ · customers/

components/
├── ui/       primitives   — Button, Field, Card, Badge, Modal, States, Pagination
├── layout/   chrome       — Sidebar, Topbar, MobileNav, PageHeader
└── shared/   composites   — SearchInput, DemoCredentials

features/     one folder per domain — api.js · hooks.js · views
hooks/        useDebounce, useMediaQuery
lib/          axios client, auth context, permission mirror, utils
```

Three component tiers: `ui/` knows nothing about the domain, `shared/` is domain-aware but
page-agnostic, `features/` fetches data and composes screens.

---

## Notes on the frontend approach

**Authorization is mirrored, never enforced here.** `lib/permissions.js` holds a copy of
the server's RBAC table so the UI can hide actions a role cannot perform. That is a
convenience, not a security boundary — the API re-checks every request, so forging the
client-side state gains nothing.

**No client-side filtering.** Search, status filters, sorting and paging are all query
parameters. The browser never holds more than one page of records — 10 rows, not the
collection. Search input is debounced by 350 ms so typing produces one request, not one
per keystroke.

**Tables become cards below `lg`.** An eight-column table is unreadable on a phone and a
page that scrolls sideways reads as broken, so the leads and customers tables render a card
list at mobile widths rather than shrinking. Verified at 320 / 390 / 768 / 1280 / 1440 px:
**no page scrolls horizontally at any width.** Where the desktop table genuinely exceeds
its column, it scrolls inside its own container, never the document.

**Every async surface has four states.** Loading is a skeleton shaped like the real layout
(so nothing jumps when data lands), not a spinner; empty and no-results are distinct, and
each offers the action that resolves it; errors render inline with a retry.

**Theme via CSS custom properties.** Light and dark are two token blocks; components read
roles (`--surface`, `--text-muted`, `--chart-accent`) rather than raw colours, so the theme
swaps in one place. A tiny inline script applies the stored preference before first paint,
so the page never flashes light before turning dark.

**Chart colours were validated, not eyeballed.** Pipeline stages use an ordinal single-hue
ramp — the further along the pipeline, the further the fill sits from the page surface —
with `LOST` deliberately outside it in the de-emphasis grey. Single-series charts use one
colour and no legend, because the axis already names every bar. Both modes were checked for
lightness monotonicity, step separation and contrast against their own surface.

**Mobile details that are easy to miss.** Inputs are 16px on small screens (below that iOS
zooms the viewport on focus); tap targets clear 44px; the bottom navigation respects
`env(safe-area-inset-bottom)`; modals become bottom sheets so the primary action is not
buried under the keyboard.

---

## Deployment (Vercel)

1. **Vercel → Add New → Project**, import this repository. Next.js is detected
   automatically — no build configuration required.
2. Add one environment variable:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://<your-api>.onrender.com` |

3. Deploy, then set `CORS_ORIGIN` on the API to this project's Vercel URL and redeploy
   the API — otherwise every request is blocked by CORS.

Deploy the [API](https://github.com/NITRO-COL/mern-multi-tenant-crm-backend) first; its
README covers the Render side and the order of operations.


---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
