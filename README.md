# Made Products Catalog — Setup & Deployment Guide

## Overview

**Made Products Catalog** is a production-ready Progressive Web App for paper bag manufacturers. It provides:

- **Admin**: Full product, category, employee, and pricing management
- **Employee**: Browse, search, filter products and share via WhatsApp
- **PWA**: Installable on Android, iPhone, desktop like a native app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React, TypeScript, Tailwind CSS |
| Auth | Supabase Auth (email/password only) |
| Database | Supabase PostgreSQL via Prisma ORM |
| Storage | Supabase Storage (product images) |
| Deployment | Vercel |
| PWA | next-pwa, Web App Manifest, Service Worker |

---

## Step 1: Supabase Project Setup

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose your region (ap-south-1 for India)
3. Note your **Project URL** and **API Keys**

### 1.2 Create Admin User

In Supabase Dashboard → **Authentication → Users → Add User**:

```
Email: xxxxx
Password: xxxx
Auto-confirm: ✓
```

### 1.3 Create Storage Bucket

In Supabase Dashboard → **Storage → New Bucket**:
- Name: `product-images`
- Public bucket: ✓ (so images are publicly accessible)

Add storage policy for authenticated uploads:
```sql
-- In Supabase SQL Editor:
CREATE POLICY "Admins can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Images are publicly readable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can delete images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);
```

### 1.4 Configure Auth Settings

In Supabase Dashboard → **Authentication → Settings**:
- Disable email confirmation (for easier testing) OR keep enabled for production
- Set Site URL: `https://your-app.vercel.app`
- Add redirect URLs: `https://your-app.vercel.app/**`

---

## Step 2: Local Development Setup

### 2.1 Clone and Install

```bash
git clone <your-repo-url>
cd made-products-catalog
npm install
```

### 2.2 Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres.[ref]:[pass]@pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[pass]@pooler.supabase.com:5432/postgres
```

> **Get your connection strings**: Supabase Dashboard → Settings → Database → Connection string (choose "Transaction" for DATABASE_URL, "Session" for DIRECT_URL)

### 2.3 Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Open Prisma Studio to view data
npm run db:studio
```

### 2.4 Create Admin User in Database

After creating the user in Supabase Auth (Step 1.2), link it in the database:

```bash
# In Prisma Studio (npm run db:studio) or Supabase SQL Editor:
```

```sql
-- Replace 'SUPABASE_USER_ID' with the actual UUID from Supabase Auth → Users
INSERT INTO users (id, supabase_id, name, email, role, active, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'SUPABASE_USER_ID_HERE',
  'Admin User',
  'admin@madeproducts.com',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
```

### 2.5 Seed Sample Data

```bash
npm run db:seed
```

This creates:
- 10 product categories
- 8 sample products with realistic specs and pricing
- Company settings

### 2.6 Run Development Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## Step 3: Deploy to Vercel

### 3.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/made-products-catalog
git push -u origin main
```

### 3.2 Create Vercel Project

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Add environment variables (same as `.env.local`):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `DATABASE_URL` | Transaction pooler URL |
| `DIRECT_URL` | Session pooler URL |

5. Click **Deploy**

### 3.3 Update Supabase Auth

After deployment, update in Supabase → Authentication → Settings:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

---

## Step 4: Post-Deployment

### Run Database Migrations on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Run db push against production
vercel env pull .env.production.local
npx prisma db push --schema=./prisma/schema.prisma
```

### Seed Production Data

```bash
# Set DATABASE_URL to production
DATABASE_URL=<prod-url> npm run db:seed
```

---

## PWA Installation

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the banner "Add to Home Screen" OR
3. Menu (⋮) → "Add to Home Screen"

### iPhone (Safari)
1. Open the app URL in Safari
2. Tap Share button (□↑)
3. Tap "Add to Home Screen"

### Desktop (Chrome/Edge)
1. Open the app URL
2. Click the install icon (⊕) in the address bar

---

## User Roles

### Admin
- Login at `/auth/login`
- Access full dashboard with sidebar navigation
- Manage products, categories, employees, pricing, settings

### Employee
- Login at `/auth/login`  
- View/search/filter products
- Share product details via WhatsApp
- Cannot edit any data

---

## Creating Employees (Admin)

1. Login as admin
2. Go to **Employees** in sidebar
3. Click **Add Employee**
4. Enter name, email, password
5. The system creates both a Supabase Auth user AND a database record automatically

---

## Adding Product Images

1. Create a product first (fills in basic info + save)
2. Go to the product's edit page
3. Click the upload area to add images
4. Images are stored in Supabase Storage

---

## WhatsApp Sharing Format

When employees share a product, the message looks like:

```
*MADE PRODUCTS*

*WHITE KRAFT LUXURY BAG*

📐 *Size:* 12 x 15 x 5 Inch
📦 *Material:* 120 GSM White Kraft Paper
🖐 *Handle:* Twisted Handle
📊 *MOQ:* 500 Pieces

*💰 Pricing:*
• 500 Nos — ₹11.50
• 1000 Nos — ₹10.80
• 5000 Nos — ₹9.90

*📞 For Enquiry:*
wa.me/919876543210

For bulk orders & custom printing, contact us!
```

Customize the footer and WhatsApp number in **Settings**.

---

## Database Schema Summary

```
users          → Supabase auth users with roles
categories     → Product categories
products       → Full product specs (width, height, GSM, etc.)
product_images → Multiple images per product (Supabase Storage URLs)
price_slabs    → Quantity-based pricing tiers per product
price_history  → Audit log of all price changes
settings       → Company info and sharing preferences
```

---

## Security

- **Authentication**: Supabase JWT, verified server-side on every request
- **Authorization**: Role checked in every Server Action (`getCurrentUser()`)
- **Routes**: Middleware protects all `/dashboard/**` routes
- **Employee restrictions**: Can only read; all write operations check `role === 'ADMIN'`
- **Image uploads**: Only admins can upload/delete via server-side API route
- **No public registration**: Only admins can create employee accounts

---

## Troubleshooting

### "Invalid credentials" on login
- Ensure the Supabase user exists in **both** Supabase Auth AND the `users` database table
- Check that `active = true` in the database

### Images not loading
- Verify the `product-images` bucket is set to **Public**
- Check the storage RLS policies are applied

### "Unauthorized" on employee actions
- The logged-in user's `role` in the database must be `'ADMIN'`

### PWA not installing
- Must be served over HTTPS (Vercel provides this automatically)
- Check browser DevTools → Application → Manifest for errors

---

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to DB
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Seed sample data
```

---

Built with ❤️ for Made Products
