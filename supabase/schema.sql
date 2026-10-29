-- ========================================================
-- YearInvo Supabase PostgreSQL Database Schema
-- Run this script in: https://supabase.com/dashboard/project/rsacszkrsvktlzktdimp/sql
-- ========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users & Stores Profile Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  brand_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'owner',
  plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  billing_duration TEXT DEFAULT 'monthly',
  currency TEXT DEFAULT 'BDT',
  business_type TEXT DEFAULT 'retail',
  store_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products Table (Inventory & POS)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  category TEXT,
  buy_price NUMERIC(12,2) DEFAULT 0,
  sell_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  min_stock NUMERIC(12,2) DEFAULT 5,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  total_purchases NUMERIC(12,2) DEFAULT 0,
  total_due NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  total_supplied NUMERIC(12,2) DEFAULT 0,
  total_due NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Sales / Invoices Table
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invoice_no TEXT NOT NULL,
  customer_id TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) DEFAULT 0,
  vat NUMERIC(12,2) DEFAULT 0,
  grand_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_amount NUMERIC(12,2) DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  cashier_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Purchases Table
CREATE TABLE IF NOT EXISTS public.purchases (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invoice_no TEXT NOT NULL,
  supplier_id TEXT,
  supplier_name TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_amount NUMERIC(12,2) DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  date TIMESTAMPTZ DEFAULT NOW(),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Online Orders Table (E-commerce / Online Business Mode)
CREATE TABLE IF NOT EXISTS public.online_orders (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_no TEXT NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_charge NUMERIC(12,2) DEFAULT 0,
  discount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  due_amount NUMERIC(12,2) DEFAULT 0,
  payment_method TEXT DEFAULT 'cod',
  order_status TEXT DEFAULT 'pending',
  tracking_code TEXT,
  courier_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  owner_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'cashier',
  permissions JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Subscription Requests Table
CREATE TABLE IF NOT EXISTS public.subscription_requests (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL,
  email TEXT,
  requested_plan TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  payment_method TEXT,
  payment_provider TEXT,
  payment_region TEXT,
  transaction_id TEXT,
  amount NUMERIC(12,2),
  currency TEXT DEFAULT 'BDT',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

-- 14. Add Permissive RLS Policies for Supabase anon/authenticated client
CREATE POLICY "Public & Auth Full Access users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public & Auth Full Access categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public & Auth Full Access products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public & Auth Full Access customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public & Auth Full Access suppliers" ON public.suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public & Auth Full Access sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public & Auth Full Access purchases" ON public.purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public & Auth Full Access expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public & Auth Full Access online_orders" ON public.online_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public & Auth Full Access team_members" ON public.team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public & Auth Full Access subscription_requests" ON public.subscription_requests FOR ALL USING (true) WITH CHECK (true);
