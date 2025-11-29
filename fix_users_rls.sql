-- Allow authenticated users to view all profiles (needed for chat)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

CREATE POLICY "Authenticated users can view all profiles" ON public.users
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );
