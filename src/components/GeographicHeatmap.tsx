import { MapPin } from 'lucide-react';

interface GeographicHeatmapProps {
    data: {
        city: string;
        state: string;
        activeListings: number;
        totalInquiries: number;
        totalViews: number;
        demandScore: number;
    }[];
    loading?: boolean;
}

export function GeographicHeatmap({ data, loading = false }: GeographicHeatmapProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const getDemandColor = (score: number) => {
        if (score >= 20) return 'bg-red-500';
        if (score >= 15) return 'bg-orange-500';
        if (score >= 10) return 'bg-yellow-500';
        if (score >= 5) return 'bg-green-500';
        return 'bg-blue-500';
    };

    const getDemandLabel = (score: number) => {
        if (score >= 20) return 'Very High';
        if (score >= 15) return 'High';
        if (score >= 10) return 'Medium';
        if (score >= 5) return 'Low';
        return 'Very Low';
    };

    const getDemandTextColor = (score: number) => {
        if (score >= 20) return 'text-red-700';
        if (score >= 15) return 'text-orange-700';
        if (score >= 10) return 'text-yellow-700';
        if (score >= 5) return 'text-green-700';
        return 'text-blue-700';
    };

    const getDemandBgColor = (score: number) => {
        if (score >= 20) return 'bg-red-50';
        if (score >= 15) return 'bg-orange-50';
        if (score >= 10) return 'bg-yellow-50';
        if (score >= 5) return 'bg-green-50';
        return 'bg-blue-50';
    };

    // Sort by demand score descending
    const sortedData = [...data].sort((a, b) => b.demandScore - a.demandScore);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Geographic Demand Heatmap</h3>
                <p className="text-sm text-gray-600">
                    Property demand by location based on views and inquiries
                </p>
            </div>

            {sortedData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>No geographic data available</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3 mb-6">
                        {sortedData.slice(0, 10).map((location) => (
                            <div
                                key={`${location.city}-${location.state}`}
                                className={`${getDemandBgColor(location.demandScore)} rounded-lg p-4 border border-gray-200`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start flex-1">
                                        <div className={`${getDemandColor(location.demandScore)} w-2 h-full rounded-full mr-3`}></div>
                                        <div className="flex-1">
                                            <div className="flex items-center mb-2">
                                                <MapPin className="w-4 h-4 text-gray-600 mr-1" />
                                                <h4 className="font-semibold text-gray-900">
                                                    {location.city}, {location.state}
                                                </h4>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Listings</p>
                                                    <p className="font-semibold text-gray-900">{location.activeListings}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Views</p>
                                                    <p className="font-semibold text-gray-900">{location.totalViews}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Inquiries</p>
                                                    <p className="font-semibold text-gray-900">{location.totalInquiries}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-4 text-right">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDemandTextColor(location.demandScore)} ${getDemandBgColor(location.demandScore)} border ${getDemandColor(location.demandScore).replace('bg-', 'border-')}`}>
                                            {getDemandLabel(location.demandScore)}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Score: {location.demandScore}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Demand Level Guide</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="flex items-center text-sm">
                                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                                <span className="text-gray-600">Very High (≥20)</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                                <span className="text-gray-600">High (15-20)</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                                <span className="text-gray-600">Medium (10-15)</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                                <span className="text-gray-600">Low (5-10)</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                                <span className="text-gray-600">Very Low (\u003c5)</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            * Demand score is calculated based on views and inquiries per active listing
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
