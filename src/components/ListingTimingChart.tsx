import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ListingTimingChartProps {
    data: {
        month: number;
        monthName: string;
        inquiryRate: number;
        averageViews: number;
    }[];
    loading?: boolean;
}

export function ListingTimingChart({ data, loading = false }: ListingTimingChartProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-64 bg-gray-100 rounded"></div>
                </div>
            </div>
        );
    }

    // Find the best month (highest inquiry rate)
    const bestMonth = data.reduce((best, current) =>
        current.inquiryRate > best.inquiryRate ? current : best
        , data[0] || { monthName: '', inquiryRate: 0 });

    // Color bars based on inquiry rate
    const getBarColor = (inquiryRate: number) => {
        if (inquiryRate >= 5) return '#10b981'; // green
        if (inquiryRate >= 3) return '#3b82f6'; // blue
        if (inquiryRate >= 1) return '#f59e0b'; // orange
        return '#ef4444'; // red
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Time to List</h3>
                <p className="text-sm text-gray-600">
                    Inquiry rate by month based on historical data
                </p>
                {bestMonth && (
                    <div className="mt-3 inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                        <span className="mr-1">🎯</span>
                        Best month: {bestMonth.monthName} ({bestMonth.inquiryRate.toFixed(1)}% inquiry rate)
                    </div>
                )}
            </div>

            {data.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>Not enough data to show timing analysis</p>
                </div>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="monthName"
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                                label={{ value: 'Inquiry Rate (%)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '8px 12px'
                                }}
                                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Inquiry Rate']}
                            />
                            <Bar
                                dataKey="inquiryRate"
                                radius={[8, 8, 0, 0]}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.inquiryRate)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center text-sm">
                            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                            <span className="text-gray-600">Excellent (≥5%)</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                            <span className="text-gray-600">Good (3-5%)</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                            <span className="text-gray-600">Fair (1-3%)</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                            <span className="text-gray-600">Low (\u003c1%)</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
