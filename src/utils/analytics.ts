import { supabase } from './supabase';
import { StoredProperty } from './storage';

export interface PropertyView {
    id: string;
    propertyId: string;
    viewedAt: string;
    viewerCity?: string;
    viewerState?: string;
}

export interface ViewStats {
    totalViews: number;
    viewsByDate: { date: string; count: number }[];
    uniqueCities: number;
}

export interface ConversionMetrics {
    totalViews: number;
    totalInquiries: number;
    conversionRate: number;
    averageConversionRate: number;
}

export interface PriceComparison {
    yourPrice: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    similarProperties: {
        id: string;
        title: string;
        price: number;
        city: string;
    }[];
}

export interface ListingTiming {
    month: number;
    monthName: string;
    inquiryRate: number;
    averageViews: number;
}

export interface GeographicDemand {
    city: string;
    state: string;
    activeListings: number;
    totalInquiries: number;
    totalViews: number;
    demandScore: number;
}

/**
 * Track a property view
 */
export async function trackPropertyView(
    propertyId: string,
    metadata?: { city?: string; state?: string }
): Promise<void> {
    try {
        const { error } = await supabase
            .from('property_views')
            .insert([{
                property_id: propertyId,
                viewer_city: metadata?.city,
                viewer_state: metadata?.state
            }]);

        if (error) {
            console.error('Error tracking property view:', error);
        }
    } catch (err) {
        console.error('Failed to track property view:', err);
    }
}

/**
 * Get view statistics for a property
 */
export async function getPropertyViewStats(
    propertyId: string,
    dateRange?: { start: Date; end: Date }
): Promise<ViewStats> {
    try {
        let query = supabase
            .from('property_views')
            .select('*')
            .eq('property_id', propertyId);

        if (dateRange) {
            query = query
                .gte('viewed_at', dateRange.start.toISOString())
                .lte('viewed_at', dateRange.end.toISOString());
        }

        const { data, error } = await query.order('viewed_at', { ascending: true });

        if (error) {
            console.error('Error fetching view stats:', error);
            return { totalViews: 0, viewsByDate: [], uniqueCities: 0 };
        }

        // Aggregate views by date
        const viewsByDate = aggregateViewsByDate(data || []);

        // Count unique cities
        const uniqueCities = new Set(
            (data || [])
                .map(v => v.viewer_city)
                .filter(Boolean)
        ).size;

        return {
            totalViews: data?.length || 0,
            viewsByDate,
            uniqueCities
        };
    } catch (err) {
        console.error('Failed to get view stats:', err);
        return { totalViews: 0, viewsByDate: [], uniqueCities: 0 };
    }
}

/**
 * Calculate inquiry conversion rate for a property
 */
export async function getInquiryConversionRate(
    propertyId: string
): Promise<ConversionMetrics> {
    try {
        // Get total views
        const { data: views } = await supabase
            .from('property_views')
            .select('id', { count: 'exact' })
            .eq('property_id', propertyId);

        // Get total inquiries
        const { data: inquiries } = await supabase
            .from('inquiries')
            .select('id', { count: 'exact' })
            .eq('listing_id', propertyId);

        const totalViews = views?.length || 0;
        const totalInquiries = inquiries?.length || 0;
        const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;

        // Calculate average conversion rate across all properties (for comparison)
        const { data: allViews } = await supabase
            .from('property_views')
            .select('property_id');

        const { data: allInquiries } = await supabase
            .from('inquiries')
            .select('listing_id');

        const avgConversionRate =
            (allViews?.length || 0) > 0
                ? ((allInquiries?.length || 0) / (allViews?.length || 0)) * 100
                : 0;

        return {
            totalViews,
            totalInquiries,
            conversionRate,
            averageConversionRate: avgConversionRate
        };
    } catch (err) {
        console.error('Failed to get conversion metrics:', err);
        return {
            totalViews: 0,
            totalInquiries: 0,
            conversionRate: 0,
            averageConversionRate: 0
        };
    }
}

/**
 * Get price comparison with similar properties
 */
export async function getPriceComparison(
    property: StoredProperty
): Promise<PriceComparison> {
    try {
        // Find similar properties (same type, city, similar bedrooms)
        const { data: similarProps, error } = await supabase
            .from('properties')
            .select('id, title, price, city, type, bedrooms')
            .eq('type', property.type)
            .eq('city', property.city)
            .eq('status', 'published')
            .neq('id', property.id)
            .gte('bedrooms', Math.max(0, property.bedrooms - 1))
            .lte('bedrooms', property.bedrooms + 1)
            .limit(10);

        if (error) {
            console.error('Error fetching similar properties:', error);
            return {
                yourPrice: property.price,
                averagePrice: property.price,
                minPrice: property.price,
                maxPrice: property.price,
                similarProperties: []
            };
        }

        const prices = (similarProps || []).map(p => p.price);

        if (prices.length === 0) {
            return {
                yourPrice: property.price,
                averagePrice: property.price,
                minPrice: property.price,
                maxPrice: property.price,
                similarProperties: []
            };
        }

        const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        return {
            yourPrice: property.price,
            averagePrice,
            minPrice,
            maxPrice,
            similarProperties: (similarProps || []).map(p => ({
                id: p.id,
                title: p.title,
                price: p.price,
                city: p.city
            }))
        };
    } catch (err) {
        console.error('Failed to get price comparison:', err);
        return {
            yourPrice: property.price,
            averagePrice: property.price,
            minPrice: property.price,
            maxPrice: property.price,
            similarProperties: []
        };
    }
}

