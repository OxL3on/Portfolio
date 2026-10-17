# Portfolio Architecture & Complete Documentation
**Owner:** MD Leon Islam  
**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, MongoDB / Local JSON Database, Firebase Authentication

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Data Layer & Dual-Storage Engine](#2-data-layer--dual-storage-engine)
3. [Global State & In-Memory Cache (`useSharedData`)](#3-global-state--in-memory-cache-useshareddata)
4. [Authentication & Security System](#4-authentication--security-system)
5. [Complete API Endpoints Reference](#5-complete-api-endpoints-reference)
6. [Frontend Pages & Routing](#6-frontend-pages--routing)
7. [Components Directory](#7-components-directory)
8. [End-to-End Workflows](#8-end-to-end-workflows)
9. [Design System & Theme Engine](#9-design-system--theme-engine)
10. [Configuration & Environment Variables](#10-configuration--environment-variables)

---

## 1. Architecture Overview

This project is a high-performance, offensive-security-themed personal portfolio and Content Management System (CMS). It is designed to work seamlessly both **with** or **without** external cloud services (MongoDB or Firebase) by implementing automated graceful local fallbacks.

```
                           +-------------------------------+
                           |        Browser / Client       |
                           +---------------+---------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
            Page Routes (App)                              API Routes (/api)
  - / (Home)                                      - /api/maininfo
  - /about                                        - /api/projects
  - /projects                                     - /api/blogs
  - /blog & /blog/[slug]                          - /api/skills
  - /certifications                               - /api/education
  - /achievements                                 - /api/achievements
  - /contact                                      - /api/contact
  - /experience                                   - /api/journey
  - /luffy_secret_admin_panel_portfolio           - /api/admin/auth
  - /login & /dashboard                           - /api/upload
                    |                                             |
                    +----------------------+----------------------+
                                           |
                           +---------------+---------------+
                           |    Data Engine (src/lib/db)   |
                           +---------------+---------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
        [Primary: MongoDB]                            [Fallback: Local JSON]
      MongoDB Atlas / Local                         src/data/portfolio_db.json
```

---

## 2. Data Layer & Dual-Storage Engine

Located in [`src/lib/db.js`](file:///home/leon/Portfolio/src/lib/db.js).

The backend employs a **Dual-Storage Strategy**:
1. **Local JSON Database (`src/data/portfolio_db.json`)**:
   - Acts as the baseline and offline storage.
   - Always updated synchronously on every write operation.
   - Ensures the website functions out-of-the-box in local development or static-like environments without a MongoDB connection string.
2. **MongoDB Atlas (`src/lib/mongodb.js`)**:
   - If `MONGODB_URI` is configured in environment variables, queries and updates sync directly to the cloud database (`portfolio_db`).
   - If MongoDB is unreachable or unconfigured, the system automatically falls back to reading and writing `portfolio_db.json` without throwing unhandled exceptions.

### Core Data Helper Functions (`src/lib/db.js`):
- `getLocalData()`: Reads `src/data/portfolio_db.json` safely and parses JSON content.
- `saveLocalData(updater)`: Safely updates the JSON database on disk.
- `getCollectionData(collectionName, fallbackValue)`: Queries MongoDB first; if offline or empty, reads from local JSON.
- `saveCollectionData(collectionName, data)`: Writes to both local JSON and MongoDB (if connected).

---

## 3. Global State & In-Memory Cache (`useSharedData`)

Located in [`src/hooks/useSharedData.js`](file:///home/leon/Portfolio/src/hooks/useSharedData.js).

To prevent redundant API requests and UI flashing when navigating between pages, data fetching is managed via a shared in-memory SWR-like caching hook:

- **Hook Signature:** `useSharedData(key, fetcher, ttl = 300000)` (default 5-minute cache).
- **Features:**
  - In-memory global cache (`cache[key] = { data, timestamp }`).
  - Request deduplication (`inFlightRequests[key]`): Prevents duplicate simultaneous network fetches across multiple components mounting at the same time.
  - Automatic background revalidation and cache expiration.
- **`HomeDataLoader.jsx`**: Mounted on top of the Home layout to warm up caches for all collections (`mainInfo`, `education`, `skills`, `projects`, `blogs`, `certifications`, `achievements`, `contact`) in parallel on initial page load.

---

## 4. Authentication & Security System

The website features two independent authentication architectures:

### A. The Secret Admin CMS (`/luffy_secret_admin_panel_portfolio`)
- **Route:** [src/app/luffy_secret_admin_panel_portfolio/page.jsx](file:///home/leon/Portfolio/src/app/luffy_secret_admin_panel_portfolio/page.jsx)
- **Protection:** Unpredictable secret URL with master passcode challenge and cryptographic server-validated sessions.
- **Workflow:**
  1. User enters the master passcode.
  2. Front-end sends `POST /api/admin/auth` with `{ passcode }` over same-origin connection.
  3. API strictly validates against `adminSettings.passcode` stored as a salted `scrypt` hash in the database.
  4. On success, an `HttpOnly`, `SameSite=Lax`, `Secure` session cookie (`admin_session`) is set by the server. No bearer tokens are stored in `localStorage`.
  5. Subsequent protected requests automatically transmit the secure `admin_session` cookie, which is validated cryptographically (HMAC-SHA256) on the server.
  6. On logout, the client calls `DELETE /api/admin/auth`, which immediately revokes the session on the server and expires the cookie.
  7. Passcode can be updated from Tab 10 (Security Settings), which verifies the `currentPasscode` before hashing and applying changes.

### B. Firebase Google OAuth Dashboard (`/dashboard`)
- **Route:** [src/app/(withDashboardLayout)/dashboard](file:///home/leon/Portfolio/src/app/(withDashboardLayout))
- **Protection:** [src/components/Dashboard/AuthGuard.jsx](file:///home/leon/Portfolio/src/components/Dashboard/AuthGuard.jsx)
- **Workflow:**
  1. Guard checks `onAuthStateChanged(auth)`.
  2. If unauthenticated, redirects to `/login`.
  3. If authenticated, verifies that the user's Google email matches the registered admin email (`data.gmail` or configured admin email).
  4. Unauthorized emails are immediately logged out and redirected to `/`.

---

## 5. Complete API Endpoints Reference

All endpoints run on the Next.js App Router under `src/app/api/`.

### 1. Admin Authentication (`/api/admin/auth`)
- **File:** [src/app/api/admin/auth/route.js](file:///home/leon/Portfolio/src/app/api/admin/auth/route.js)
- **`GET`**: Validates current session status via `admin_session` cookie.
  - **Response (200):** `{ authenticated: true, adminUser: { name, role } }`
  - **Response (401):** `{ authenticated: false, error: string }`
- **`POST`**: Authenticates admin credentials and issues `HttpOnly` session cookie.
  - **Payload:** `{ "passcode": string }`
  - **Response (200):** `{ success: true, message: "Authenticated successfully", adminUser: { name, role } }` (Sets `admin_session` cookie)
  - **Response (401):** `{ error: "Invalid secret passcode" }`
  - **Response (429):** `{ error: "Too many authentication attempts. Please try again later." }`
- **`PUT`**: Updates the master passcode or admin email (requires current passcode verification).
  - **Payload:** `{ "currentPasscode": string, "newPasscode": string, "newEmail"?: string }`
  - **Response (200):** `{ success: true, message: "Admin passcode updated successfully" }`
  - **Response (403):** `{ error: "Current passcode is incorrect" }`
- **`DELETE`**: Revokes the active session and clears the `admin_session` cookie.
  - **Response (200):** `{ success: true, message: "Logged out successfully" }`

### 2. Main Profile Information (`/api/maininfo`)
- **File:** [src/app/api/maininfo/route.js](file:///home/leon/Portfolio/src/app/api/maininfo/route.js)
- **`GET`**: Returns the main profile object (name, tagline, bio, coverImage, avatar, roles, social links).
- **`POST`**: Updates profile metadata and saves to database.

### 3. Projects (`/api/projects`)
- **File:** [src/app/api/projects/route.js](file:///home/leon/Portfolio/src/app/api/projects/route.js)
- **`GET`**: Returns the list of portfolio projects. Supports query param `?title=...` for single project lookup.
- **`POST`**: Adds a new project or replaces the whole array (when submitted from CMS).
- **`PUT`**: Updates an existing project by title or id.
- **`DELETE`**: Deletes a project by `?id=...` or `?title=...`.

### 4. Writeups & Blogs (`/api/blogs`)
- **File:** [src/app/api/blogs/route.js](file:///home/leon/Portfolio/src/app/api/blogs/route.js)
- **`GET`**: Returns all published articles. Supports `?slug=...` for fetching single article markdown content.
- **`POST`**: Creates a new blog article or updates the articles array.
- **`PUT`**: Updates an existing article matched by `slug` or `id`.
- **`DELETE`**: Removes an article by `?slug=...` or `?id=...`.

### 5. Skills & Tooling (`/api/skills`)
- **File:** [src/app/api/skills/route.js](file:///home/leon/Portfolio/src/app/api/skills/route.js)
- **`GET`**: Returns categorized technical skill sets (Offensive Security, Web Security, Networking, Programming).
- **`POST`**: Updates skill categories and tool lists.
- **`PUT`**: Updates a single category by title.
- **`DELETE`**: Deletes a skill category by `?title=...`.

### 6. Academic Background (`/api/education`)
- **File:** [src/app/api/education/route.js](file:///home/leon/Portfolio/src/app/api/education/route.js)
- **`GET`**: Returns degree, university/college, graduation timeline, and major info.
- **`POST`**: Adds or saves education history.
- **`PUT`**: Updates an entry matched by `degree`.
- **`DELETE`**: Deletes an entry by `?degree=...`.

### 7. Certifications (`/api/certifications`)
- **File:** [src/app/api/certifications/route.js](file:///home/leon/Portfolio/src/app/api/certifications/route.js)
- **`GET`**: Returns verified credentials (eJPT, Security+, etc.), badge status, and verification URLs.
- **`POST`**: Adds new certificate or updates records.
- **`PUT`**: Edits certificate details.
- **`DELETE`**: Deletes certificate by `?id=...` or `?title=...`.

### 8. Competitions & Achievements (`/api/achievements`)
- **File:** [src/app/api/achievements/route.js](file:///home/leon/Portfolio/src/app/api/achievements/route.js)
- **`GET`**: Returns CTF results, rankings, dates, and drill achievements.
- **`POST` / `PUT` / `DELETE`**: Full CRUD handlers for achievements.

### 9. Social & Contact Links (`/api/contact`)
- **File:** [src/app/api/contact/route.js](file:///home/leon/Portfolio/src/app/api/contact/route.js)
- **`GET`**: Returns contact channels (GitHub, LinkedIn, Discord, Twitter, TryHackMe, HackTheBox).
- **`POST`**: Saves updated list of social links.

### 10. Experience & Journey Timeline (`/api/journey`)
- **File:** [src/app/api/journey/route.js](file:///home/leon/Portfolio/src/app/api/journey/route.js)
- **`GET`**: Returns career progression, internships, and work history.
- **`POST` / `PUT` / `DELETE`**: Full CRUD handlers for journey timeline items.

### 11. Asset File Upload (`/api/upload`)
- **File:** [src/app/api/upload/route.js](file:///home/leon/Portfolio/src/app/api/upload/route.js)
- **`POST`**: Receives `multipart/form-data` containing `file` and `targetType` (`avatar`, `cover`, `logo`, or `general`).
  - Saves file to disk under `/public/uploads/`.
  - If `targetType` is `avatar`, `cover`, or `logo`, automatically writes copies to `/public/profile.jpg`, `/public/china-mountains.jpg`, or `/public/logo.png` for instant fallback support.
  - Returns `{ success: true, url: "/uploads/<filename>", name, size }`.

---

## 6. Frontend Pages & Routing

### Common Public Pages (`src/app/(withCommonLayout)/`)
Wrapped in [layout.jsx](file:///home/leon/Portfolio/src/app/(withCommonLayout)/layout.jsx) which includes `Navbar`, `Banner`, and `Footer`.

| Route | Page File | Description |
|---|---|---|
| `/` | `page.jsx` | **Home Page**: Responsive dual-column layout with profile sidebar and 8 sections. |
| `/about` | `about/page.jsx` | **About Me**: In-depth personal bio, philosophy, technical journey, and education. |
| `/projects` | `projects/page.jsx` | **Projects Showcase**: Interactive gallery with tag filters, GitHub links, and pagination. |
| `/blog` | `blog/page.jsx` | **Blog Index**: List of cybersecurity writeups, filterable by categories (TryHackMe, HTB, CTF, Research). |
| `/blog/[slug]` | `blog/[slug]/page.jsx` | **Article Reader**: Full Markdown renderer with copyable code snippets, reading time, and local markdown editor. |
| `/certifications` | `certifications/page.jsx`| **Certifications**: Industry credentials and verification badges. |
| `/achievements` | `achievements/page.jsx`| **Achievements**: CTF podium finishes and competition history. |
| `/experience` | `experience/page.jsx` | **Experience**: Career and activity timeline. |
| `/contact` | `contact/page.jsx` | **Contact**: Direct message form (Web3Forms API integration) and social channel cards. |

### Administrative & Authentication Pages
| Route | Page File | Description |
|---|---|---|
| `/luffy_secret_admin_panel_portfolio` | `page.jsx` | **Secret CMS Dashboard**: Master control panel for updating all database sections, uploading images, and editing passcodes. |
| `/login` | `login/page.jsx` | Google OAuth sign-in page for Firebase admin dashboard. |
| `/dashboard/*` | `(withDashboardLayout)` | Legacy Firebase dashboard protected by `AuthGuard`. |

---

## 7. Components Directory

### Home Page Components (`src/components/Home/`)
- **`Banner.jsx`**: Responsive hero image container with gradient fade overlays (`h-[280px]` on mobile to `h-[550px]` on desktop).
- **`SideProfile.jsx`**: Visual profile card displaying avatar image, name, bio, and social icon buttons.
- **`SideContact.jsx`**: Email quick-link card and social platforms list.
- **`Visitors.jsx`**: Real-time animated visitor counter badge powered by Moe booru counter.

### Home Main Content Sections (`src/components/Home/Main/`)
1. **`Intro.jsx`**: Greeting headline, cybersecurity roles badges, and CTA buttons.
2. **`Education.jsx`**: University and college education timeline cards.
3. **`Skills.jsx`**: 4 skill categories with Lucide icons and tag pills.
4. **`Projects.jsx`**: Featured open-source security tools with GitHub repository links.
5. **`Blog.jsx`**: Featured technical writeups previews.
6. **`Certifications.jsx`**: Verified industry credentials and links.
7. **`Achievement.jsx`**: CTF tournament rankings and highlights.
8. **`Collaboration.jsx`**: Call-to-action banner for collaborative projects.

### Shared Components (`src/components/shared/`)
- **`Navbar.jsx`**:
  - Sticky glassmorphism header.
  - Logo and brand title.
  - Desktop nav links and responsive mobile dropdown menu.
  - Theme mode selector (Dark / Light / System).
  - Dynamic Primary Hue Color Picker slider.
- **`Footer.jsx`**: Copyright notice, platform links, and scroll-to-top button.
- **`FadeIn.jsx`**: Framer Motion animation helper for smooth scroll reveals.
- **`PageLoader.jsx`**: Loading spinner indicator.
- **`HomeDataLoader.jsx`**: Parallel data prefetcher for the home view.

---

## 8. End-to-End Workflows

### 1. First Visit Data Flow
```
User navigates to "/"
       │
       ▼
HomeDataLoader triggers parallel fetch
       │
       ├─► useSharedData('mainInfo')      ──► /api/maininfo     ──► MongoDB / portfolio_db.json
       ├─► useSharedData('skillsData')    ──► /api/skills       ──► MongoDB / portfolio_db.json
       ├─► useSharedData('projectsFull')  ──► /api/projects     ──► MongoDB / portfolio_db.json
       └─► ...
       │
       ▼
Data stored in in-memory cache & React state
       │
       ▼
Components render instantly without layout shift
```

### 2. Secret Admin CMS Content Update Flow
```
Admin opens /luffy_secret_admin_panel_portfolio
       │
       ▼
Authenticates via master passcode
       │
       ▼
Token saved to localStorage (`luffy_admin_session`)
       │
       ▼
Admin edits a section (e.g., adds new Project or updates Profile)
       │
       ▼
Client sends POST /api/projects with updated JSON
       │
       ▼
API updates src/data/portfolio_db.json AND MongoDB
       │
       ▼
CMS displays instant success notification
       │
       ▼
Public website immediately reflects changes on next visit
```

### 3. File & Asset Upload Flow
```
Admin clicks "Upload Image" in CMS
       │
       ▼
POST /api/upload (multipart FormData with file & targetType)
       │
       ├─► Writes binary to /public/uploads/upload_<timestamp>.<ext>
       └─► If avatar: syncs /public/profile.jpg
           If cover: syncs /public/china-mountains.jpg
           If logo:  syncs /public/logo.png
       │
       ▼
Returns URL (/uploads/filename) to CMS form state
       │
       ▼
Admin clicks "Save Profile & Assets" to link image in database
```

---

## 9. Design System & Theme Engine

### Responsive Layout Strategy
- **Mobile (< 1024px)**:
  - `SideProfile` (Photo, name, bio, social icons) renders at the **very top** overlapping the banner.
  - Followed by `Intro`, `Education`, `Skills`, `Projects`, `Blog`, `Certifications`, `Achievements`, `Collaboration`.
  - `SideContact` and `Visitors` render at the **end** of the page.
- **Desktop (>= 1024px)**:
  - Left column: `w-[320px]` sticky sidebar containing `SideProfile`, `SideContact`, and `Visitors`.
  - Right column: `flex-1` main stream with all portfolio sections in parallel.

### Theme & Hue Engine
Located in [Navbar.jsx](file:///home/leon/Portfolio/src/components/shared/Navbar.jsx) and [globals.css](file:///home/leon/Portfolio/src/app/globals.css).
- **CSS Variables:**
  - `--primary-hue`: Active HSL hue degree (0 to 360, default 240 / Blue-Indigo).
  - `--primary-color`: `hsl(var(--primary-hue), 100%, 65%)`
  - `--primary-border`: `hsla(var(--primary-hue), 100%, 65%, 0.2)`
  - `--primary-shade`: `hsla(var(--primary-hue), 100%, 65%, 0.1)`
- **Theme Modes:**
  - `light`: `.light` class on `<html>`.
  - `dark`: `.dark` class on `<html>` (Default).
  - `system`: Matches `window.matchMedia('(prefers-color-scheme: dark)')`.
- **Persisted:** User choices saved in `localStorage.getItem('theme')` and `localStorage.getItem('primary-hue')`.

---

## 10. Configuration & Environment Variables

### Environment Variables (`.env.local` or `.env`):
```env
# MongoDB Connection String (Optional - falls back to portfolio_db.json if omitted)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/portfolio_db?retryWrites=true&w=majority

# Web3Forms API Key (Optional - for contact form email dispatch)
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your-access-key-here

# Firebase Configuration (Optional - for legacy /dashboard Google Auth)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Next.js Configuration (`next.config.mjs`):
- `devIndicators: false`: Suppresses Next.js on-screen dev overlay widget.
- `images.remotePatterns`: Whitelists remote HTTPS and HTTP hostnames for dynamic images.

---
*Generated automatically by Antigravity IDE for MD Leon Islam Portfolio.*
