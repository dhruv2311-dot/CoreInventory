# CoreInventory

CoreInventory is a full inventory operations platform for products, receipts, deliveries, stock tracking, warehouse/location management, and authenticated staff workflows.

## What Is New (Recent Updates)

The README has been updated to reflect the latest implementation in this codebase.

### Authentication and Security
- Added robust signup validation and duplicate detection for `login_id` and `email`.
- Added clearer backend error mapping for auth failures (duplicate user, rate limit, confirmation email failure).
- Added `Retry-After` based handling in API responses for rate-limited flows.
- Added custom forgot-password OTP workflow (request + confirm endpoints).
- OTP is now generated server-side, hashed in memory, expiry/cooldown protected, and attempts-limited.
- Password reset confirmation updates both Supabase Auth password and local `users` table hash.

### Email and OTP Delivery
- Integrated backend SMTP mailer using Nodemailer.
- Added Gmail App Password compatible configuration (spaces are sanitized in SMTP pass).
- Added OTP email template delivery from backend mailer.

### Frontend UX and Loading Improvements
- Added professional global loading system:
  - Full-screen branded splash loader on app boot.
  - Route transition loader.
  - Global API/network activity loader with top progress indicator.
- Splash now appears only on first visit per browser session.
- Added request activity signaling from API service to drive global loading state.

### Routing and Screen Flow
- Added `Forgot Password` page flow with OTP request and OTP verification/reset.
- Added `Reset Password` page route support in the app router.
- Added `Profile` route in protected app routes.

### Stability and Runtime Fixes
- Fixed potential Zustand selector rerender loop issues.
- Improved chart container sizing to avoid zero/negative size chart rendering warnings.
- Improved frontend error display behavior for auth API responses.

## Tech Stack
- Frontend: React + Vite + React Router + React Query + Tailwind CSS
- Backend: Node.js + Express
- Auth/Database: Supabase
- Email (custom OTP): Nodemailer + SMTP (Gmail App Password supported)

## Minimum Requirements
- Node.js (v18+)
- Supabase project

## Environment Variables

### Backend (`server/.env`)
```dotenv
PORT=5000
JWT_SECRET=replace_with_strong_secret

SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

FRONTEND_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=CoreInventory

PASSWORD_RESET_OTP_EXPIRY_MINUTES=10
PASSWORD_RESET_OTP_COOLDOWN_SECONDS=60
PASSWORD_RESET_OTP_MAX_ATTEMPTS=5
```

### Frontend (`frontend/.env`)
```dotenv
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

## Setup and Run

### 1) Install dependencies
```bash
# from repo root
cd frontend
npm install

cd ../server
npm install
```

### 2) Start backend
```bash
cd server
npm run dev
```

### 3) Start frontend
```bash
cd frontend
npm run dev
```

## Auth Endpoints (Current)
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/reset-password`
- `POST /auth/reset-password/request`
- `POST /auth/reset-password/confirm`

## Main Application Features
- Login/signup with employee login ID workflow
- Email confirmation based signup (Supabase)
- Custom OTP based forgot-password reset flow (SMTP)
- Dashboard KPIs and trend chart
- Product management
- Receipt workflows (draft to done)
- Delivery workflows (draft to done)
- Stock update and transfer
- Move history tracking
- Warehouse and location management
- Protected routes with centralized layout
- Realtime-aware frontend data sync behavior

## Database Schema (Supabase)

Use the following baseline tables if setting up from scratch:

```sql
CREATE TABLE users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  login_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  category text,
  unit text,
  price numeric(10,2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE warehouses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text,
  code text,
  address text
);

CREATE TABLE locations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text,
  short_code text,
  warehouse_id uuid REFERENCES warehouses(id)
);

CREATE TABLE stock (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  location_id uuid REFERENCES locations(id),
  quantity numeric DEFAULT 0
);

CREATE TABLE receipts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference text UNIQUE,
  supplier text,
  status text DEFAULT 'Draft',
  date timestamp with time zone
);

CREATE TABLE receipt_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  receipt_id uuid REFERENCES receipts(id),
  product_id uuid REFERENCES products(id),
  quantity numeric
);

CREATE TABLE deliveries (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference text UNIQUE,
  customer text,
  status text DEFAULT 'Draft',
  date timestamp with time zone
);

CREATE TABLE delivery_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  delivery_id uuid REFERENCES deliveries(id),
  product_id uuid REFERENCES products(id),
  quantity numeric
);

CREATE TABLE stock_moves (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  from_location uuid REFERENCES locations(id),
  to_location uuid REFERENCES locations(id),
  quantity numeric,
  type text,
  date timestamp with time zone
);
```

## Notes
- For custom OTP delivery, backend SMTP must be valid.
- Signup confirmation email still depends on Supabase Authentication email delivery settings.
- If using Gmail SMTP, use a Gmail App Password, not your normal account password.
