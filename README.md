# CoreInventory

A complete Inventory Management System replacing manual stock tracking with a centralized, real-time application.

## Minimum Requirements
- Node.js (v18+)
- Postgres Database (Supabase)

## Environment Variables
Before running the application, make sure to set up your environment variables.

### Backend (`server/.env`)
Create a `.env` file in the `server` directory using the provided `.env.example`:
```
PORT=5000
JWT_SECRET=super_secret_string
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend` directory:
```
VITE_API_URL=http://localhost:5000
```

## Setup & Running

**1. Install Dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd server
npm install
```

**2. Run the Servers**
```bash
# Frontend
npm run dev

# Backend
npm run dev
```

## Supabase Schema Requirements

To ensure the backend works seamlessly, run the following SQL queries in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  login_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Products
CREATE TABLE products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  category text,
  unit text,
  price numeric(10,2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Warehouses
CREATE TABLE warehouses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text,
  code text,
  address text
);

-- Locations
CREATE TABLE locations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text,
  short_code text,
  warehouse_id uuid REFERENCES warehouses(id)
);

-- Stock
CREATE TABLE stock (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  location_id uuid REFERENCES locations(id),
  quantity numeric DEFAULT 0
);

-- Receipts
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

-- Deliveries
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

-- Stock Moves
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

## Features Complete:
- Authentication Flow (Login ID/Passwords matching Supabase backend hashing logic)
- Dashboard KPIs & Overview
- Products Management
- Receipts workflows (Draft -> Done functionality and dynamic inventory adjustment)
- Delivery workflows (Draft -> Done functionality and stock deduction)
- Stock overrides and manual physical counting adjust
- Move History tracking with specific references
- Settings & App Nav (Sidebar/Navbar)
- React Query integrations
- Tailwind CSS v4 custom theme with specific minimal industrial design elements requested.
