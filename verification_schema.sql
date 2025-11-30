-- ============================================
-- VERIFICATION SYSTEM SCHEMA
-- Identity, Property Ownership, and Business License Verification
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create verification status enum
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE verification_type AS ENUM ('identity', 'property_ownership', 'business_license');
CREATE TYPE document_type AS ENUM (
  'id_card', 
  'passport', 
  'drivers_license', 
  'property_deed', 
  'property_title',
  'tax_document', 
  'business_license', 
  'business_registration',
  'other'
);

-- 2. Create verifications table
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type verification_type NOT NULL,
  status verification_status DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create verification_documents table
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create property_verifications junction table
CREATE TABLE IF NOT EXISTS public.property_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(property_id, verification_id)
);

-- 5. Add verification fields to users table
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS identity_verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS business_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS business_verified_at TIMESTAMP WITH TIME ZONE;

-- 6. Add verification fields to properties table
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS ownership_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ownership_verified_at TIMESTAMP WITH TIME ZONE;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS verifications_user_id_idx ON public.verifications(user_id);
CREATE INDEX IF NOT EXISTS verifications_status_idx ON public.verifications(status);
CREATE INDEX IF NOT EXISTS verifications_type_idx ON public.verifications(verification_type);
CREATE INDEX IF NOT EXISTS verification_documents_verification_id_idx ON public.verification_documents(verification_id);
CREATE INDEX IF NOT EXISTS property_verifications_property_id_idx ON public.property_verifications(property_id);

-- 8. Enable RLS on all tables
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_verifications ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for verifications table

-- Users can view their own verifications
DROP POLICY IF EXISTS "Users can view their own verifications" ON public.verifications;
CREATE POLICY "Users can view their own verifications" ON public.verifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own verifications
DROP POLICY IF EXISTS "Users can create verifications" ON public.verifications;
CREATE POLICY "Users can create verifications" ON public.verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all verifications
DROP POLICY IF EXISTS "Admins can view all verifications" ON public.verifications;
CREATE POLICY "Admins can view all verifications" ON public.verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Admins can update verifications
DROP POLICY IF EXISTS "Admins can update verifications" ON public.verifications;
CREATE POLICY "Admins can update verifications" ON public.verifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 10. RLS Policies for verification_documents table

-- Users can view their own verification documents
DROP POLICY IF EXISTS "Users can view their own documents" ON public.verification_documents;
CREATE POLICY "Users can view their own documents" ON public.verification_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.verifications
      WHERE verifications.id = verification_documents.verification_id
      AND verifications.user_id = auth.uid()
    )
  );

-- Users can upload documents to their own verifications
DROP POLICY IF EXISTS "Users can upload documents" ON public.verification_documents;
CREATE POLICY "Users can upload documents" ON public.verification_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.verifications
      WHERE verifications.id = verification_documents.verification_id
      AND verifications.user_id = auth.uid()
    )
  );

-- Admins can view all documents
DROP POLICY IF EXISTS "Admins can view all documents" ON public.verification_documents;
CREATE POLICY "Admins can view all documents" ON public.verification_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 11. RLS Policies for property_verifications table

-- Anyone can view property verifications (to show verified badge)
DROP POLICY IF EXISTS "Anyone can view property verifications" ON public.property_verifications;
CREATE POLICY "Anyone can view property verifications" ON public.property_verifications
  FOR SELECT USING (true);

-- Only admins can create property verifications
DROP POLICY IF EXISTS "Admins can create property verifications" ON public.property_verifications;
CREATE POLICY "Admins can create property verifications" ON public.property_verifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 12. Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 13. Storage policies for verification documents

-- Users can upload to their own folder
DROP POLICY IF EXISTS "Users can upload verification documents" ON storage.objects;
CREATE POLICY "Users can upload verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own documents
DROP POLICY IF EXISTS "Users can view their own verification documents" ON storage.objects;
CREATE POLICY "Users can view their own verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all verification documents
DROP POLICY IF EXISTS "Admins can view all verification documents" ON storage.objects;
CREATE POLICY "Admins can view all verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 14. Create function to update user verification status
CREATE OR REPLACE FUNCTION update_user_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if status changed to approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Update user table based on verification type
    IF NEW.verification_type = 'identity' THEN
      UPDATE public.users
      SET identity_verified = true,
          identity_verified_at = now()
      WHERE id = NEW.user_id;
    ELSIF NEW.verification_type = 'business_license' THEN
      UPDATE public.users
      SET business_verified = true,
          business_verified_at = now()
      WHERE id = NEW.user_id;
    END IF;
    
    -- Set expiration date (1 year from approval)
    NEW.expires_at = now() + INTERVAL '1 year';
  END IF;
  
  -- If rejected or expired, remove verification status
  IF NEW.status IN ('rejected', 'expired') THEN
    IF NEW.verification_type = 'identity' THEN
      UPDATE public.users
      SET identity_verified = false,
          identity_verified_at = NULL
      WHERE id = NEW.user_id;
    ELSIF NEW.verification_type = 'business_license' THEN
      UPDATE public.users
      SET business_verified = false,
          business_verified_at = NULL
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Create trigger for user verification status
DROP TRIGGER IF EXISTS verification_status_trigger ON public.verifications;
CREATE TRIGGER verification_status_trigger
  BEFORE UPDATE ON public.verifications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_user_verification_status();

-- 16. Create function to update property verification status
CREATE OR REPLACE FUNCTION update_property_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all properties linked to this verification
  UPDATE public.properties
  SET ownership_verified = true,
      ownership_verified_at = now()
  WHERE id IN (
    SELECT property_id 
    FROM public.property_verifications 
    WHERE verification_id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Create trigger for property verification
DROP TRIGGER IF EXISTS property_verification_trigger ON public.property_verifications;
CREATE TRIGGER property_verification_trigger
  AFTER INSERT ON public.property_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_property_verification_status();

-- 18. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.verifications TO authenticated;
GRANT ALL ON public.verification_documents TO authenticated;
GRANT ALL ON public.property_verifications TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_verification_status() TO authenticated;
GRANT EXECUTE ON FUNCTION update_property_verification_status() TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Verification system schema created successfully!';
  RAISE NOTICE 'Tables: verifications, verification_documents, property_verifications';
  RAISE NOTICE 'Storage bucket: verification-documents';
  RAISE NOTICE 'Users and properties tables updated with verification fields';
END $$;
