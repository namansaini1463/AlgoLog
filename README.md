# AlgoLog

**Stop forgetting the problems you solved.**

AlgoLog is a DSA progress tracker powered by spaced repetition. It uses the SM-2 algorithm to intelligently schedule problem revisions based on your confidence level — so the problems you struggle with come back sooner, and the ones you've mastered fade into longer intervals. Built for anyone grinding LeetCode, Codeforces, or preparing for coding interviews.

<!-- Add a screenshot/demo GIF here -->
<!-- ![AlgoLog Dashboard](docs/screenshots/dashboard.png) -->

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running with Docker (Recommended)](#running-with-docker-recommended)
  - [Running Locally (Development)](#running-locally-development)
- [Database Migrations](#database-migrations)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Spaced Repetition Engine
The core of AlgoLog. After solving a problem, rate your confidence from 1 (struggled) to 5 (nailed it). The SM-2 algorithm calculates when you should revisit it:
- **Confidence < 3** → interval resets to 1 day
- **Confidence ≥ 3** → interval grows (1 → 3 → 7 → 21+ days)
- Ease factor adjusts dynamically based on your performance history
- Tracks streak count, repetition count, and times revised

### Revision Queue
A prioritized view of everything you need to review:
- **Flagged** — problems you've manually marked for extra attention
- **Overdue** — missed revisions that need catching up
- **Due Today** — today's scheduled reviews
- **This Week** — upcoming in the next 7 days
- Snooze functionality to defer a problem (prevents same-day re-snoozing)

### Problem Management
- **Curated Problem Bank** — browse hundreds of pre-loaded problems from LeetCode and Codeforces, filterable by difficulty, topic, and tags
- **Custom Problems** — add your own problems with any URL; the platform is auto-detected
- Difficulty levels: Easy, Medium, Hard
- 25 predefined DSA topics (Arrays, DP, Graphs, Trees, etc.)

### Rich Notes
Built with Tiptap, a modern rich text editor:
- Syntax-highlighted code blocks (via Lowlight)
- Text styling — bold, italic, colored text, highlights
- Image uploads via Cloudinary CDN
- Camera capture for whiteboard photos and diagrams
- PDF attachments
- Two-tier notes: quick one-liner summary + detailed approach

### Progress Dashboard
- **Activity Heatmap** — GitHub-style contribution graph (52-week view)
- **Streak Tracking** — consecutive days of on-time revisions
- **Topic Breakdown** — visual chart of problems solved by DSA category
- **Key Metrics** — total solved, total revisions, due today, overdue count

### Focus Timer
Built-in Pomodoro-style timer:
- Presets: Pomodoro (25 min), Short Break (5 min), Long Break (15 min), Custom
- Audio chime on completion (Web Audio API)
- Browser push notifications
- Tab title updates with remaining time

### Daily Checklist
Simple habit tracker for daily practice goals. Check off tasks to build consistency.

### PWA Support
- Installable as a native app on any device
- Offline support via service worker
- Push notifications for revision reminders

### Authentication
- Email/password registration and login
- OAuth2: Google and GitHub sign-in
- JWT-based sessions (7-day expiry)

### Email Reminders
- Automated revision reminder emails via Brevo (Sendinblue)
- Configurable reminder time and timezone

### Admin Dashboard
- Platform analytics (user counts, activity trends)
- Problem bank management (add, edit, publish)
- Topic management
- User reports and moderation

### Dark Mode
Full light/dark theme toggle with persistent preference.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React | 19.2 |
| | TypeScript | 6.0 |
| | Vite | 8.0 |
| | Tailwind CSS | 4.2 |
| | Zustand | 5.0 |
| | TanStack Query | 5.96 |
| | Tiptap | 3.22 |
| | Recharts | 3.8 |
| | React Router | 6.30 |
| **Backend** | Java | 25 |
| | Spring Boot | 3.4.4 |
| | Spring Security + OAuth2 | — |
| | Spring Data JPA | — |
| | JJWT | 0.12.6 |
| | MapStruct | 1.6.3 |
| | Flyway | — |
| **Database** | PostgreSQL | 17 |
| **Infrastructure** | Docker | Multi-stage |
| | Nginx | — |

---

## Architecture

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│             │       │              │       │              │
│   React     │──────▶│  Spring Boot │──────▶│  PostgreSQL  │
│   (Vite)    │ REST  │  (Java 25)   │  JPA  │    (17)      │
│   :5173     │◀──────│  :8080       │◀──────│  :5432       │
│             │       │              │       │              │
└─────────────┘       └──────┬───────┘       └──────────────┘
                             │
                    ┌────────┼────────┐
                    │        │        │
               Cloudinary  Brevo   OAuth2
               (images)   (email)  (Google/GitHub)
```

- **Frontend** communicates with the backend via REST APIs using Axios
- **Backend** handles authentication (JWT + OAuth2), spaced repetition logic, and all CRUD operations
- **PostgreSQL** stores all data; schema managed by Flyway migrations
- **Cloudinary** handles image uploads for notes
- **Brevo** sends revision reminder emails
- **OAuth2** provides Google and GitHub sign-in

---

## Getting Started

### Prerequisites

**For Docker deployment:**
- Docker and Docker Compose

**For local development:**
- Java 25 (JDK)
- Node.js 22+
- PostgreSQL 17
- Maven (or use the included `mvnw` wrapper)

### Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---|
| `DATABASE_USERNAME` | PostgreSQL username | Yes |
| `DATABASE_PASSWORD` | PostgreSQL password | Yes |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | Yes |
| `JWT_EXPIRY_MS` | Token expiry in milliseconds (default: 604800000 = 7 days) | No |
| `ADMIN_EMAIL` | Email address for the admin account | Yes |
| `FRONTEND_URL` | Frontend URL for OAuth redirects | Yes |
| `VITE_API_BASE_URL` | Backend API URL (used by frontend at build time) | Yes |
| `VITE_API_URL` | Backend API URL (used by frontend at build time) | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for image uploads | No |
| `CLOUDINARY_API_KEY` | Cloudinary API key | No |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | No |
| `BREVO_API_KEY` | Brevo (Sendinblue) API key for emails | No |
| `BREVO_SENDER_EMAIL` | Sender email for notifications | No |
| `BREVO_SENDER_NAME` | Sender name (default: AlgoLog) | No |
| `BREVO_TEMPLATE_ID` | Brevo email template ID | No |

> **Note:** OAuth, Cloudinary, and Brevo variables are optional. The app works without them — you just won't have social login, image uploads, or email reminders.

### Running with Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/namansaini1463/AlgoLog.git
cd AlgoLog

# 2. Create your environment file
cp .env.example .env
# Edit .env with your values

# 3. Start all services
docker-compose up --build
```

This starts three containers:
- **db** — PostgreSQL 17 on port `5432`
- **backend** — Spring Boot API on port `8080`
- **frontend** — Nginx serving the React app on port `80`

The backend waits for the database health check to pass before starting. Flyway runs migrations automatically on startup.

Open `http://localhost` to use the app.

### Running Locally (Development)

#### 1. Database

```bash
# Start PostgreSQL (or use an existing instance)
# Create the database
createdb algolog
```

#### 2. Backend

```bash
cd backend

# Run the Spring Boot application
./mvnw spring-boot:run
```

The backend starts on `http://localhost:8080`. Flyway will automatically create all tables on first run.

#### 3. Frontend

```bash
cd frontend

# Install dependencies
npm ci

# Start the dev server
npm run dev
```

The frontend starts on `http://localhost:5173` with hot module replacement.

---

## Database Migrations

AlgoLog uses Flyway for database schema management. Migrations are located in `backend/src/main/resources/db/migration/` and run automatically on application startup.

| Migration | Description |
|---|---|
| `V1__init_schema.sql` | Core schema — users, problem bank, user problems, revisions, activity log, reported problems |
| `V2__seed_topics.sql` | Seeds 25 DSA topics (Arrays, DP, Graphs, Trees, etc.) with color codes |
| `V3__allow_custom_problems.sql` | Makes bank problem optional, adds custom title/URL fields |
| `V4__add_oauth_support.sql` | Makes password nullable, adds OAuth provider/ID fields |
| `V5__add_custom_topic_difficulty.sql` | Adds custom topic and difficulty to user problems |
| `V6__add_custom_tags.sql` | Adds custom tags array to user problems |
| `V7__revision_enhancements.sql` | Adds flagging, snoozing, streak tracking, notification preferences |
| `V8__separate_revision_count.sql` | Separates revision count from problem count in activity log |
| `V9__fix_null_is_published.sql` | Fixes null published state in problem bank |

---

## Project Structure

```
AlgoLog/
├── .env.example                    # Environment variable template
├── docker-compose.yml              # Docker services orchestration
│
├── backend/
│   ├── Dockerfile
│   ├── pom.xml                     # Maven dependencies
│   └── src/main/
│       ├── java/com/algolog/
│       │   ├── AlgologApplication.java
│       │   ├── activity/           # Activity logging & heatmap data
│       │   ├── admin/              # Admin endpoints & analytics
│       │   ├── auth/               # JWT auth, OAuth2, login/register
│       │   ├── config/             # Spring Security, CORS, OAuth config
│       │   ├── exception/          # Global exception handling
│       │   ├── notification/       # Email reminders (Brevo integration)
│       │   ├── problem/            # Problem bank CRUD
│       │   ├── report/             # Problem reporting
│       │   ├── revision/           # SM-2 spaced repetition engine
│       │   ├── topic/              # Topic management
│       │   ├── upload/             # Image upload (Cloudinary)
│       │   ├── user/               # User management
│       │   └── userProblem/        # User problem tracking
│       └── resources/
│           ├── application.properties
│           ├── application-prod.properties
│           └── db/migration/       # Flyway SQL migrations
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf                  # Production Nginx config
    ├── vercel.json                 # Vercel SPA routing
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── api/                    # Axios API client functions
        ├── components/             # Reusable React components
        ├── hooks/                  # Custom React hooks
        ├── pages/
        │   ├── LandingPage.tsx
        │   ├── auth/               # Login, Register, OAuth callback
        │   ├── user/               # Dashboard, Problems, Revisions, Timer, Settings
        │   └── admin/              # Admin dashboard & management
        ├── router/                 # React Router configuration
        ├── services/               # PWA, auth services
        ├── store/                  # Zustand stores (auth, theme, timer, checklist)
        └── utils/                  # Helper functions
```

---

## API Overview

All API endpoints are prefixed with `/api`. Authentication is via JWT Bearer token (obtained from `/api/auth/login` or OAuth2 flow).

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/oauth2/authorization/{provider}` | Initiate OAuth2 flow (google/github) |

### Problems
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/problems` | List user's solved problems |
| POST | `/api/problems` | Add a problem (from bank or custom) |
| GET | `/api/problems/{id}` | Get problem details with notes |
| PUT | `/api/problems/{id}` | Update problem notes/confidence |
| DELETE | `/api/problems/{id}` | Remove a problem |

### Problem Bank
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/bank/problems` | Browse curated problem bank |
| GET | `/api/bank/problems/{id}` | Get bank problem details |

### Revisions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/revisions/queue` | Get prioritized revision queue |
| POST | `/api/revisions/{id}/complete` | Complete a revision with confidence rating |
| POST | `/api/revisions/{id}/snooze` | Snooze a revision |
| POST | `/api/revisions/{id}/flag` | Flag/unflag a problem |

### Activity & Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/activity/heatmap` | Activity heatmap data |
| GET | `/api/activity/stats` | Dashboard statistics |

### Topics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/topics` | List all DSA topics |

### Settings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/settings` | Get user settings |
| PUT | `/api/users/settings` | Update notification/timezone preferences |

### Upload
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload/image` | Upload an image to Cloudinary |

---

## Deployment

### Docker (Self-hosted)

The included `docker-compose.yml` handles everything. Set your `.env` variables and run:

```bash
docker-compose up -d --build
```

The frontend is served via Nginx on port 80 with gzip compression and SPA routing. Static assets are cached for 1 year with immutable headers.

### Vercel (Frontend Only)

The frontend can be deployed to Vercel separately. The included `vercel.json` handles SPA routing. Set `VITE_API_BASE_URL` and `VITE_API_URL` as Vercel environment variables pointing to your backend.

### Backend on Railway / Render / Fly.io

The backend Dockerfile produces a standalone JAR that runs with `--spring.profiles.active=prod`. Set all environment variables in your hosting platform. The `application-prod.properties` profile disables SQL logging and uses the `PORT` env variable.

Key production settings:
- `server.forward-headers-strategy=framework` — required behind reverse proxies for correct OAuth redirect URIs
- `spring.datasource.hikari.maximum-pool-size` — configurable via `DB_POOL_SIZE` env var (default: 10)

---

## The SM-2 Algorithm

AlgoLog implements the [SuperMemo SM-2](https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method) spaced repetition algorithm, adapted for DSA problem review:

1. After completing a revision, the user rates their confidence (1–5)
2. If confidence < 3: interval resets to 1 day, repetition count resets
3. If confidence ≥ 3: interval advances based on repetition count
   - Rep 1 → 1 day
   - Rep 2 → 3 days
   - Rep 3+ → previous interval × ease factor
4. Ease factor adjusts: `EF' = EF + (0.1 - (5 - confidence) × (0.08 + (5 - confidence) × 0.02))`
5. Minimum ease factor is clamped at 1.3
6. Streak increments on successful reviews (confidence ≥ 3), resets otherwise

This means problems you find easy will naturally space out to weeks or months, while tricky problems keep coming back until you've truly internalized them.

---

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run the frontend linter: `cd frontend && npm run lint`
5. Test your changes locally with Docker or the dev setup
6. Commit your changes with a descriptive message
7. Push to your fork and open a Pull Request

### Areas where help is appreciated:
- Adding more problems to the curated bank
- Mobile UI/UX improvements
- Test coverage (unit + integration)
- Accessibility improvements
- Internationalization (i18n)

---

## License

This project is open source. See the [LICENSE](LICENSE) file for details.

---

**Built with frustration and spaced repetition by [@NamanSaini](https://github.com/NamanSaini)**
