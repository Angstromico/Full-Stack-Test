## Technical Test – Full Stack JavaScript (React + Vite, Express + TypeScript, GraphQL)

This repository contains a full‑stack implementation of the **Technical Test – Full Stack Javascript Programmer** using:

- **Front end**: React 19, Vite, TypeScript, **Material UI**, React Router
- **Back end**: Express with TypeScript (under `Back/`)
- **API design**: GraphQL (planned as the communication layer between front end and back end)

This README focuses on describing the architecture, how to run the project, and how the current front end behaves according to the test requirements. The actual PDF is not committed in this repo, so the structure below follows common expectations for this kind of technical assessment.

---

## Project structure

- `Front/`: React + Vite + TypeScript single‑page application
  - Uses **Material UI** for UI/UX
  - Uses **React Router** for navigation between pages
  - Uses **localStorage** for demo authentication and per‑user tasks
- `Back/`: Express + TypeScript back end (GraphQL API to be implemented here)

Front and back are currently **decoupled**. The front end simulates behaviour only, with no real network calls yet, to let you focus on UX and state management.

---

## Front end (React + Vite + TypeScript + Material UI)

### Tech stack

- **React 19** with **TypeScript**
- **Vite** as the build and dev server
- **Material UI (MUI)** for component library and theming
- **React Router** for client‑side routing
- **LocalStorage** for:
  - Demo user accounts
  - Persisted login session
  - Per‑user task lists

Even though the final solution will use **GraphQL** between the front end and Express back end, the current version intentionally does **not** perform any API calls. When GraphQL is wired in, the same UI will sit on top of a GraphQL client (e.g. Apollo Client or urql) and the local state will be replaced by server‑driven data.

### Architecture overview

The front‑end app is structured around **pages**, **reusable components**, and **state providers**:

- `src/state/AuthContext.tsx`
  - Provides authentication state (`user`, `isAuthenticated`) and actions (`login`, `register`, `logout`).
  - Uses `localStorage` to persist:
    - A list of demo users (including default `admin` / `123`).
    - The current logged‑in user session.
  - All UI that depends on authentication consumes this context.

- `src/state/TaskContext.tsx`
  - Manages the current user’s **tasks**.
  - Each user has their own task list stored under a per‑user `localStorage` key.
  - Exposes CRUD operations:
    - `addTask`
    - `updateTask`
    - `deleteTask`
  - Tasks have `id`, `title`, `description`, `status`, `createdAt`, and `updatedAt`.

- `src/components/layout/Header.tsx`
  - Responsive **app header** built with Material UI `AppBar` / `Toolbar`.
  - Shows:
    - App title (links to the tasks page).
    - Navigation buttons for **Tasks** and **Task Manager**.
    - Auth section:
      - When logged out: **Login** button.
      - When logged in: current username + **Logout** button.
  - On small screens the navigation collapses into a simple menu button while keeping the layout usable.

- `src/components/layout/AppLayout.tsx`
  - High‑level layout wrapper used by React Router.
  - Renders:
    - The `Header`
    - A centered `Container` with a padded `Paper` for page contents
  - Ensures the app is responsive (mobile first) with comfortable spacing and consistent background.

- `src/components/tasks/TaskForm.tsx`
  - Reusable form used to **create** or **edit** tasks.
  - Inputs:
    - Title (required)
    - Description (optional, multiline)
  - Used in the Task Manager page both for new tasks and editing an existing one.

- `src/components/tasks/TaskList.tsx`
  - Generic, reusable list component to **display tasks**.
  - Shows:
    - Title, description, status chip, last updated timestamp.
    - Optional actions:
      - Toggle completion
      - Edit
      - Delete
  - Layout is responsive and scrollable inside the page content card.

- `src/routes/ProtectedRoute.tsx`
  - Wrapper around `Route` elements that:
    - Redirects unauthenticated users to the login page.
    - Preserves the original path so users return to it after login.

### Pages and navigation (React Router)

Routing is defined in `src/App.tsx` using React Router:

