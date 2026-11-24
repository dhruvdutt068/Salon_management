# 💈 Salon Queue Management System

A production-ready, full-stack **Salon Queue Management System** featuring a luxury dark-gold design (`#1F2937` & `#D4A017`), low-latency real-time synchronization, comprehensive Role-Based Access Control (RBAC), and a bilingual user interface (English & Gujarati).

Designed to eliminate physical waiting room congestion, optimize barber productivity, and streamline front-desk operations across all device form factors (Mobile, Tablet, Desktop, and TV Wall Displays).

---

## 🌟 Key Highlights

- **⚡ Real-Time Synchronization**: Instant state synchronization across Customer, Reception, Barber, and TV Display interfaces via WebSockets and cross-window broadcast (<5 second updates).
- **🔒 Role-Based Access Control (RBAC)**: Secure multi-role access (Admin, Receptionist, Barber, Customer) with bcrypt hashed PINs, stateless JWT sessions, and isolated chair views.
- **🛡️ Customer Ticket Privacy Isolation**: URL tampering prevention—customers can only view their own active tokens.
- **📺 Dedicated Waiting Area Display**: TV-optimized, high-contrast display with large tokens, "Now Serving" alerts, and dynamic wait estimations.
- **🌐 Bilingual Support (i18n)**: One-click toggle between **English** and **Gujarati (ગુજરાતી)** across every user-facing label and string.
- **🎯 Business Rules Engine**: Centralized in FastAPI backend—handles wait time calculation, dynamic queue positioning, preferred barber routing, duplicate phone checks, and walk-in overrides.
- **📱 Mobile-First Ergonomics**: Designed to meet WCAG standards with 44px+ minimum touch targets, dark-mode eye comfort, and responsive grid layouts.

---

## 📸 Core Screen Modules

