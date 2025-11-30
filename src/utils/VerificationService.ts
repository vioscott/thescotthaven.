import { supabase } from './supabase';

export type VerificationType = 'identity' | 'property_ownership' | 'business_license';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type DocumentType =
    | 'id_card'
    | 'passport'
    | 'drivers_license'
    | 'property_deed'
    | 'property_title'
    | 'tax_document'
    | 'business_license'
    | 'business_registration'
    | 'other';

export interface Verification {
    id: string;
    user_id: string;
    verification_type: VerificationType;
    status: VerificationStatus;
    submitted_at: string;
    reviewed_at?: string;
    reviewed_by?: string;
    rejection_reason?: string;
    expires_at?: string;
    created_at: string;
    updated_at: string;
}

export interface VerificationDocument {
    id: string;
    verification_id: string;
    document_type: DocumentType;
    file_url: string;
    file_name: string;
    file_size?: number;
    uploaded_at: string;
}

export interface PropertyVerification {
    id: string;
    property_id: string;
    verification_id: string;
    verified_at: string;
}

export const VerificationService = {
    // Submit a new verification request
    async submitVerification(
        userId: string,
        verificationType: VerificationType
    ): Promise<Verification> {
        const { data, error } = await supabase
            .from('verifications')
            .insert({
                user_id: userId,
                verification_type: verificationType,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Upload verification document
    async uploadDocument(
        file: File,
        userId: string,
        verificationId: string,
        documentType: DocumentType
    ): Promise<VerificationDocument> {
        // Generate unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${verificationId}/${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('verification-documents')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('verification-documents')
            .getPublicUrl(fileName);

        // Save document record
        const { data, error } = await supabase
            .from('verification_documents')
            .insert({
                verification_id: verificationId,
                document_type: documentType,
                file_url: urlData.publicUrl,
                file_name: file.name,
                file_size: file.size
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get user's verifications
    async getUserVerifications(userId: string): Promise<Verification[]> {
        const { data, error } = await supabase
            .from('verifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Get verification by ID with documents
    async getVerificationWithDocuments(verificationId: string): Promise<{
        verification: Verification;
        documents: VerificationDocument[];
    } | null> {
        const { data: verification, error: verError } = await supabase
            .from('verifications')
            .select('*')
            .eq('id', verificationId)
            .single();

        if (verError) return null;

        const { data: documents, error: docError } = await supabase
            .from('verification_documents')
            .select('*')
            .eq('verification_id', verificationId);

        if (docError) return null;

        return {
            verification,
            documents: documents || []
        };
    },

    // Check if user is verified for a specific type
    async isUserVerified(userId: string, verificationType: VerificationType): Promise<boolean> {
        const { data, error } = await supabase
            .from('verifications')
            .select('status')
            .eq('user_id', userId)
            .eq('verification_type', verificationType)
            .eq('status', 'approved')
            .single();

        return !error && !!data;
    },

    // Get verification status for user
    async getVerificationStatus(
        userId: string,
        verificationType: VerificationType
    ): Promise<VerificationStatus | null> {
        const { data, error } = await supabase
            .from('verifications')
            .select('status')
            .eq('user_id', userId)
            .eq('verification_type', verificationType)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) return null;
        return data.status;
    },

    // ADMIN METHODS

    // Get all pending verifications
    async adminGetPendingVerifications(): Promise<Verification[]> {
        const { data, error } = await supabase
            .from('verifications')
            .select(`
        *,
        user:user_id(id, name, email, role)
      `)
            .eq('status', 'pending')
            .order('submitted_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    // Get all verifications (admin)
    async adminGetAllVerifications(status?: VerificationStatus): Promise<Verification[]> {
        let query = supabase
            .from('verifications')
            .select(`
        *,
        user:user_id(id, name, email, role)
      `);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query.order('submitted_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Approve verification (admin)
    async adminApproveVerification(
        verificationId: string,
        adminId: string
    ): Promise<void> {
        const { error } = await supabase
            .from('verifications')
            .update({
                status: 'approved',
                reviewed_at: new Date().toISOString(),
                reviewed_by: adminId
            })
            .eq('id', verificationId);

        if (error) throw error;
    },

    // Reject verification (admin)
    async adminRejectVerification(
        verificationId: string,
        adminId: string,
        reason: string
    ): Promise<void> {
        const { error } = await supabase
            .from('verifications')
            .update({
                status: 'rejected',
                reviewed_at: new Date().toISOString(),
                reviewed_by: adminId,
                rejection_reason: reason
            })
            .eq('id', verificationId);

        if (error) throw error;
    },

    // Link property to verification (admin)
    async adminLinkPropertyToVerification(
        propertyId: string,
        verificationId: string
    ): Promise<void> {
        const { error } = await supabase
            .from('property_verifications')
            .insert({
                property_id: propertyId,
                verification_id: verificationId
            });

        if (error) throw error;
    },

    // Check if property is verified
    async isPropertyVerified(propertyId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('property_verifications')
            .select('id')
            .eq('property_id', propertyId)
            .limit(1)
            .single();

        return !error && !!data;
    },

    // Get property verification details
    async getPropertyVerification(propertyId: string): Promise<PropertyVerification | null> {
        const { data, error } = await supabase
            .from('property_verifications')
            .select('*')
            .eq('property_id', propertyId)
            .single();

        if (error) return null;
        return data;
    }
};
