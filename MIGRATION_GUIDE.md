# Supabase Database Migration Guide

This guide will help you set up your Supabase database for the Hovallo application.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com if you don't have one)
2. A Supabase project created

## Step 1: Access Your Supabase Project

1. Go to https://app.supabase.com
2. Select your project (or create a new one)
3. Navigate to the **SQL Editor** from the left sidebar

## Step 2: Run the Schema Migration

1. In the SQL Editor, click **"New Query"**
2. Copy the entire contents of `supabase_schema.sql` from this project
3. Paste it into the SQL Editor
4. Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

The script will create:
- `users` table (with role-based access)
- `properties` table (for listings)
- `property_images` table (for multiple images per property)
- `inquiries` table (for contact messages)
- Necessary indexes for performance
- Row Level Security (RLS) policies

## Step 3: Verify the Migration

After running the script, verify the tables were created:

1. Go to **Table Editor** in the left sidebar
2. You should see 4 tables:
   - `users`
   - `properties`
   - `property_images`
   - `inquiries`

## Step 4: Get Your API Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 5: Configure Your Application

Create a `.env` file in your project root with:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 6: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Troubleshooting

### Error: "relation already exists"
- This means the tables are already created. You can skip this step or drop the tables first.

### Error: "permission denied"
- Make sure you're using the SQL Editor in your Supabase dashboard, not a local SQL client.

### Tables not showing up
- Refresh the Table Editor page
- Check the SQL Editor for any error messages

## Next Steps

Once the migration is complete:
1. Create an admin user by signing up through the app
2. Manually update the user's role to 'admin' in the Supabase Table Editor
3. Test creating listings, browsing, and the admin panel

## Optional: Create Test Data

You can add some test data by running additional SQL queries in the SQL Editor. Example:

```sql
-- Insert a test landlord user (password will need to be set via Supabase Auth)
INSERT INTO users (id, email, name, role, created_at)
VALUES (
  'test-landlord-id',
  'landlord@test.com',
  'Test Landlord',
  'landlord',
  NOW()
);

-- Insert a test property
INSERT INTO properties (
  user_id, title, type, price, currency,
  address, city, state, zip,
  bedrooms, bathrooms, sqft,
  description, images, status
)
VALUES (
  'test-landlord-id',
  'Beautiful 3BR Apartment',
  'apartment',
  500000,
  'NGN',
  '123 Main Street',
  'Lagos',
  'Lagos State',
  '100001',
  3,
  2,
  1200,
  'A beautiful apartment in the heart of Lagos',
  ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'],
  'published'
);
```
