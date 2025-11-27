import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tenant' | 'landlord' | 'agent' | 'admin';
  isAdmin: boolean;
  avatar_url?: string;
  createdAt: string;
}

export interface StoredProperty {
  id: string;
  userId: string;
  title: string;
  type: 'house' | 'apartment' | 'condo' | 'studio' | 'office' | 'land' | 'other';
  price: number;
  currency: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description: string;
  images: string[];
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
}

export interface Inquiry {
  id: string;
  listingId: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
  responded: boolean;
  createdAt: string;
}



export const storage = {
  // User methods (mostly handled by AuthContext now, but keeping for compat if needed)
  getUserByEmail: async (email: string) => {
    // This is now handled by Supabase Auth, but we might need to fetch profile
    const { data } = await supabase.from('users').select('*').eq('email', email).single();
    return data;
  },

  // Property methods
  getProperties: async (): Promise<StoredProperty[]> => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
      return [];
    }

    return (data || []).map(mapPropertyFromDB);
  },

  getProperty: async (id: string): Promise<StoredProperty | null> => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return mapPropertyFromDB(data);
  },

  getUserProperties: async (userId: string): Promise<StoredProperty[]> => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(mapPropertyFromDB);
  },

  addProperty: async (property: Omit<StoredProperty, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('properties')
      .insert([{
        user_id: property.userId,
        title: property.title,
        type: property.type,
        price: property.price,
        currency: property.currency,
        address: property.address,
        city: property.city,
        state: property.state,
        zip: property.zip,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        sqft: property.sqft,
        description: property.description,
        images: property.images,
        status: property.status
      }])
      .select()
      .single();

    if (error) throw error;
    return mapPropertyFromDB(data);
  },

  deleteProperty: async (id: string) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Inquiry methods
  addInquiry: async (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'responded'>) => {
    const { error } = await supabase
      .from('inquiries')
      .insert([{
        listing_id: inquiry.listingId,
        sender_name: inquiry.senderName,
        sender_email: inquiry.senderEmail,
        sender_phone: inquiry.senderPhone,
        message: inquiry.message
      }]);

    if (error) throw error;
  },

  getListingInquiries: async (listingId: string): Promise<Inquiry[]> => {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(mapInquiryFromDB);
  },

  // Admin methods
  getAllProperties: async (): Promise<StoredProperty[]> => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(mapPropertyFromDB);
  },

  updatePropertyStatus: async (id: string, status: 'published' | 'draft' | 'archived') => {
    const { error } = await supabase
      .from('properties')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },

  getAllUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];

    return (data || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isAdmin: u.role === 'admin',
      createdAt: u.created_at
    }));
  },

  getAgents: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'agent')
      .order('name', { ascending: true });

    if (error) return [];

    return (data || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isAdmin: u.role === 'admin',
      createdAt: u.created_at
    }));
  },

  // Favorites methods
  addFavorite: async (userId: string, listingId: string) => {
    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, listing_id: listingId }]);

    if (error) throw error;
  },

  removeFavorite: async (userId: string, listingId: string) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId);

    if (error) throw error;
  },

  getUserFavorites: async (userId: string): Promise<StoredProperty[]> => {
    const { data, error } = await supabase
      .from('favorites')
      .select('listing_id, properties(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || [])
      .map((fav: any) => fav.properties)
      .filter(Boolean)
      .map(mapPropertyFromDB);
  },

  isFavorite: async (userId: string, listingId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .single();

    return !error && !!data;
  },

  // Browsing history methods
  addBrowsingHistory: async (userId: string, listingId: string) => {
    // Only add if user is logged in
    if (!userId) return;

    const { error } = await supabase
      .from('browsing_history')
      .insert([{ user_id: userId, listing_id: listingId }]);

    if (error) console.error('Error adding browsing history:', error);
  },

  getBrowsingHistory: async (userId: string, limit: number = 10): Promise<StoredProperty[]> => {
    const { data, error } = await supabase
      .from('browsing_history')
      .select('listing_id, properties(*)')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(limit);

    if (error) return [];

    // Remove duplicates (keep most recent)
    const seen = new Set<string>();
    return (data || [])
      .map((history: any) => history.properties)
      .filter(Boolean)
      .filter((prop: any) => {
        if (seen.has(prop.id)) return false;
        seen.add(prop.id);
        return true;
      })
      .map(mapPropertyFromDB);
  },

  // Property update method
  updateProperty: async (id: string, updates: Partial<StoredProperty>) => {
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };

    // Map camelCase to snake_case
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.state !== undefined) dbUpdates.state = updates.state;
    if (updates.zip !== undefined) dbUpdates.zip = updates.zip;
    if (updates.bedrooms !== undefined) dbUpdates.bedrooms = updates.bedrooms;
    if (updates.bathrooms !== undefined) dbUpdates.bathrooms = updates.bathrooms;
    if (updates.sqft !== undefined) dbUpdates.sqft = updates.sqft;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase
      .from('properties')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  // Get similar properties
  getSimilarProperties: async (propertyId: string, limit: number = 4): Promise<StoredProperty[]> => {
    // First get the current property
    const property = await storage.getProperty(propertyId);
    if (!property) return [];

    // Find similar properties: same type, same city, similar price (±20%)
    const minPrice = property.price * 0.8;
    const maxPrice = property.price * 1.2;

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('type', property.type)
      .eq('city', property.city)
      .eq('status', 'published')
      .neq('id', propertyId)
      .gte('price', minPrice)
      .lte('price', maxPrice)
      .limit(limit);

    if (error) return [];
    return (data || []).map(mapPropertyFromDB);
  }

};

// Helper to map DB snake_case to frontend camelCase
function mapPropertyFromDB(dbProp: any): StoredProperty {
  return {
    id: dbProp.id,
    userId: dbProp.user_id,
    title: dbProp.title,
    type: dbProp.type,
    price: dbProp.price,
    currency: dbProp.currency || 'NGN',
    address: dbProp.address,
    city: dbProp.city,
    state: dbProp.state,
    zip: dbProp.zip,
    bedrooms: dbProp.bedrooms,
    bathrooms: dbProp.bathrooms,
    sqft: dbProp.sqft,
    description: dbProp.description,
    images: dbProp.images || [],
    status: dbProp.status,
    createdAt: dbProp.created_at
  };
}

function mapInquiryFromDB(dbInq: any): Inquiry {
  return {
    id: dbInq.id,
    listingId: dbInq.listing_id,
    senderName: dbInq.sender_name,
    senderEmail: dbInq.sender_email,
    senderPhone: dbInq.sender_phone,
    message: dbInq.message,
    responded: dbInq.responded || false,
    createdAt: dbInq.created_at
  };
}