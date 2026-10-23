# PostFlow dashboard

A responsive React + TypeScript starter for a social media management dashboard, using the Cherry & Peach visual direction.

## Stack

- React + Vite + TypeScript
- Tailwind CSS with reusable UI primitives
- React Router for working navigation
- TanStack Query for API state and cache invalidation
- Zod for runtime validation of mock API responses and create-post input
- React Big Calendar + date-fns
- Lucide icons and react-hot-toast

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Current behavior

- Responsive sidebar, mobile navigation drawer, top search and theme toggle.
- Light/dark theme preference persisted in localStorage.
- Dashboard metrics, mock content, performance cards and AI assistant interactions.
- React Big Calendar month/week/day/list views and calendar navigation.
- Create-post form with Zod validation, draft/scheduled state, mock API mutation and query invalidation.
- Content page with search filtering.
- Sidebar routes for media, analytics, AI studio, social accounts, team, agent/API, and settings.
- Social account connection and AI suggestions are intentionally mock interactions.

## Mock API boundary

`src/lib/mockApi.ts` is the only data source for now. It mimics asynchronous HTTP requests and validates mock data with Zod. When the backend is ready, replace these functions with `fetch`/Axios calls while preserving the exported function contracts and query keys.

## Before production

- Replace mock data with authenticated backend endpoints.
- Add OAuth flows and secure token handling on the server.
- Implement S3 presigned uploads, real publishing workers, analytics connectors, and authorization.
- Add unit and browser tests, accessibility checks, error monitoring, and deployment configuration.
- Do not treat the included sample metrics, profile, post data, or mock API key as real data or credentials.
