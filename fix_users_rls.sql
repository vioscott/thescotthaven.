-- ============================================
-- FIX RLS POLICIES FOR USERS TABLE
-- ============================================
-- This fixes authentication errors caused by missing RLS policies
-- Error: "new row violates row-level security policy for table users"

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile (needed for signup and OAuth)
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Optional: Allow admins to view all users
-- Uncomment if you need admin access
-- CREATE POLICY "Admins can view all users" ON public.users
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM public.users
--       WHERE users.id = auth.uid()
--       AND users.role = 'admin'
--     )
--   );
