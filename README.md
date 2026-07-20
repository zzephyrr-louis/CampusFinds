# CampusFind

CampusFind is a campus lost-and-found application built with React. The current frontend supports mock authentication, a responsive dashboard, item search and details, notifications, and an admin panel. Lost/found reporting and claims are scaffolded for the next development phase.

## Quick start (recommended)

### Requirements

- Windows 10 or 11
- Node.js and npm available on `PATH`
- A current checkout of this repository

From the repository root, run:

```powershell
.\run.cmd
```

You can also double-click `run.cmd` in File Explorer. The launcher:

1. Installs frontend dependencies when they are missing.
2. Creates a clean production build.
3. Serves the built app at `http://127.0.0.1:5173`.
4. Opens the app in the default browser.

Keep the command window open while using CampusFind. Press `Ctrl+C` in that window to stop the app.

> The launcher intentionally uses `npm.cmd`, which works even when PowerShell blocks the `npm.ps1` wrapper.

## Demo accounts

The tracked `client/.env` uses mock mode, so no backend or database is required for the normal demo.

| Role | Email | Password |
| --- | --- | --- |
| Student | `student@campusfind.local` | Any test password |
| Administrator | `admin@campusfind.local` | Any test password |

The administrator account can open the protected Admin Panel. Registration creates a student account in the current browser and signs it in immediately.

Mock accounts are stored in browser `localStorage`. Mock mode does not securely verify passwords, so never enter a real password.

## Current project status

| Area | Status | What is available |
| --- | --- | --- |
| Authentication | Working in mock mode | Login, registration, logout, protected routes, and role-based admin access |
| Dashboard | Working | Responsive overview, lost/found summaries, statistics, and quick actions |
| Item search | Working with mock data | Text search, filters, reusable result cards, and item-detail routes |
| Notifications | Working with mock data | Notification list, formatting helpers, read-state interactions, and responsive styling |
| Admin panel | Working as a frontend demo | Statistics, user edit/delete actions, responsive user table, and activity logs |
| Report lost/found | Placeholder | Routes and page descriptions exist; forms and persistence still need implementation |
| Claims | Placeholder | Route exists; claim submission, review, and status tracking still need implementation |
| Backend integration | Partial | Authentication APIs exist, but the tracked frontend remains in mock mode |

## How to use the current app

1. Start CampusFind with `run.cmd`.
2. Log in with a demo account or register a mock student account.
3. Use the sidebar to open the dashboard, search, notifications, and account pages.
4. Open a search result to view the item's details.
5. Log in as the administrator to test user management and activity logs.
6. Treat Report Lost Item, Report Found Item, and My Claims as integration placeholders for now.

## Frontend development

For hot reload during development:

```powershell
cd client
npm.cmd install
npm.cmd run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

Before committing frontend work, run:

```powershell
cd client
npm.cmd run lint
npm.cmd run build
```

Both commands must pass before a branch is merged into `main`.

## API modes

The frontend reads its mode from `client/.env`:

```dotenv
VITE_API_MODE=mock
VITE_API_URL=http://localhost:8080/api
```

### Mock mode

`VITE_API_MODE=mock` is the recommended mode while frontend features are being developed. Authentication responses, demo items, and notifications come from local browser data and files under `client/src/data`.

### Spring Boot and MySQL

The Spring Boot backend is in `springboot-backend` and is the backend selected by the tracked API URL.

Requirements:

- Java 17
- MySQL running locally
- Correct local database credentials and a secure JWT secret in `springboot-backend/src/main/resources/application.properties`

Start it from the repository root:

```powershell
cd springboot-backend
.\mvnw.cmd spring-boot:run
```

Then set `VITE_API_MODE=server` in `client/.env` and restart the frontend. The Spring API uses port `8080`.

Do not commit real database passwords or production JWT secrets.

### Express and SQLite alternative

An earlier Express/SQLite authentication backend remains in `server` and runs on port `5000` by default:

```powershell
cd server
npm.cmd install
npm.cmd start
```

To use it, set the frontend to server mode and change `VITE_API_URL` to `http://localhost:5000/api`, then restart the frontend. Run only the backend you intend to test.

## Project structure

```text
CampusFind/
|-- client/                 React frontend
|   |-- src/components/     Shared and feature components
|   |-- src/context/        Authentication and notification state
|   |-- src/data/           Mock item and notification data
|   |-- src/pages/          Route-level pages
|   `-- src/services/       Mock/server API adapter
|-- springboot-backend/     Spring Boot, MySQL, and JWT API
|-- server/                 Alternative Express and SQLite API
|-- run.cmd                 Windows production-build launcher
`-- README.md               Setup, status, and team handoff guide
```

Shared component areas:

- `components/layout`: navbar, sidebar, and authenticated application shell
- `components/auth`: reusable login and registration controls
- `components/routing`: protected, public-only, and role-based routes
- `components/dashboard`: dashboard sections, cards, actions, and item summaries
- `components/search`: reusable item search results
- `components/notification`: notification presentation and formatting
- `components/adminpanel`: admin statistics, user table, and match logs
- `components/ui`: shared section headers and status badges

Coordinate before changing shared layout, routing, context, or UI components because several pages depend on them.

## Recent work summary

Last updated: **2026-07-20**

- Merged the latest teammate work into `main` and resolved the admin-panel conflicts (`6f566ed`).
- Extracted reusable dashboard statistic, quick-action, item-summary, and search-result components (`dd5e3ca`).
- Added responsive dashboard/search styling and improved the admin table's scrolling behavior.
- Modularized the admin panel into statistics, user-management, and match-log components (`15209fa`, merged by `b66f2a1`).
- Added the redesigned notification page, notification items, helper functions, mock data, and responsive styles.
- Fixed obsolete React imports in the extracted admin components so lint and production builds pass.
- Previously added mock-mode item search, filters, and item details (`588bf0c`).

Next priorities:

1. Implement the lost-item and found-item report forms.
2. Implement the claims workflow and statuses.
3. Choose the primary backend and connect item, notification, and claim features to it.
4. Replace mock authentication with the selected backend after configuration is stable.
5. Add automated tests for authentication, search, notifications, and admin actions.

## Team workflow and README rule

Start new work from the latest `main`:

```powershell
git switch main
git pull --ff-only
git switch -c your-branch-name
```

For every feature, fix, or setup change:

1. Keep edits within the feature's component/page area when possible.
2. Run lint and build before requesting a merge.
3. Update **Current project status** when functionality changes.
4. Update **How to use the current app** or **API modes** when startup/configuration changes.
5. Add a short entry to **Recent work summary** and update its date.
6. Never add passwords, tokens, database files, `node_modules`, or generated build output.

The README is part of the feature: a change is not complete if teammates cannot tell how to run or test it.

## Troubleshooting

### PowerShell says running scripts is disabled

Use `npm.cmd`, not `npm`:

```powershell
npm.cmd run dev
```

### Port 5173 is already in use

`run.cmd` opens an existing CampusFind server when it detects one. Otherwise, stop the other process using port `5173` and run the launcher again.

### Mock login or registration has stale data

Log out and clear the CampusFind site data in the browser. The relevant `localStorage` entries are `campusfind_user`, `campusfind_token`, and `campusfind_mock_users`.

### Server mode cannot connect

Confirm that:

- `VITE_API_MODE` is `server`.
- `VITE_API_URL` matches the backend port.
- The backend and its database are running.
- The frontend was restarted after editing `client/.env`.
