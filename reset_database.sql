-- ============================================
-- COMPLETE DATABASE RESET AND RECREATION
-- ============================================
-- WARNING: This will DELETE ALL DATA in your database!
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Drop all existing tables (CASCADE removes dependencies)
-- ============================================

DROP TABLE IF EXISTS public.browsing_history CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.inquiries CASCADE;
DROP TABLE IF EXISTS public.listing_images CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop any existing functions
DROP FUNCTION IF EXISTS get_user_favorites_count(UUID);
DROP FUNCTION IF EXISTS is_listing_favorited(UUID, UUID);

-- ============================================
-- STEP 2: Enable required extensions
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 3: Create users table
-- ============================================

CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('tenant', 'landlord', 'agent', 'admin')) DEFAULT 'tenant',
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- STEP 4: Create properties table
-- ============================================

CREATE TABLE public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('house', 'apartment', 'condo', 'studio', 'office', 'land', 'other')),
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'NGN',
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  zip TEXT,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  sqft INT,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('published', 'draft', 'archived')) DEFAULT 'draft',
  year_built INT,
  lot_size INT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  hoa_fees DECIMAL(10, 2) DEFAULT 0,
  video_tour_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- STEP 5: Create favorites table
-- ============================================

CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, listing_id)
);

-- ============================================
-- STEP 6: Create browsing_history table
-- ============================================

CREATE TABLE public.browsing_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- STEP 7: Create inquiries table
-- ============================================

CREATE TABLE public.inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  message TEXT NOT NULL,
  responded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- STEP 8: Create indexes
-- ============================================

-- Users indexes
CREATE INDEX users_email_idx ON public.users(email);

-- Properties indexes
CREATE INDEX properties_user_id_idx ON public.properties(user_id);
CREATE INDEX properties_city_idx ON public.properties(city);
CREATE INDEX properties_price_idx ON public.properties(price);
CREATE INDEX properties_status_idx ON public.properties(status);
CREATE INDEX properties_type_idx ON public.properties(type);
CREATE INDEX properties_bedrooms_idx ON public.properties(bedrooms);
CREATE INDEX properties_bathrooms_idx ON public.properties(bathrooms);
CREATE INDEX properties_year_built_idx ON public.properties(year_built);
CREATE INDEX properties_created_at_idx ON public.properties(created_at DESC);
CREATE INDEX properties_location_idx ON public.properties(latitude, longitude);

-- Favorites indexes
CREATE INDEX favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX favorites_listing_id_idx ON public.favorites(listing_id);
CREATE INDEX favorites_created_at_idx ON public.favorites(created_at DESC);

-- Browsing history indexes
CREATE INDEX browsing_history_user_id_idx ON public.browsing_history(user_id);
CREATE INDEX browsing_history_listing_id_idx ON public.browsing_history(listing_id);
CREATE INDEX browsing_history_viewed_at_idx ON public.browsing_history(viewed_at DESC);

-- Inquiries indexes
CREATE INDEX inquiries_listing_id_idx ON public.inquiries(listing_id);

-- ============================================
-- STEP 9: Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.browsing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 10: Create RLS Policies for users
-- ============================================

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- STEP 11: Create RLS Policies for properties
-- ============================================

-- Public can view published properties
CREATE POLICY "Published properties are viewable by everyone" ON public.properties
  FOR SELECT USING (status = 'published');

-- Users can view their own properties (any status)
CREATE POLICY "Users can view their own properties" ON public.properties
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own properties
CREATE POLICY "Users can insert their own properties" ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own properties
CREATE POLICY "Users can update their own properties" ON public.properties
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own properties
CREATE POLICY "Users can delete their own properties" ON public.properties
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all properties
CREATE POLICY "Admins can view all properties" ON public.properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Admins can update any property
CREATE POLICY "Admins can update any property" ON public.properties
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- STEP 12: Create RLS Policies for favorites
-- ============================================

CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 13: Create RLS Policies for browsing_history
-- ============================================

CREATE POLICY "Users can view their own browsing history" ON public.browsing_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own browsing history" ON public.browsing_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own browsing history" ON public.browsing_history
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 14: Create RLS Policies for inquiries
-- ============================================

-- Public can insert inquiries
CREATE POLICY "Anyone can create inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (true);

-- Property owners can view inquiries for their properties
CREATE POLICY "Property owners can view inquiries for their properties" ON public.inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = inquiries.listing_id
      AND properties.user_id = auth.uid()
    )
  );

-- ============================================
-- STEP 15: Create helper functions
-- ============================================

-- Function to get user's favorite count
CREATE OR REPLACE FUNCTION get_user_favorites_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.favorites WHERE user_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to check if a listing is favorited by a user
CREATE OR REPLACE FUNCTION is_listing_favorited(user_uuid UUID, listing_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.favorites 
    WHERE user_id = user_uuid AND listing_id = listing_uuid
  );
$$ LANGUAGE SQL STABLE;

-- ============================================
-- VERIFICATION
-- ============================================

-- Run these queries to verify the schema was created successfully:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties';
-- SELECT * FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users';
