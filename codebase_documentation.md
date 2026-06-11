# Codebase Documentation: Multi-Tenant SaaS

This document provides a line-by-line and file-by-file explanation of the entire project structure. Use this as your master guide to understanding exactly where everything is and what it does.

---

## 📂 Backend Root (The Foundation)

### 📄 `server.js`
- **Purpose**: The main entry point of the backend application.
- **Key Logic**: 
    - Initializes Express.
    - Connects to MongoDB via `connectDB()`.
    - Configures CORS (Cross-Origin Resource Sharing) so your Vercel frontend can talk to the backend.
    - Sets up the global API routes (`/api/auth`, `/api/tasks`).
    - Starts the server listening on a port (usually 5000).

### 📄 `.env`
- **Purpose**: Stores sensitive configuration "secrets".
- **Contents**: `MONGODB_URI` (database link), `JWT_SECRET` (encryption key for tokens), and `PORT`.
- **Note**: This file is never uploaded to GitHub for security.

### 📄 `package.json`
- **Purpose**: Lists all backend dependencies and scripts.
- **Key Packages**: `express` (web server), `mongoose` (database), `jsonwebtoken` (auth), `bcryptjs` (password hashing).

---

## 📂 `config/` (Settings)

### 📄 `db.js`
- **Purpose**: Contains the code to establish a connection with MongoDB Atlas.
- **Logic**: Uses `mongoose.connect()` and logs a success/failure message to the console.

---

## 📂 `models/` (The Data Blueprints)

### 📄 `Organization.js`
- **Purpose**: Defines what an "Organization" (Tenant) looks like.
- **Contents**: Just a `name` and `createdAt` timestamp. This acts as the "parent" for all users and tasks.

### 📄 `User.js`
- **Purpose**: Defines user accounts.
- **Contents**: `name`, `email`, `password` (hashed), `role` (admin/employee), and `organizationId` (linking them to their company).

### 📄 `Task.js`
- **Purpose**: Defines the tasks created by admins.
- **Contents**: `title`, `description`, `status` (pending/completed), `assignedTo` (User ID), and `organizationId` (for multi-tenancy isolation).

---

## 📂 `middleware/` (The Security Guards)

### 📄 `authMiddleware.js`
- **Purpose**: Intercepts requests to make sure the user is allowed to see the data.
- **Logic**: 
    - `authenticate`: Checks if the browser sent a valid JWT token.
    - `requireAdmin`: Blocks non-admin users from certain routes.
    - `requireSameOrganization`: The most important part—it ensures an Admin from "Company A" cannot edit tasks from "Company B".

---

## 📂 `routes/` (The API Endpoints)

### 📄 `authRoutes.js`
- **Purpose**: Handles everything related to users.
- **Endpoints**: `/register`, `/login`, `/employees` (fetching the list of workers), and `/add-employee`.

### 📄 `taskRoutes.js`
- **Purpose**: Handles task management.
- **Endpoints**: `GET` (fetch tasks), `POST` (create), `PUT` (update status/details), `DELETE` (remove).

---

## 📂 `frontend/` (The User Interface)

### 📄 `index.html`
- **Purpose**: The single HTML page that loads the entire React app. It contains the `<div id="root"></div>` where React injects the UI.

### 📄 `vite.config.js`
- **Purpose**: Configuration for Vite (the build tool). It ensures fast reloading during development and optimizes the code for production.

### 📄 `vercel.json`
- **Purpose**: Tells Vercel how to handle routing. It ensures that if you refresh the page on a sub-route like `/tasks`, it doesn't 404.

---

## 📂 `frontend/src/` (The Heart of the UI)

### 📄 `main.jsx`
- **Purpose**: The JavaScript entry point. It renders the `<App />` component into the `index.html` root.

### 📄 `App.jsx`
- **Purpose**: The master router.
- **Logic**: Defines all the pages (`/login`, `/tasks`, etc.) and wraps them in `AuthProvider` and `ThemeProvider`.

### 📄 `index.css`
- **Purpose**: The global stylesheet. Contains our premium design system, dark mode variables, and orbital animations.

---

## 📂 `frontend/src/context/` (Global Brain)

### 📄 `AuthContext.jsx`
- **Purpose**: Manages the "Logged In" state globally.
- **Logic**: Stores the user data and token. It provides the `login()` and `logout()` functions used by every page.

### 📄 `ThemeContext.jsx`
- **Purpose**: Manages Dark vs Light mode.
- **Logic**: Toggles a `.dark` class on the `<body>` tag and saves the preference to your browser.

---

## 📂 `frontend/src/api/` (Communication)

### 📄 `client.js`
- **Purpose**: The "phone" the frontend uses to call the backend.
- **Logic**: Uses **Axios** to send requests. It has "Interceptors" that automatically add your security token to every call.

---

## 📂 `frontend/src/components/` (UI Blocks)

### 📄 `ProtectedRoute.jsx`
- **Purpose**: A wrapper that checks if you are logged in. If you try to go to the dashboard without logging in, this kicks you back to the login page.

### 📁 `layout/`
- `AppLayout.jsx`: The shell of the app (Sidebar + TopBar + Main Content area).
- `Sidebar.jsx`: The navigation menu on the left.

### 📁 `ui/` (Reusable Widgets)
- `Button.jsx`, `Input.jsx`, `Card.jsx`: Standardized UI elements to keep the design consistent.
- `DataTable.jsx`: A smart table used to display tasks and employees.
- `StatusBadge.jsx`: The colorful pills (Green for "Completed", Yellow for "Pending").

---

## 📂 `frontend/src/pages/` (The Screens)

### 📄 `LoginPage.jsx` / `RegisterPage.jsx`
- **Purpose**: The entry screens. Handle user input and call the `AuthContext` to log you in.

### 📄 `DashboardPage.jsx`
- **Purpose**: The Admin's home screen. Shows high-level stats (Total Tasks, Employee Count).

### 📄 `EmployeeDashboardPage.jsx`
- **Purpose**: A simplified view for workers. They only see the tasks assigned to them.

### 📄 `TasksPage.jsx`
- **Purpose**: The main management screen where Admins create, edit, and delete tasks.