| Module | Route | Access Level | Description |
| :--- | :--- | :--- | :--- |
| **Home / Landing** | `/` | Public | Luxury salon landing page with live wait times, services showcase, and quick queue join CTA. |
| **Join Queue** | `/join` | Customer / Admin | Smart multi-service booking with duration estimation, preferred stylist selection, and validation. |
| **Live Ticket Status** | `/status/:id` | Customer (Isolated) | Live animated queue tracker with position countdown, assigned barber card, and cancel button. |
| **Waiting Area TV** | `/display` | Public / TV Display | Large-format, high-contrast dashboard displaying "Now Serving", "Up Next", and estimated wait times. |
| **Reception Desk** | `/reception` | Receptionist / Admin | Front-desk cockpit: manual walk-ins, customer dispatch, priority reordering, and emergency freeze. |
| **Barber Console** | `/barber/:name` | Assigned Barber / Admin | Stylist workstation: Call Next, Start Service, Complete Service, and Break toggle with chair isolation. |
| **Owner Settings** | `/admin` | Admin | Real-time analytics, daily revenue metrics, dynamic service pricing/duration editor, and queue switch. |
| **Auth Portal** | `/login` | Public | Multi-role unified sign-in (Customer phone/PIN, Barber, Reception, Admin). |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vite.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Client UI state) + [TanStack Query](https://tanstack.com/query) (Server state)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/)
- **ORM**: [SQLAlchemy 2.x](https://www.sqlalchemy.org/)
- **Database Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Data Validation**: [Pydantic v2](https://docs.pydantic.dev/)
- **Security**: [PyJWT](https://pyjwt.readthedocs.io/) + [Passlib (bcrypt)](https://passlib.readthedocs.io/)
- **Real-Time Communication**: Native FastAPI WebSockets

### Database
- **Development**: Local SQLite (`salon_queue.db`)
- **Production**: [PostgreSQL](https://www.postgresql.org/) (Compatible with [Supabase](https://supabase.com/) & [Neon](https://neon.tech/))

---

## 📂 Project Architecture

```
salon_managment/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (auth, queue, barbers, services, settings, stats)
│   │   ├── core/            # App configurations, CORS, and JWT/Bcrypt security
│   │   ├── db/              # SQLAlchemy session setup, engine, and init seed scripts
│   │   ├── models/          # ORM models (Barber, Service, QueueEntry, Setting, User)
│   │   ├── schemas/         # Pydantic schemas for requests, responses, and tokens
│   │   ├── services/        # Centralized business logic (QueueService)
│   │   ├── websocket/       # WebSocket connection manager & broadcast channels
│   │   └── main.py          # FastAPI application entrypoint & lifespan events
│   ├── requirements.txt     # Python dependencies
│   ├── test_auth.py         # Automated test suite for RBAC & authentication
│   └── test_backend.py      # Automated test suite for Queue logic & API endpoints
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static media and logos
│   │   ├── components/      # Reusable UI atoms (Button, Card, Badge, Modal, ProtectedRoute)
│   │   ├── constants/       # Dummy fallback services and barber catalogues
│   │   ├── hooks/           # Custom React hooks
│   │   ├── i18n/            # Translation dictionaries (en.json, gu.json)
│   │   ├── layouts/         # Root layout with role-aware Navbar & Footer
│   │   ├── pages/           # Application views (Home, JoinQueue, MyStatus, Reception, Barber, etc.)
│   │   ├── routes/          # AppRoutes with role guards and chair isolation
│   │   ├── services/        # API and WebSocket client integration
│   │   ├── store/           # Zustand state stores (useQueueStore, useAuthStore)
│   │   ├── types/           # Shared TypeScript interfaces & types
│   │   └── utils/           # Formatting, date helpers, and sound notifications
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── docs/                    # Specification documents (01-brief, 02-screens, 03-flows-rules)
└── README.md
```

---

## 🔑 Default Staff & Demo Credentials

The database comes pre-configured with the following staff accounts:

| Role | Username / Identity | PIN | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin (Owner)** | `admin` | `9999` | Full access to all dashboards, analytics, pricing, and system controls. |
| **Receptionist** | `reception` | `1234` | Access to Reception Desk, walk-ins, priority reordering, and TV display. |
| **Senior Stylist** | `ravi` | `1111` | Access to Ravi's chair console (`/barber/ravi`). |
| **Master Stylist** | `amit` | `2222` | Access to Amit's chair console (`/barber/amit`). |
| **Hair Specialist** | `imran` | `3333` | Access to Imran's chair console (`/barber/imran`). |
| **Customer** | *(Self-register)* | Any 4 digits | Join Queue, track personal status ticket, view TV board. |

*Note: Customer accounts register dynamically via the **Customer** tab on `/login` or through the **Join Queue** screen.*

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- **Python**: v3.11 or higher
- **Git**

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database tests to verify integrity
python test_auth.py
python test_backend.py

# Start the FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be running at:
- **API Base URL**: `http://localhost:8000`
- **Swagger Interactive Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend client will be available at:
- **Local Application**: `http://localhost:5173`

---

## ☁️ Connecting to Supabase (PostgreSQL)

The system automatically defaults to SQLite for zero-config local development. To connect to a cloud PostgreSQL database like **Supabase**:

1. Log into your [Supabase Console](https://supabase.com/) and create a project.
2. Navigate to **Project Settings** -> **Database**.
3. Copy the **URI Connection String** (Transaction pooler or direct connection).
4. Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   SECRET_KEY="your-super-secret-jwt-key"
   ALGORITHM="HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES="1440"
   ```
5. Restart FastAPI:
   ```bash
   uvicorn app.main:app --reload
   ```
   *SQLAlchemy will automatically create the tables and seed staff accounts and default services on startup!*

---

## 🧪 Testing & Verification

The project includes end-to-end automated testing for business rules, authorization, and build validation:

```bash
# Run backend RBAC and JWT authentication test suite
python backend/test_auth.py

# Run backend Queue logic, validation rules, and status transition test suite
python backend/test_backend.py

# Run frontend TypeScript type checking and production build
cd frontend
npm run build
```

---

## 📋 Queue Business Rules

- **Duplicate Phone Rule**: A phone number cannot hold more than one active ticket simultaneously (`Waiting`, `Called`, or `In Chair`). Rejoining is allowed only after the previous ticket is completed, cancelled, or marked as a no-show.
- **Maximum Services**: A customer can select at most **3 services** per queue visit.
- **Estimated Wait Algorithm**:
  $$\text{Wait Time} = \frac{\sum \text{Duration of preceding waiting entries}}{\text{Active on-duty barbers}}$$
  Minimum estimated wait time is clamped to **10 minutes**.
- **Cancellation**: Customers can cancel tickets only while in `Waiting` status. Once `Called` or `In Chair`, only Reception or the assigned Barber can update the ticket.
- **Online Queue Lock**: When the owner toggles online queueing to "Closed", `/join` rejects online bookings, while Reception can still register in-person walk-ins.

---

## 🚢 Deployment

### Frontend (Vercel)
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/).
3. Set **Root Directory** to `frontend`.
4. Configure Environment Variables:
   ```env
   VITE_API_URL=https://your-backend-domain.com
   VITE_WS_URL=wss://your-backend-domain.com
   ```
5. Deploy!

### Backend (Railway / Render)
1. Import the repository and set **Root Directory** to `backend`.
2. Set Build Command: `pip install -r requirements.txt`
3. Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Configure Environment Variables:
   ```env
   DATABASE_URL=postgresql://... (Supabase PostgreSQL URL)
   SECRET_KEY=your-production-secret-key
   ```
5. Deploy!

---

## 📄 License

This project is licensed under the **MIT License**.