/**
 * Get listing timing analysis
 */
export async function getListingTimingAnalysis(
    city?: string,
    state?: string,
    propertyType?: string
): Promise<ListingTiming[]> {
    try {
        // Get all inquiries with their creation dates
        let query = supabase
            .from('inquiries')
            .select('created_at, listing_id');

        const { data: inquiries } = await query;

        if (!inquiries || inquiries.length === 0) {
            return [];
        }

        // Group by month and calculate inquiry rates
        const monthlyData: { [key: number]: { inquiries: number; views: number } } = {};

        for (let i = 0; i < 12; i++) {
            monthlyData[i] = { inquiries: 0, views: 0 };
        }

        inquiries.forEach(inq => {
            const month = new Date(inq.created_at).getMonth();
            monthlyData[month].inquiries++;
        });

        // Get views data
        const { data: views } = await supabase
            .from('property_views')
            .select('viewed_at');

        (views || []).forEach(view => {
            const month = new Date(view.viewed_at).getMonth();
            if (monthlyData[month]) {
                monthlyData[month].views++;
            }
        });

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        return Object.entries(monthlyData).map(([month, data]) => ({
            month: parseInt(month),
            monthName: monthNames[parseInt(month)],
            inquiryRate: data.views > 0 ? (data.inquiries / data.views) * 100 : 0,
            averageViews: data.views
        }));
    } catch (err) {
        console.error('Failed to get listing timing analysis:', err);
        return [];
    }
}

/**
 * Get geographic demand data
 */
export async function getGeographicDemand(
    state?: string
): Promise<GeographicDemand[]> {
    try {
        // Get all properties grouped by city
        let query = supabase
            .from('properties')
            .select('id, city, state')
            .eq('status', 'published');

        if (state) {
            query = query.eq('state', state);
        }

        const { data: properties } = await query;

        if (!properties || properties.length === 0) {
            return [];
        }

        // Group by city
        const cityData: { [key: string]: GeographicDemand } = {};

        for (const prop of properties) {
            const key = `${prop.city}, ${prop.state}`;
            if (!cityData[key]) {
                cityData[key] = {
                    city: prop.city,
                    state: prop.state,
                    activeListings: 0,
                    totalInquiries: 0,
                    totalViews: 0,
                    demandScore: 0
                };
            }
            cityData[key].activeListings++;
        }

        // Get inquiries and views for each city
        const { data: allInquiries } = await supabase
            .from('inquiries')
            .select('listing_id');

        const { data: allViews } = await supabase
            .from('property_views')
            .select('property_id, viewer_city, viewer_state');

        // Aggregate data
        for (const city in cityData) {
            const cityProps = properties.filter(
                p => `${p.city}, ${p.state}` === city
            );
            const propIds = cityProps.map(p => p.id);

            cityData[city].totalInquiries = (allInquiries || []).filter(
                inq => propIds.includes(inq.listing_id)
            ).length;

            cityData[city].totalViews = (allViews || []).filter(
                view => propIds.includes(view.property_id)
            ).length;

            // Calculate demand score (views + inquiries * 2) / active listings
            const score = cityData[city].activeListings > 0
                ? (cityData[city].totalViews + cityData[city].totalInquiries * 2) / cityData[city].activeListings
                : 0;

            cityData[city].demandScore = Math.round(score * 10) / 10;
        }

        return Object.values(cityData).sort((a, b) => b.demandScore - a.demandScore);
    } catch (err) {
        console.error('Failed to get geographic demand:', err);
        return [];
    }
}

/**
 * Helper: Aggregate views by date
 */
function aggregateViewsByDate(views: any[]): { date: string; count: number }[] {
    const dateMap: { [key: string]: number } = {};

    views.forEach(view => {
        const date = new Date(view.viewed_at).toISOString().split('T')[0];
        dateMap[date] = (dateMap[date] || 0) + 1;
    });

    return Object.entries(dateMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate conversion rate percentage
 */
export function calculateConversionRate(views: number, inquiries: number): number {
    if (views === 0) return 0;
    return Math.round((inquiries / views) * 100 * 10) / 10;
}