- `/login` – **Login / Register page**
  - Tabbed card with two modes:
    - **Login**: authenticate using:
      - Demo user: `admin` / `123`
      - Any registered account.
    - **Register**: create a new local user, then log in automatically.
  - Error messages are shown inline using MUI `Alert`.
  - On successful login, user is redirected to:
    - The page they originally tried to access, or
    - `/tasks` by default.

- `/tasks` – **Tasks page**
  - **Protected route** (requires login).
  - Read‑oriented view of the current user’s tasks using `TaskList`.
  - Quickly mark tasks as done/undone via the status icon.

- `/task-manager` – **Task Manager page**
  - **Protected route** (requires login).
  - Split layout:
    - Left: `TaskForm` for creating new tasks or editing the selected one.
    - Right: `TaskList` with full CRUD:
      - Select a task to edit it (pre‑fills the form).
      - Delete a task.
      - Toggle completion status.
  - All changes are per‑user and persisted into `localStorage`.

- `/logout` – **Logout page**
  - Simple confirmation/feedback screen after a logout.
  - Offers a button back to the login page.
  - Automatically redirects to `/login` after a short delay.

- `/` and unknown paths
  - Redirect to `/tasks`.

### Responsive design notes

- Layout is mobile‑first:
  - Header uses Material UI responsive breakpoints (`sm`, `md`) to adapt navigation.
  - Main content is wrapped in a `Container` with max width and vertical padding.
  - Task Manager page switches between stacked layout (mobile) and two‑column layout (desktop).
- MUI’s `CssBaseline` and a custom light theme ensure consistent typography, spacing, and colors.

---

## Back end (Express + TypeScript + GraphQL – planned)

- The back end (under `Back/`) is implemented with **Express** and **TypeScript**.
- The target architecture is:
  - A **GraphQL** API providing task and authentication operations.
  - The React front end will eventually replace localStorage calls with GraphQL queries/mutations.
- At this stage of the test:
  - **No network calls** are made from the front end.
  - All data is local and purely for demo/UX purposes.

When extending this project, the expected next steps are:

- Define a GraphQL schema for:
  - `User` and `Task` types.
  - Mutations for register/login and CRUD on tasks.
- Expose a GraphQL endpoint in the Express app.
- Introduce a GraphQL client in the front end and gradually migrate state operations.

---

## How to run the project

### Prerequisites

- Node.js 20+
- npm (or another Node package manager)

### Install dependencies

From the repository root:

```bash
cd Back
npm install

cd ../Front
npm install
```

### Run the front end (Vite)

```bash
cd Front
npm run dev
```

Then open the URL that Vite prints in the terminal (typically `http://localhost:5173`).

### Run the back end (Express)

The exact command depends on how the `Back` project is configured (for example, `npm run dev` or `npm start`). A typical flow might look like:

```bash
cd Back
npm run dev
```

At this stage, the front end does **not** call the back end yet, so running the API is optional for UI review.

---

## How to test the UI/UX

1. **Open the front end** in your browser.
2. Click **Login** in the header, or try to access `/tasks` or `/task-manager` directly (you’ll be redirected to login).
3. Log in using the demo credentials:
   - Username: `admin`
   - Password: `123`
4. Explore the **Tasks** and **Task Manager** pages:
   - Create, edit, delete, and complete tasks.
   - Refresh the page: your tasks are still there, because they are stored in `localStorage`.
5. Optionally, register a new user:
   - Switch to the **Register** tab on the login page.
   - Create a new account and then add tasks for that user.
   - Each user has isolated tasks, also stored in `localStorage`.
6. Use **Logout** from the header to end your session and see the logout page.

---

## Next steps / possible extensions

- Replace `localStorage`‑based auth and tasks with a **GraphQL** API exposed by the Express back end.
- Add input validation and error handling around all mutations.
- Add filters/search and sorting for the tasks list.
- Add tests (unit tests for state, component tests for pages, and possibly end‑to‑end tests).

This setup is intentionally structured so that wiring GraphQL on top of the existing contexts and components is straightforward, while keeping the current UI fully functional for the purposes of the technical test.

