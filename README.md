# CoreInventory

CoreInventory is an enterprise-ready inventory operations platform for managing product movement, inbound receipts, outbound deliveries, stock accuracy, and warehouse/location controls in one centralized system.

## Executive Summary
- Role-based inventory workflows for daily operations.
- Supabase-backed authentication and data storage.
- Professional React frontend with global loading experience.
- Secure custom OTP password reset over SMTP.
- Real-time aware data synchronization patterns.

## Product Highlights
- Employee login ID authentication model.
- Signup with confirmation-email flow.
- Custom OTP forgot-password flow with cooldown, expiry, and attempt limits.
- Dashboard KPIs with movement trend visualization.
- Product lifecycle management.
- Receipt validation workflow that updates stock.
- Delivery validation workflow that deducts stock.
- Stock transfer and movement history tracking.
- Warehouse and location administration.
- Protected routes and centralized app layout.
- Session-first branded splash and global activity loaders.

## Architecture

### Frontend
- React + Vite SPA.
- React Router for route-level composition.
- React Query for async data and cache invalidation.
- Zustand for auth session state.
- Tailwind CSS v4 theme-driven UI.
- Recharts for dashboard analytics.

### Backend
- Node.js + Express REST API.
- Supabase JS SDK for auth and database operations.
- JWT issuance for app authorization context.
- Nodemailer SMTP integration for custom OTP delivery.

### Data Layer
- Supabase Postgres for domain entities.
- Users table synchronized with auth identities.
- Domain tables for products, stock, receipts, deliveries, and movements.

## Feature Inventory

### Authentication and Account Security
- Login with `login_id` + password.
- Signup request validation and duplicate checks for `login_id` and `email`.
- Email-confirmation based signup response handling.
- Custom forgot-password OTP request endpoint.
- OTP hashing before in-memory storage.
- OTP expiry window controls.
- OTP resend cooldown controls.
- Maximum invalid OTP attempt controls.
- Password reset confirmation endpoint with strong password policy.
- Auth password update through Supabase admin API.
- Local users table password hash synchronization.

### Core Inventory Operations
- Product create, list, update, delete.
- Receipt create/list/detail/validate.
- Delivery create/list/detail/validate.
- Stock listing and adjustment workflows.
- Stock transfer execution.
- Move history visibility and tracking.

### Master Data and Admin
- Warehouse management APIs and screens.
- Location management APIs and screens.
- Admin-aware navigation rendering.

### UX and Frontend Experience
- Branded full-screen startup loader.
- Route transition loader bar and status chip.
- Global request activity loader from centralized API layer.
- Session-based splash behavior (first visit only).
- Responsive dashboard and management screens.

### Reliability and Runtime Quality
- API-level standardized error object handling.
- `Retry-After` aware client logic for rate-limited responses.
- Zustand selector stabilization to avoid render-loop regressions.
- Chart container sizing hardening for reliable rendering.

## API Surface

### Authentication Endpoints
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/reset-password`
- `POST /auth/reset-password/request`
- `POST /auth/reset-password/confirm`

### Published API Documentation
- Postman collection: https://documenter.getpostman.com/view/39189509/2sBXwjwtjw

### Domain Endpoint Groups
- `/products`
- `/receipts`
- `/deliveries`
- `/stock`
- `/warehouses`
- `/locations`

## Technology Stack
- Frontend: React, Vite, React Router, React Query, Zustand, Tailwind CSS v4
- Backend: Node.js, Express
- Auth and DB: Supabase
- Mail: Nodemailer + SMTP (Gmail App Password supported)

## Libraries (Exact)

### Frontend Runtime Dependencies
- `@supabase/supabase-js`
- `@tailwindcss/vite`
- `@tanstack/react-query`
- `@tanstack/react-table`
- `clsx`
- `lucide-react`
- `papaparse`
- `react`
- `react-countup`
- `react-dom`
- `react-is`
- `react-router-dom`
- `recharts`
- `tailwind-merge`
- `tailwindcss`
- `tailwindcss-animate`
- `zustand`

### Frontend Dev Dependencies
- `@eslint/js`
- `@types/react`
- `@types/react-dom`
- `@vitejs/plugin-react`
- `eslint`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `globals`
- `vite`

### Backend Dependencies
- `@supabase/supabase-js`
- `bcryptjs`
- `cors`
- `dotenv`
- `express`
- `jsonwebtoken`
- `nodemailer`

## Prerequisites
- Node.js 18 or newer
- Supabase project

## Environment Configuration

### Backend Environment (`server/.env`)
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

### Frontend Environment (`frontend/.env`)
```dotenv
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

## Local Development

### Install Dependencies
```bash
cd frontend
npm install

cd ../server
npm install
```

### Run Backend
```bash
cd server
npm run dev
```

### Run Frontend
```bash
cd frontend
npm run dev
```

### Build Frontend
```bash
cd frontend
npm run build
```

## Deployment

For complete production deployment steps (frontend + backend), see DEPLOYMENT.md at the repository root.

## Baseline Supabase Schema

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

## Operational Notes
- Custom OTP delivery depends on valid backend SMTP credentials.
- Signup confirmation mail behavior depends on Supabase Authentication email settings.
- For Gmail SMTP, always use an App Password and never your normal account password.
