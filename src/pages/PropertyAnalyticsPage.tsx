import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye } from 'lucide-react';
import { storage, StoredProperty } from '../utils/storage';
import {
    getPropertyViewStats,
    getInquiryConversionRate,
    getPriceComparison,
    ViewStats,
    ConversionMetrics as ConversionMetricsType,
    PriceComparison
} from '../utils/analytics';
import { ViewsChart } from '../components/ViewsChart';
import { ConversionMetrics } from '../components/ConversionMetrics';
import { PriceComparisonChart } from '../components/PriceComparisonChart';
import { AnalyticsCard } from '../components/AnalyticsCard';
import { useAuth } from '../contexts/AuthContext';

export function PropertyAnalyticsPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [property, setProperty] = useState<StoredProperty | null>(null);
    const [viewStats, setViewStats] = useState<ViewStats | null>(null);
    const [conversionMetrics, setConversionMetrics] = useState<ConversionMetricsType | null>(null);
    const [priceComparison, setPriceComparison] = useState<PriceComparison | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!id) return;

            try {
                setLoading(true);

                // Fetch property details
                const prop = await storage.getProperty(id);
                if (!prop) {
                    console.error('Property not found');
                    return;
                }

                // Verify ownership
                if (prop.userId !== user?.id && user?.role !== 'admin') {
                    console.error('Unauthorized access');
                    return;
                }

                setProperty(prop);

                // Fetch analytics data
                const [views, conversion, price] = await Promise.all([
                    getPropertyViewStats(id),
                    getInquiryConversionRate(id),
                    getPriceComparison(prop)
                ]);

                setViewStats(views);
                setConversionMetrics(conversion);
                setPriceComparison(price);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [id, user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
                        <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 md:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {property.title}
                            </h1>
                            <p className="text-gray-600">
                                {property.city}, {property.state} • {property.type}
                            </p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-sm text-gray-600">Listed on</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {new Date(property.createdAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Conversion Metrics */}
                {conversionMetrics && (
                    <div className="mb-8">
                        <ConversionMetrics
                            totalViews={conversionMetrics.totalViews}
                            totalInquiries={conversionMetrics.totalInquiries}
                            conversionRate={conversionMetrics.conversionRate}
                            averageConversionRate={conversionMetrics.averageConversionRate}
                        />
                    </div>
                )}

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {viewStats && (
                        <AnalyticsCard
                            title="Unique Cities"
                            value={viewStats.uniqueCities}
                            icon={<Eye className="w-6 h-6 text-indigo-600" />}
                            subtitle="Cities where viewers are from"
                        />
                    )}
                    <AnalyticsCard
                        title="Days Listed"
                        value={Math.floor(
                            (new Date().getTime() - new Date(property.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}
                        icon={<Calendar className="w-6 h-6 text-purple-600" />}
                        subtitle="Since publication"
                    />
                </div>

                {/* Views Chart */}
                {viewStats && (
                    <div className="mb-8">
                        <ViewsChart data={viewStats.viewsByDate} />
                    </div>
                )}

                {/* Price Comparison */}
                {priceComparison && (
                    <div className="mb-8">
                        <PriceComparisonChart
                            yourPrice={priceComparison.yourPrice}
                            averagePrice={priceComparison.averagePrice}
                            minPrice={priceComparison.minPrice}
                            maxPrice={priceComparison.maxPrice}
                            similarProperties={priceComparison.similarProperties}
                        />
                    </div>
                )}

                {/* Insights */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
                    <div className="space-y-3">
                        {conversionMetrics && conversionMetrics.conversionRate < conversionMetrics.averageConversionRate && (
                            <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
                                <div className="flex-shrink-0 text-yellow-600 mr-3">💡</div>
                                <div>
                                    <p className="text-sm font-medium text-yellow-900">
                                        Your conversion rate is below average
                                    </p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Consider updating your property description, adding more photos, or adjusting your price.
                                    </p>
                                </div>
                            </div>
                        )}
                        {priceComparison && priceComparison.yourPrice > priceComparison.averagePrice * 1.2 && (
                            <div className="flex items-start p-3 bg-orange-50 rounded-lg">
                                <div className="flex-shrink-0 text-orange-600 mr-3">💰</div>
                                <div>
                                    <p className="text-sm font-medium text-orange-900">
                                        Your price is significantly above market average
                                    </p>
                                    <p className="text-sm text-orange-700 mt-1">
                                        This might be reducing inquiries. Consider adjusting to ₦{Math.round(priceComparison.averagePrice).toLocaleString()} or highlighting unique features.
                                    </p>
                                </div>
                            </div>
                        )}
                        {conversionMetrics && conversionMetrics.totalViews > 50 && conversionMetrics.totalInquiries === 0 && (
                            <div className="flex items-start p-3 bg-red-50 rounded-lg">
                                <div className="flex-shrink-0 text-red-600 mr-3">⚠️</div>
                                <div>
                                    <p className="text-sm font-medium text-red-900">
                                        High views but no inquiries
                                    </p>
                                    <p className="text-sm text-red-700 mt-1">
                                        Your listing is attracting attention but not converting. Review your pricing, photos, and description.
                                    </p>
                                </div>
                            </div>
                        )}
                        {conversionMetrics && conversionMetrics.conversionRate > conversionMetrics.averageConversionRate * 1.5 && (
                            <div className="flex items-start p-3 bg-green-50 rounded-lg">
                                <div className="flex-shrink-0 text-green-600 mr-3">🎉</div>
                                <div>
                                    <p className="text-sm font-medium text-green-900">
                                        Excellent performance!
                                    </p>
                                    <p className="text-sm text-green-700 mt-1">
                                        Your listing is performing well above average. Keep up the great work!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
