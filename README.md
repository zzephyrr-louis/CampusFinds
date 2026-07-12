# CampusFind

## Run CampusFind

On Windows, double-click `run.cmd` in the project folder. It installs the frontend dependencies when needed, creates a clean optimized build, serves the completed files with plain Node.js, and opens the app in your browser. Vite exits after compiling the React source and is not the running web server. Keep the command window open while using the app; press `Ctrl+C` there to stop it.

You can also launch it from PowerShell or Command Prompt without changing folders:

```powershell
.\run.cmd
```

The launcher deliberately uses `npm.cmd`, so it works even when PowerShell blocks the `npm.ps1` script under its execution policy.

## Manual frontend development

The project currently runs in frontend-only mode, so the Express/SQLite server does not need to be started. If you prefer to launch it manually:

```powershell
cd client
npm.cmd run dev
```

Open the local URL printed by Vite. Login and registration use mock browser data, which lets you test navigation, validation, authentication state, and page layouts without a database.

For the included student preview account, use:

```text
Email: student@campusfind.local
Password: any test password
```

Registration creates a local mock account and signs it in immediately. Mock mode remembers registered profiles in that browser, prevents duplicate emails and student IDs, and intentionally does not perform secure password verification. Never enter a real password while mock mode is enabled.

## Frontend component ownership

Louis owns the shared application shell and the dashboard experience:

- `components/layout`: responsive Navbar, Sidebar, and AppShell
- `components/auth`: shared authentication layout and form fields
- `components/routing`: authentication and role route guards
- `components/dashboard`: Dashboard Overview, Lost Items Summary, Found Items Summary, and Quick Actions
- `components/ui`: shared section headers and status badges

Routes for Member 2 and Member 3 are scaffolded with integration placeholders. Each member can replace the matching page content without editing the shared shell or Louis's dashboard components.

When the MySQL backend is ready, edit `client/.env` and set:

```dotenv
VITE_API_MODE=server
```

Then restart Vite. The frontend will use `VITE_API_URL` again.

> Mock mode is only for UI development. It does not provide real authentication or persistent database storage.

## Original Vite notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
