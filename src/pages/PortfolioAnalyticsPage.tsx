import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp } from 'lucide-react';
import { storage, StoredProperty } from '../utils/storage';
import {
    getListingTimingAnalysis,
    getGeographicDemand,
    getInquiryConversionRate,
    ListingTiming,
    GeographicDemand as GeographicDemandType
} from '../utils/analytics';
import { ListingTimingChart } from '../components/ListingTimingChart';
import { GeographicHeatmap } from '../components/GeographicHeatmap';
import { AnalyticsCard } from '../components/AnalyticsCard';
import { useAuth } from '../contexts/AuthContext';

export function PortfolioAnalyticsPage() {
    const { user } = useAuth();
    const [properties, setProperties] = useState<StoredProperty[]>([]);
    const [timingData, setTimingData] = useState<ListingTiming[]>([]);
    const [geographicData, setGeographicData] = useState<GeographicDemandType[]>([]);
    const [portfolioMetrics, setPortfolioMetrics] = useState({
        totalViews: 0,
        totalInquiries: 0,
        avgConversionRate: 0,
        totalProperties: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPortfolioAnalytics = async () => {
            if (!user) return;

            try {
                setLoading(true);

                // Fetch user's properties
                const userProps = await storage.getUserProperties(user.id);
                setProperties(userProps);

                // Fetch timing and geographic data
                const [timing, geographic] = await Promise.all([
                    getListingTimingAnalysis(),
                    getGeographicDemand()
                ]);

                setTimingData(timing);
                setGeographicData(geographic);

                // Calculate portfolio-wide metrics
                let totalViews = 0;
                let totalInquiries = 0;
                let totalConversionRate = 0;

                for (const prop of userProps) {
                    const metrics = await getInquiryConversionRate(prop.id);
                    totalViews += metrics.totalViews;
                    totalInquiries += metrics.totalInquiries;
                    totalConversionRate += metrics.conversionRate;
                }

                setPortfolioMetrics({
                    totalViews,
                    totalInquiries,
                    avgConversionRate: userProps.length > 0 ? totalConversionRate / userProps.length : 0,
                    totalProperties: userProps.length
                });
            } catch (error) {
                console.error('Error fetching portfolio analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolioAnalytics();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Portfolio Analytics
                    </h1>
                    <p className="text-gray-600">
                        Comprehensive insights across all your properties
                    </p>
                </div>

                {/* Portfolio Overview Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <AnalyticsCard
                        title="Total Properties"
                        value={portfolioMetrics.totalProperties}
                        icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
                        subtitle="Active listings"
                    />
                    <AnalyticsCard
                        title="Total Views"
                        value={portfolioMetrics.totalViews.toLocaleString()}
                        icon={<TrendingUp className="w-6 h-6 text-green-600" />}
                        subtitle="Across all properties"
                    />
                    <AnalyticsCard
                        title="Total Inquiries"
                        value={portfolioMetrics.totalInquiries.toLocaleString()}
                        icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
                        subtitle="Contact requests"
                    />
                    <AnalyticsCard
                        title="Avg Conversion"
                        value={`${portfolioMetrics.avgConversionRate.toFixed(1)}%`}
                        icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
                        subtitle="Portfolio average"
                    />
                </div>

                {/* Property Performance Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Property Performance</h3>
                    </div>
                    {properties.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500 mb-4">You haven't posted any properties yet.</p>
                            <Link
                                to="/create-listing"
                                className="text-blue-600 font-medium hover:text-blue-700"
                            >
                                Create your first listing →
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Property
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {properties.map((property) => (
                                        <tr key={property.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <img
                                                        src={property.images[0]}
                                                        alt=""
                                                        className="h-10 w-10 rounded-lg object-cover mr-3"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{property.title}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {property.city}, {property.state}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${property.status === 'published'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    {property.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                ₦{property.price.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    to={`/dashboard/properties/${property.id}/analytics`}
                                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                >
                                                    View Analytics →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Geographic Demand Heatmap */}
                <div className="mb-8">
                    <GeographicHeatmap data={geographicData} loading={loading} />
                </div>

                {/* Listing Timing Analysis */}
                <div className="mb-8">
                    <ListingTimingChart data={timingData} loading={loading} />
                </div>

                {/* Market Insights */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
                    <div className="space-y-3">
                        {geographicData.length > 0 && (
                            <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                                <div className="flex-shrink-0 text-blue-600 mr-3">📍</div>
                                <div>
                                    <p className="text-sm font-medium text-blue-900">
                                        Top Market: {geographicData[0].city}, {geographicData[0].state}
                                    </p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        This location has the highest demand score ({geographicData[0].demandScore}) with{' '}
                                        {geographicData[0].totalInquiries} inquiries and {geographicData[0].totalViews} views.
                                    </p>
                                </div>
                            </div>
                        )}
                        {timingData.length > 0 && (() => {
                            const bestMonth = timingData.reduce((best, current) =>
                                current.inquiryRate > best.inquiryRate ? current : best
                            );
                            return (
                                <div className="flex items-start p-3 bg-green-50 rounded-lg">
                                    <div className="flex-shrink-0 text-green-600 mr-3">📅</div>
                                    <div>
                                        <p className="text-sm font-medium text-green-900">
                                            Best Listing Month: {bestMonth.monthName}
                                        </p>
                                        <p className="text-sm text-green-700 mt-1">
                                            Properties listed in {bestMonth.monthName} historically have a{' '}
                                            {bestMonth.inquiryRate.toFixed(1)}% inquiry rate.
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}
                        <div className="flex items-start p-3 bg-purple-50 rounded-lg">
                            <div className="flex-shrink-0 text-purple-600 mr-3">💡</div>
                            <div>
                                <p className="text-sm font-medium text-purple-900">
                                    Portfolio Tip
                                </p>
                                <p className="text-sm text-purple-700 mt-1">
                                    Focus on improving properties with low conversion rates. Update photos, descriptions,
                                    and pricing to match market expectations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
