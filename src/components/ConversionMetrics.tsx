import { Eye, MessageSquare, TrendingUp } from 'lucide-react';
import { AnalyticsCard } from './AnalyticsCard';

interface ConversionMetricsProps {
    totalViews: number;
    totalInquiries: number;
    conversionRate: number;
    averageConversionRate: number;
    loading?: boolean;
}

export function ConversionMetrics({
    totalViews,
    totalInquiries,
    conversionRate,
    averageConversionRate,
    loading = false
}: ConversionMetricsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    const trendValue = averageConversionRate > 0
        ? ((conversionRate - averageConversionRate) / averageConversionRate) * 100
        : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnalyticsCard
                title="Total Views"
                value={totalViews.toLocaleString()}
                icon={<Eye className="w-6 h-6 text-blue-600" />}
                subtitle="All-time property views"
            />

            <AnalyticsCard
                title="Total Inquiries"
                value={totalInquiries.toLocaleString()}
                icon={<MessageSquare className="w-6 h-6 text-green-600" />}
                subtitle="Contact requests received"
            />

            <AnalyticsCard
                title="Conversion Rate"
                value={`${conversionRate.toFixed(1)}%`}
                icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
                trend={{
                    value: Math.round(Math.abs(trendValue)),
                    isPositive: trendValue >= 0
                }}
                subtitle={`Average: ${averageConversionRate.toFixed(1)}%`}
            />
        </div>
    );
}
