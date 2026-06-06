-- ============================================
-- Made Products Catalog - Supabase SQL Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- NOTE: Prisma manages the actual table creation
-- via `prisma db push`. This file contains the
-- Supabase-specific RLS policies and helpers.
-- ============================================

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_slabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Service role has full access (for server-side operations)
CREATE POLICY "Service role full access to users"
ON users FOR ALL
USING (auth.role() = 'service_role');

-- Users can read their own record
CREATE POLICY "Users can read own record"
ON users FOR SELECT
USING (supabase_id = auth.uid()::text);

-- ============================================
-- CATEGORIES TABLE POLICIES
-- ============================================

-- All authenticated users can read categories
CREATE POLICY "Authenticated users can read categories"
ON categories FOR SELECT
USING (auth.role() = 'authenticated');

-- Only service role (server actions) can modify
CREATE POLICY "Service role can manage categories"
ON categories FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- PRODUCTS TABLE POLICIES
-- ============================================

-- All authenticated users can read products
CREATE POLICY "Authenticated users can read products"
ON products FOR SELECT
USING (auth.role() = 'authenticated');

-- Only service role can modify
CREATE POLICY "Service role can manage products"
ON products FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- PRODUCT IMAGES TABLE POLICIES
-- ============================================

CREATE POLICY "Authenticated users can read images"
ON product_images FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage images"
ON product_images FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- PRICE SLABS TABLE POLICIES
-- ============================================

CREATE POLICY "Authenticated users can read price slabs"
ON price_slabs FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage price slabs"
ON price_slabs FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- PRICE HISTORY TABLE POLICIES
-- ============================================

CREATE POLICY "Service role can manage price history"
ON price_history FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- SETTINGS TABLE POLICIES
-- ============================================

CREATE POLICY "Authenticated users can read settings"
ON settings FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage settings"
ON settings FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- STORAGE POLICIES (for product-images bucket)
-- ============================================

-- Create storage bucket (if using SQL)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('product-images', 'product-images', true)
-- ON CONFLICT DO NOTHING;

-- Allow authenticated users to read images
CREATE POLICY "Public read access to product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

-- ============================================
-- HELPER FUNCTION: Get current user role
-- ============================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
  SELECT role FROM users WHERE supabase_id = auth.uid()::text;
$$ LANGUAGE sql SECURITY DEFINER;
