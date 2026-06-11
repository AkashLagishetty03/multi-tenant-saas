# Project Overview: Multi-Tenant SaaS Platform

This document provides a comprehensive breakdown of the Multi-Tenant SaaS application we have built together. It covers everything from the core architecture to specific technical challenges we overcome.

## 1. Core Architecture & Workflow

### Multi-Tenancy (The "SaaS" Part)
The project is built as a **Multi-Tenant SaaS**. This means a single instance of the application serves multiple "Organizations" (Tenants).
- **Isolation**: Each piece of data (Users, Tasks, etc.) is linked to an `organizationId`. This ensures that User A from Company X cannot see data from Company Y.
- **Scalability**: The architecture allows you to onboard new organizations without changing the code or deploying new servers.

### High-Level Workflow
1.  **Frontend**: Built with React (Vite) for a fast, responsive user interface.
2.  **API Layer**: The frontend communicates with a Node.js/Express backend via RESTful APIs.
3.  **Authentication**: Secure login using JWT (JSON Web Tokens). When you login, the server sends a token which the frontend stores and sends back with every request.
4.  **Database**: MongoDB stores all data. We use Mongoose to define strict "Schemas" (blueprints) for our data.

---

## 2. Technical Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | UI Library & Build Tool |
| **Styling** | Vanilla CSS + Modern CSS Variables | Premium, custom-built look & feel |
| **Backend** | Node.js + Express | API Server |
| **Database** | MongoDB + Mongoose | Data Storage & Object Modeling |
| **Auth** | JWT + Bcrypt | Secure Authentication & Password Hashing |
| **Deployment**| Vercel (Frontend) / Render (Backend) | Cloud Hosting |

---

## 3. Key Features Built

### A. Authentication & RBAC
- **Roles**: We implemented Role-Based Access Control (RBAC) with three main levels:
    - `Owner/Admin`: Can manage organization settings, add employees, and assign tasks.
    - `Employee`: Can view and manage their assigned tasks.
- **Redirection**: The system automatically detects your role upon login and sends you to the correct dashboard (`/admin` vs `/employee`).

### B. Employee Management
- Admins can create new employee accounts.
- The system generates default credentials and links them to the Admin's organization automatically.

### C. Task Management System
- **Admin View**: Can create tasks, assign them to specific employees, set due dates, and track status (`pending`, `in-progress`, `completed`).
- **Employee View**: A focused dashboard showing only tasks assigned to them, with the ability to update status and add submission notes.

### D. Premium UI/UX Redesign
- **Light/Dark Mode**: A global toggle that updates the entire theme dynamically.
- **Orbital Hero Section**: A high-end, visually stunning landing page for the authentication flow.
- **Responsive Layout**: Sidebar and navigation that work across mobile and desktop.

---

## 4. Challenges Faced & Resolutions

During development, we hit a few "stumbling blocks" that required deep debugging:

### 1. The "Blank Page" Post-Login Issue
- **Problem**: After logging in, the screen would go white/blank instead of showing the dashboard.
- **Cause**: The `VITE_API_URL` environment variable wasn't being correctly picked up in the production build, leading to failed API calls that crashed the React render cycle.
- **Resolution**: We audited all API files, ensured `import.meta.env.VITE_API_URL` was used consistently, and fixed the Vercel deployment configuration to inject these variables correctly.

### 2. Multi-Tenant Data Leaks
- **Problem**: Initially, tasks were showing up for all users regardless of organization.
- **Resolution**: We implemented a strict filtering middleware. Every database query now automatically appends `{ organizationId: req.user.organizationId }` to ensure data isolation.

### 3. Google OAuth "Invalid Token"
- **Problem**: Integrating Google Login resulted in token validation errors.
- **Resolution**: We synchronized the Client IDs between the Google Cloud Console, the React Frontend, and the Backend verification logic.

### 4. Role-Based Navigation Logic
- **Problem**: Employees were able to manually type `/admin` in the URL and see the admin panel.
- **Resolution**: We built a `ProtectedRoute` component in React that checks the `user.role` in the AuthContext. If an unauthorized user tries to access a page, they are redirected back to their respective dashboard.

---

## 5. Cloud Deployment Strategy

- **Frontend**: Deployed on **Vercel**. It uses a `vercel.json` for routing to ensure that React Router works correctly on page refreshes.
- **Backend**: Hosted on a service like **Render** or **Railway**, connected to a **MongoDB Atlas** cluster.
- **Environment Variables**: Crucial for security. We keep sensitive data (DB Strings, JWT Secrets, API Keys) out of the code and in the cloud provider's secure settings.

---

## 6. Current State of the Codebase

- **Backend (`/`)**: Contains the API logic, models, and routes.
- **Frontend (`/frontend`)**: Contains the React app, organized by `pages`, `components`, and `context` (for global state like Auth).
- **Models**: `User.js`, `Organization.js`, and `Task.js` form the core data structure.

This project is now a robust foundation for a professional SaaS product!
